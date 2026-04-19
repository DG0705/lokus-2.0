import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import Order from "@/models/Order";
import AdminOrdersClient from "./AdminOrdersClient";

export default async function AdminOrdersPage() {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "admin") redirect("/");

  try {
    await connectToDatabase();
    const orders = await Order.find()
      .populate('userId', 'name email')
      .populate('addressId')
      .sort({ createdAt: -1 })
      .lean();

    // Transform data to match client component interface
    const transformedOrders = orders.map((order: any) => ({
      _id: order._id.toString(),
      userId: order.userId?._id?.toString() || order.userId?.toString(),
      customer: order.userId?.name || 'Unknown Customer',
      customerEmail: order.userId?.email || 'Unknown Email',
      amount: order.amount,
      status: order.status,
      trackingNumber: order.trackingNumber,
      courierPartner: order.courierPartner,
      items: order.items || [],
      address: order.addressId,
      createdAt: order.createdAt?.toISOString() || new Date().toISOString(),
      updatedAt: order.updatedAt?.toISOString() || new Date().toISOString(),
    }));

    return <AdminOrdersClient initialOrders={transformedOrders} />;
  } catch (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
        {error instanceof Error ? error.message : "Failed to load admin orders"}
      </div>
    );
  }
}
