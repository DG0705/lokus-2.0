import crypto from "crypto";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/api-response";
import { connectToDatabase } from "@/lib/db";
import Order from "@/models/Order";
import Shoe from "@/models/Shoe";
import { verifyPaymentSchema } from "@/schemas/payment.schema";

type CartItem = {
  shoeId: string;
  variantId: string;
  quantity: number;
};

class RouteError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

function combineCartItems(cartItems: CartItem[]) {
  const grouped = new Map<string, CartItem>();

  for (const item of cartItems) {
    const key = `${item.shoeId}:${item.variantId}`;
    const existing = grouped.get(key);

    if (existing) {
      existing.quantity += item.quantity;
      continue;
    }

    grouped.set(key, { ...item });
  }

  return [...grouped.values()];
}

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

  const cartItems = combineCartItems(parsed.data.cartItems);
  await connectToDatabase();
  const dbSession = await mongoose.startSession();
  let savedOrderId = "";
  let alreadyVerified = false;

  try {
    await dbSession.withTransaction(async () => {
      const existingOrder = await Order.findOne({
        $or: [
          { "payment.razorpayPaymentId": parsed.data.razorpayPaymentId },
          { "payment.razorpayOrderId": parsed.data.razorpayOrderId },
        ],
      })
        .select("_id")
        .session(dbSession);

      if (existingOrder) {
        savedOrderId = existingOrder._id.toString();
        alreadyVerified = true;
        return;
      }

      const orderItems: Array<{
        shoeId: any;
        variantId: any;
        name: string;
        size: number;
        color: string;
        qty: number;
        unitPrice: number;
      }> = [];
      const touchedShoes = new Map<string, any>();
      let amount = 0;

      for (const item of cartItems) {
        const updatedShoe = await Shoe.findOneAndUpdate(
          {
            _id: item.shoeId,
            variants: {
              $elemMatch: {
                _id: item.variantId,
                stock: { $gte: item.quantity },
              },
            },
          },
          { $inc: { "variants.$.stock": -item.quantity } },
          { new: true, session: dbSession },
        );

        if (!updatedShoe) {
          const currentShoe = await Shoe.findById(item.shoeId).session(dbSession);
          if (!currentShoe) throw new RouteError("Product no longer exists", 404);

          const currentVariant = currentShoe.variants.id(item.variantId);
          if (!currentVariant) throw new RouteError("Variant no longer exists", 404);

          throw new RouteError(`Insufficient stock for ${currentShoe.name}`, 409);
        }

        const variant = updatedShoe.variants.id(item.variantId);
        if (!variant) throw new RouteError("Variant no longer exists", 404);

        touchedShoes.set(updatedShoe._id.toString(), updatedShoe);
        orderItems.push({
          shoeId: updatedShoe._id,
          variantId: variant._id,
          name: updatedShoe.name,
          size: variant.size,
          color: variant.color,
          qty: item.quantity,
          unitPrice: variant.price,
        });
        amount += variant.price * item.quantity;
      }

      for (const shoe of touchedShoes.values()) {
        const soldOut = shoe.variants.every((entry: { stock: number }) => entry.stock === 0);
        if (shoe.soldOut === soldOut) continue;

        await Shoe.updateOne({ _id: shoe._id }, { $set: { soldOut } }, { session: dbSession });
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
    }, {
      readPreference: "primary",
      readConcern: { level: "snapshot" },
      writeConcern: { w: "majority" },
    });

    if (!savedOrderId) return apiError("Payment verification did not produce an order", 500);

    return apiSuccess(
      { verified: true, orderId: savedOrderId },
      alreadyVerified ? "Payment already verified" : "Payment verified and order saved",
    );
  } catch (error) {
    if (error instanceof RouteError) return apiError(error.message, error.status);
    return apiError(error instanceof Error ? error.message : "Failed during payment verification", 500);
  } finally {
    dbSession.endSession();
  }
}
