import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import Order from "@/models/Order";
import Shoe from "@/models/Shoe";
import { IndianRupee, Package, ShoppingCart, AlertTriangle } from "lucide-react";

async function getBusinessMetrics() {
  await connectToDatabase();

  // Total Revenue: Sum of amount from orders where status is paid, shipped, or delivered
  const revenueResult = await Order.aggregate([
    {
      $match: {
        status: { $in: ["paid", "shipped", "delivered"] }
      }
    },
    {
      $group: {
        _id: null,
        total: { $sum: "$amount" }
      }
    }
  ]);

  const totalRevenue = revenueResult[0]?.total || 0;

  // Sales Count: Total number of successful orders
  const salesCount = await Order.countDocuments({
    status: { $in: ["paid", "shipped", "delivered"] }
  });

  // Pending Fulfillment: Count of orders where status is strictly paid
  const pendingFulfillment = await Order.countDocuments({
    status: "paid"
  });

  // Inventory Alert: Number of variants across all shoes where stock is less than 5
  const inventoryAlertResult = await Shoe.aggregate([
    { $unwind: "$variants" },
    { $match: { "variants.stock": { $lt: 5 } } },
    { $count: "lowStockVariants" }
  ]);

  const inventoryAlert = inventoryAlertResult[0]?.lowStockVariants || 0;

  return {
    totalRevenue,
    salesCount,
    pendingFulfillment,
    inventoryAlert,
  };
}

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "admin") redirect("/");

  const metrics = await getBusinessMetrics();

  const metricCards = [
    {
      title: "Total Revenue",
      value: `₹${metrics.totalRevenue.toLocaleString('en-IN')}`,
      icon: IndianRupee,
      color: "text-green-600 bg-green-50 border-green-200",
      description: "From paid, shipped, and delivered orders",
    },
    {
      title: "Sales Count",
      value: metrics.salesCount.toLocaleString(),
      icon: Package,
      color: "text-blue-600 bg-blue-50 border-blue-200",
      description: "Total successful orders",
    },
    {
      title: "Pending Fulfillment",
      value: metrics.pendingFulfillment.toLocaleString(),
      icon: ShoppingCart,
      color: "text-yellow-600 bg-yellow-50 border-yellow-200",
      description: "Orders ready to ship",
    },
    {
      title: "Inventory Alert",
      value: metrics.inventoryAlert.toLocaleString(),
      icon: AlertTriangle,
      color: "text-red-600 bg-red-50 border-red-200",
      description: "Variants with low stock (< 5)",
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-semibold">Admin Dashboard</h1>
        <p className="mt-2 text-gray-600">Business overview and metrics</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {metricCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.title} className="rounded-2xl border border-gray-200 bg-white p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">{card.title}</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900">{card.value}</p>
                  <p className="mt-1 text-xs text-gray-500">{card.description}</p>
                </div>
                <div className={`rounded-full border p-3 ${card.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <a
            href="/admin/shoes"
            className="rounded-xl border border-gray-200 bg-white p-4 hover:shadow-lg transition-shadow"
          >
            <Package className="h-8 w-8 text-blue-600 mb-3" />
            <h3 className="font-semibold">Manage Products</h3>
            <p className="mt-1 text-sm text-gray-600">Update inventory and product details</p>
          </a>
          <a
            href="/admin/orders"
            className="rounded-xl border border-gray-200 bg-white p-4 hover:shadow-lg transition-shadow"
          >
            <ShoppingCart className="h-8 w-8 text-green-600 mb-3" />
            <h3 className="font-semibold">Manage Orders</h3>
            <p className="mt-1 text-sm text-gray-600">Process and fulfill customer orders</p>
          </a>
          <a
            href="/admin/shoes/new"
            className="rounded-xl border border-gray-200 bg-white p-4 hover:shadow-lg transition-shadow"
          >
            <Package className="h-8 w-8 text-purple-600 mb-3" />
            <h3 className="font-semibold">Add New Product</h3>
            <p className="mt-1 text-sm text-gray-600">Create a new shoe listing</p>
          </a>
        </div>
      </div>
    </div>
  );
}
