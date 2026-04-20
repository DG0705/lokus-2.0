import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/api-response";
import { connectToDatabase } from "@/lib/db";
import Order from "@/models/Order";
import { getRazorpayClient } from "@/lib/razorpay";
import mongoose from "mongoose";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "admin") {
    return apiError("Unauthorized", 401);
  }

  try {
    await connectToDatabase();
    const dbSession = await mongoose.startSession();

    try {
      await dbSession.withTransaction(async () => {
        const order = await Order.findById(params.id).session(dbSession);
        if (!order) {
          return apiError("Order not found", 404);
        }

        // Check if order is eligible for refund
        const refundableStatuses = ["paid", "shipped", "delivered"];
        if (!refundableStatuses.includes(order.status)) {
          return apiError(`Order with status "${order.status}" is not eligible for refund`, 400);
        }

        // Check if already refunded
        if (order.status === "refunded") {
          return apiError("Order has already been refunded", 400);
        }

        // Check if payment ID exists
        if (!order.payment?.razorpayPaymentId) {
          return apiError("No payment ID found for this order", 400);
        }

        console.log(`Initiating refund for order ${order._id}, payment ID: ${order.payment.razorpayPaymentId}`);

        // Initiate refund with Razorpay
        const razorpay = getRazorpayClient();
        const refund = await razorpay.payments.refund(order.payment.razorpayPaymentId, {
          amount: order.amount * 100, // Razorpay expects amount in paise
        });

        console.log(`Razorpay refund initiated: ${refund.id}`);

        // Update order status to refunded
        await Order.updateOne(
          { _id: order._id },
          {
            $set: {
              status: "refunded",
              "payment.refundId": refund.id,
              "payment.refundStatus": refund.status,
              "payment.refundedAt": new Date(),
            },
          },
          { session: dbSession }
        );

        // Recover inventory for refunded order
        console.log(`Starting inventory recovery for refunded order ${order._id}`);

        for (const item of order.items) {
          await mongoose.model('Shoe').updateOne(
            { 
              _id: item.shoeId,
              "variants._id": item.variantId 
            },
            { 
              $inc: { "variants.$.stock": item.qty }
            },
            { session: dbSession }
          );

          // Update soldOut status if needed
          const shoe = await mongoose.model('Shoe').findById(item.shoeId).session(dbSession);
          if (shoe) {
            const soldOut = shoe.variants.every((v: any) => v.stock === 0);
            if (shoe.soldOut !== soldOut) {
              await mongoose.model('Shoe').updateOne(
                { _id: item.shoeId },
                { $set: { soldOut } },
                { session: dbSession }
              );
            }
          }

          console.log(`Recovered ${item.qty} units for variant ${item.variantId}`);
        }

        console.log(`Refund and inventory recovery completed for order ${order._id}`);

        return apiSuccess(
          {
            orderId: order._id,
            refundId: refund.id,
            refundStatus: refund.status,
            amount: order.amount,
          },
          "Refund processed successfully and inventory recovered"
        );
      });

      return apiSuccess({ success: true }, "Refend transaction completed");
    } finally {
      dbSession.endSession();
    }
  } catch (error) {
    console.error("Refund processing error:", error);
    
    // Handle Razorpay specific errors
    if (error instanceof Error) {
      if (error.message.includes("BAD_REQUEST_ERROR")) {
        return apiError("Invalid refund request", 400);
      }
      if (error.message.includes("GATEWAY_ERROR")) {
        return apiError("Payment gateway error, please try again", 502);
      }
    }
    
    return apiError(error instanceof Error ? error.message : "Failed to process refund", 500);
  }
}
