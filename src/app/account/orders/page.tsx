"use client";

import { useState, useEffect } from "react";
import { Package, ArrowRight } from "lucide-react";
import Link from "next/link";

interface Order {
  _id: string;
  items: Array<{
    name: string;
    quantity: number;
    unitPrice: number;
  }>;
  amount: number;
  status: string;
  createdAt: string;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch("/api/orders");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch orders");
      }

      setOrders(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatINR = (amount: number) => {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount / 100);
  };

  if (loading) {
    return (
      <div>
        <div className="mb-5">
          <h1 className="text-3xl font-semibold">Orders</h1>
          <p className="mt-2 text-lokus-text/70">Loading your order history...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div className="mb-5">
          <h1 className="text-3xl font-semibold">Orders</h1>
        </div>
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-3xl font-semibold">Orders</h1>
        <p className="mt-2 text-lokus-text/70">
          {orders.length > 0 
            ? `You have ${orders.length} order${orders.length > 1 ? 's' : ''}` 
            : 'Your order history'
          }
        </p>
      </div>

      {orders.length === 0 ? (
        // Premium Empty Orders State
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-6">
            <Package className="h-24 w-24 text-gray-300" />
          </div>
          <h3 className="text-2xl font-semibold text-gray-900 mb-3">No orders yet</h3>
          <p className="text-gray-600 mb-8 max-w-md">
            You haven't placed any orders yet. Browse our premium collection and place your first order to get started.
          </p>
          <Link 
            href="/category" 
            className="inline-flex items-center gap-2 rounded-full bg-[#2C2B2B] px-6 py-3 text-sm font-semibold text-white hover:bg-[#2C2B2B]/90 transition-colors"
          >
            Browse latest drops
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        // Orders List
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order._id} className="rounded-2xl border border-gray-200 bg-white p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-lg">Order #{order._id.slice(-8).toUpperCase()}</h3>
                  <p className="text-sm text-gray-600">{formatDate(order.createdAt)}</p>
                </div>
                <div className="text-right">
                  <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                    order.status === 'delivered' 
                      ? 'bg-green-100 text-green-800'
                      : order.status === 'shipped'
                      ? 'bg-blue-100 text-blue-800'
                      : order.status === 'paid'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                  <p className="text-lg font-semibold mt-2">{formatINR(order.amount)}</p>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Items ({order.items.length})</h4>
                <div className="space-y-2">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span>{item.name} × {item.quantity}</span>
                      <span>{formatINR(item.unitPrice * item.quantity)}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="mt-4 flex justify-end">
                <Link 
                  href={`/checkout/success/${order._id}`}
                  className="text-sm font-medium text-[#B58B6B] hover:text-[#B58B6B]/80 transition-colors"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
