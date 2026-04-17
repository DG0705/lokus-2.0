import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/api-response";
import { connectToDatabase } from "@/lib/db";
import Order from "@/models/Order";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return apiError("Unauthorized", 401);

  await connectToDatabase();
  const order = await Order.findOne({ _id: params.id, userId }).lean();
  if (!order) return apiError("Order not found", 404);
  return apiSuccess(order);
}
