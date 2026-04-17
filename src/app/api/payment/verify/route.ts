import crypto from "crypto";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/api-response";
import { verifyPaymentSchema } from "@/schemas/payment.schema";
import { connectToDatabase } from "@/lib/db";
import Shoe from "@/models/Shoe";
import Order from "@/models/Order";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return apiError("Unauthorized", 401);

  const body = await request.json();
  const parsed = verifyPaymentSchema.safeParse(body);
  if (!parsed.success) return apiError(parsed.error.issues[0]?.message ?? "Invalid payload", 422);

  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET ?? "")
    .update(`${parsed.data.razorpayOrderId}|${parsed.data.razorpayPaymentId}`)
    .digest("hex");

  if (expected !== parsed.data.razorpaySignature) return apiError("Signature mismatch", 400);

  await connectToDatabase();
  const dbSession = await mongoose.startSession();
  let savedOrderId = "";

  try {
    await dbSession.withTransaction(async () => {
      const orderItems: Array<{
        shoeId: any;
        variantId: any;
        name: string;
        size: number;
        color: string;
        qty: number;
        unitPrice: number;
      }> = [];
      let amount = 0;

      for (const item of parsed.data.cartItems) {
        const shoe = await Shoe.findById(item.shoeId).session(dbSession);
        if (!shoe) throw new Error("Product no longer exists");

        const variant = shoe.variants.id(item.variantId);
        if (!variant) throw new Error("Variant no longer exists");
        if (variant.stock < item.quantity) throw new Error(`Insufficient stock for ${shoe.name}`);

        variant.stock -= item.quantity;
        shoe.soldOut = shoe.variants.every((entry: any) => entry.stock === 0);
        await shoe.save({ session: dbSession });

        orderItems.push({
          shoeId: shoe._id,
          variantId: variant._id,
          name: shoe.name,
          size: variant.size,
          color: variant.color,
          qty: item.quantity,
          unitPrice: variant.price,
        });
        amount += variant.price * item.quantity;
      }

      const created = await Order.create(
        [
          {
            userId,
            addressId: parsed.data.addressId,
            items: orderItems,
            amount,
            status: "paid",
            payment: {
              provider: "razorpay",
              razorpayOrderId: parsed.data.razorpayOrderId,
              razorpayPaymentId: parsed.data.razorpayPaymentId,
              razorpaySignature: parsed.data.razorpaySignature,
            },
          },
        ],
        { session: dbSession },
      );
      savedOrderId = created[0]._id.toString();
    });

    return apiSuccess({ verified: true, orderId: savedOrderId }, "Payment verified and order saved");
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed during payment verification", 500);
  } finally {
    dbSession.endSession();
  }
}
