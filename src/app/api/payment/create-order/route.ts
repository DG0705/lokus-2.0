import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/api-response";
import { connectToDatabase } from "@/lib/db";
import Shoe from "@/models/Shoe";
import { createPaymentOrderSchema } from "@/schemas/payment.schema";
import { getRazorpayClient } from "@/lib/razorpay";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!(session?.user as any)?.id) return apiError("Unauthorized", 401);

  const body = await request.json();
  const parsed = createPaymentOrderSchema.safeParse(body);
  if (!parsed.success) return apiError(parsed.error.issues[0]?.message ?? "Invalid payload", 422);

  await connectToDatabase();
  let amount = 0;

  for (const item of parsed.data.cartItems) {
    const shoe = await Shoe.findById(item.shoeId).lean();
    if (!shoe) return apiError("Product missing", 404);
    const variant = (shoe as any).variants.find((v: any) => v._id.toString() === item.variantId);
    if (!variant) return apiError("Variant missing", 404);
    if (variant.stock < item.quantity) return apiError(`Only ${variant.stock} left`, 409);
    amount += variant.price * item.quantity;
  }

  const razorpay = getRazorpayClient();
  const order = await razorpay.orders.create({ amount, currency: "INR", receipt: `lokus-${Date.now()}` });
  return apiSuccess({ orderId: order.id, amount, currency: "INR", key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID }, "Order created");
}
