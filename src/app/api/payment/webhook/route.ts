import crypto from "crypto";
import mongoose from "mongoose";
import { apiError, apiSuccess } from "@/lib/api-response";
import { connectToDatabase } from "@/lib/db";
import Order from "@/models/Order";
import Shoe from "@/models/Shoe";

// Webhook signature verification
function verifyWebhookSignature(body: string, signature: string): boolean {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("RAZORPAY_WEBHOOK_SECRET environment variable is not set");
    return false;
  }

  const expected = crypto
    .createHmac("sha256", webhookSecret)
    .update(body)
    .digest("hex");

  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}

// Inventory recovery for failed payments
async function recoverInventory(orderId: string) {
  try {
    const order = await Order.findById(orderId).populate('items.shoeId').lean();
    if (!order) {
      console.error(`Order ${orderId} not found for inventory recovery`);
      return;
    }

    console.log(`Starting inventory recovery for order ${orderId}`);

    // Update stock for each item in the order
    const orderData = order as any;
    for (const item of orderData.items) {
      await Shoe.updateOne(
        { 
          _id: item.shoeId,
          "variants._id": item.variantId 
        },
        { 
          $inc: { "variants.$.stock": item.qty }
        }
      );

      // Update soldOut status if needed
      const shoe = await Shoe.findById(item.shoeId);
      if (shoe) {
        const soldOut = shoe.variants.every((v: any) => v.stock === 0);
        if (shoe.soldOut !== soldOut) {
          await Shoe.updateOne(
            { _id: item.shoeId },
            { $set: { soldOut } }
          );
        }
      }

      console.log(`Recovered ${item.qty} units for variant ${item.variantId}`);
    }

    console.log(`Inventory recovery completed for order ${orderId}`);
  } catch (error) {
    console.error(`Inventory recovery failed for order ${orderId}:`, error);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const signature = request.headers.get("x-razorpay-signature");

    if (!signature) {
      console.error("Webhook request missing signature");
      return apiError("Missing signature", 400);
    }

    // Verify webhook signature
    if (!verifyWebhookSignature(body, signature)) {
      console.error("Webhook signature verification failed");
      return apiError("Invalid signature", 400);
    }

    const event = JSON.parse(body);
    console.log(`Received webhook event: ${event.event}`, {
      eventId: event.id,
      orderId: event.payload?.order?.entity?.id,
      paymentId: event.payload?.payment?.entity?.id,
    });

    await connectToDatabase();
    const dbSession = await mongoose.startSession();

    try {
      await dbSession.withTransaction(async () => {
        switch (event.event) {
          case "order.paid": {
            const razorpayOrderId = event.payload.order.entity.id;
            const razorpayPaymentId = event.payload.payment.entity.id;

            console.log(`Processing order.paid event for order ${razorpayOrderId}, payment ${razorpayPaymentId}`);

            // Check if order already exists (idempotent check)
            const existingOrder = await Order.findOne({
              "payment.razorpayOrderId": razorpayOrderId,
            }).session(dbSession);

            if (existingOrder) {
              console.log(`Order ${razorpayOrderId} already processed, skipping`);
              return apiSuccess({ processed: false, reason: "Order already processed" }, "Event ignored - order already exists");
            }

            // Find any pending order with this razorpay order ID
            const pendingOrder = await Order.findOne({
              "payment.razorpayOrderId": razorpayOrderId,
              status: "pending",
            }).session(dbSession);

            if (pendingOrder) {
              // Update existing pending order
              await Order.updateOne(
                { _id: pendingOrder._id },
                {
                  $set: {
                    status: "paid",
                    "payment.razorpayPaymentId": razorpayPaymentId,
                    "payment.razorpaySignature": "webhook_verified",
                  },
                },
                { session: dbSession }
              );

              console.log(`Updated pending order ${pendingOrder._id} to paid status`);
              return apiSuccess({ processed: true, orderId: pendingOrder._id }, "Order status updated to paid");
            }

            console.log(`No pending order found for razorpay order ${razorpayOrderId}`);
            break;
          }

          case "payment.failed": {
            const razorpayOrderId = event.payload.order.entity.id;
            const razorpayPaymentId = event.payload.payment.entity.id;

            console.log(`Processing payment.failed event for order ${razorpayOrderId}, payment ${razorpayPaymentId}`);

            // Find order with this payment ID
            const order = await Order.findOne({
              "payment.razorpayOrderId": razorpayOrderId,
            }).session(dbSession);

            if (!order) {
              console.log(`No order found for razorpay order ${razorpayOrderId}`);
              break;
            }

            // Only update if not already failed
            if (order.status !== "failed") {
              await Order.updateOne(
                { _id: order._id },
                {
                  $set: {
                    status: "failed",
                    "payment.razorpayPaymentId": razorpayPaymentId,
                    "payment.razorpaySignature": "webhook_failed",
                  },
                },
                { session: dbSession }
              );

              console.log(`Updated order ${order._id} to failed status`);

              // Recover inventory for failed payment
              await recoverInventory(order._id.toString());
            } else {
              console.log(`Order ${order._id} already marked as failed`);
            }

            return apiSuccess({ processed: true, orderId: order._id }, "Order marked as failed and inventory recovered");
          }

          default:
            console.log(`Unhandled webhook event: ${event.event}`);
            return apiSuccess({ processed: false, reason: "Event not handled" }, "Event ignored");
        }
      });

      return apiSuccess({ received: true }, "Webhook processed successfully");
    } finally {
      dbSession.endSession();
    }
  } catch (error) {
    console.error("Webhook processing error:", error);
    return apiError(error instanceof Error ? error.message : "Webhook processing failed", 500);
  }
}
