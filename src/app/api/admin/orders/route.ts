import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/api-response";
import { connectToDatabase } from "@/lib/db";
import Order from "@/models/Order";

export async function GET() {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "admin") {
    return apiError("Unauthorized", 401);
  }

  try {
    await connectToDatabase();
    
    const orders = await Order.find()
      .populate('userId', 'name email')
      .populate('addressId')
      .sort({ createdAt: -1 })
      .lean();

    return apiSuccess(orders);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to fetch orders", 500);
  }
}
