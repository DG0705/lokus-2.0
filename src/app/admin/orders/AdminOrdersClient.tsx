"use client";

import { useState } from "react";
import { Package, Truck, CheckCircle, Clock, XCircle, AlertCircle, Edit2, Save, X, User, Calendar, IndianRupee } from "lucide-react";

interface OrderItem {
  shoeId: string;
  variantId: string;
  name: string;
  size: number;
  color: string;
  qty: number;
  unitPrice: number;
}

interface Order {
  _id: string;
  userId: string;
  customer: string;
  customerEmail: string;
  amount: number;
  status: "pending" | "paid" | "failed" | "shipped" | "delivered";
  trackingNumber?: string;
  courierPartner?: string;
  items: OrderItem[];
  address?: any;
  createdAt: string;
  updatedAt: string;
}

interface AdminOrdersClientProps {
  initialOrders: Order[];
}

const statusConfig = {
  pending: { icon: Clock, color: "text-yellow-600 bg-yellow-50 border-yellow-200", label: "Pending" },
  paid: { icon: IndianRupee, color: "text-blue-600 bg-blue-50 border-blue-200", label: "Paid" },
  failed: { icon: XCircle, color: "text-red-600 bg-red-50 border-red-200", label: "Failed" },
  shipped: { icon: Truck, color: "text-purple-600 bg-purple-50 border-purple-200", label: "Shipped" },
  delivered: { icon: CheckCircle, color: "text-green-600 bg-green-50 border-green-200", label: "Delivered" },
};

export default function AdminOrdersClient({ initialOrders }: AdminOrdersClientProps) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [editingOrder, setEditingOrder] = useState<string | null>(null);
  const [savingOrder, setSavingOrder] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<{ status: string; trackingNumber: string; courierPartner: string }>({
    status: "",
    trackingNumber: "",
    courierPartner: "",
  });

  const startEditing = (order: Order) => {
    setEditingOrder(order._id);
    setFormData({
      status: order.status,
      trackingNumber: order.trackingNumber || "",
      courierPartner: order.courierPartner || "",
    });
    setError(null);
  };

  const cancelEditing = () => {
    setEditingOrder(null);
    setFormData({ status: "", trackingNumber: "", courierPartner: "" });
    setError(null);
  };

  const saveOrder = async (orderId: string) => {
    setSavingOrder(orderId);
    setError(null);

    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update order');
      }

      // Update order in state
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order._id === orderId ? { ...order, ...data.data } : order
        )
      );

      cancelEditing();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save changes');
    } finally {
      setSavingOrder(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-semibold">Order Management</h1>
        <p className="mt-2 text-gray-600">Manage and fulfill customer orders</p>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        </div>
      )}

      {orders.length === 0 ? (
        <div className="text-center py-12">
          <Package className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
          <p className="text-gray-500">Orders will appear here when customers make purchases.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Order ID</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Customer</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Date</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Amount</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const isEditing = editingOrder === order._id;
                const isSaving = savingOrder === order._id;
                const StatusIcon = statusConfig[order.status].icon;
                const statusColor = statusConfig[order.status].color;

                return (
                  <tr key={order._id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <span className="font-mono text-sm">{order._id.slice(-8)}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <div>
                          <div className="font-medium">{order.customer}</div>
                          <div className="text-sm text-gray-500">{order.customerEmail}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="h-4 w-4" />
                        {formatDate(order.createdAt)}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1 font-semibold">
                        <IndianRupee className="h-4 w-4" />
                        {order.amount.toLocaleString('en-IN')}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {isEditing ? (
                        <select
                          value={formData.status}
                          onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                          className="rounded-lg border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                          <option value="pending">Pending</option>
                          <option value="paid">Paid</option>
                          <option value="failed">Failed</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                        </select>
                      ) : (
                        <div className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs font-medium ${statusColor}`}>
                          <StatusIcon className="h-3 w-3" />
                          {statusConfig[order.status].label}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {isEditing ? (
                        <div className="space-y-2">
                          <div className="flex gap-2">
                            <input
                              type="text"
                              placeholder="Tracking number"
                              value={formData.trackingNumber}
                              onChange={(e) => setFormData({ ...formData, trackingNumber: e.target.value })}
                              className="flex-1 rounded-lg border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                            <input
                              type="text"
                              placeholder="Courier partner"
                              value={formData.courierPartner}
                              onChange={(e) => setFormData({ ...formData, courierPartner: e.target.value })}
                              className="flex-1 rounded-lg border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => saveOrder(order._id)}
                              disabled={isSaving}
                              className="flex items-center gap-1 rounded-lg bg-green-600 px-2 py-1 text-xs font-medium text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Save className="h-3 w-3" />
                              {isSaving ? 'Saving...' : 'Save'}
                            </button>
                            <button
                              onClick={cancelEditing}
                              className="flex items-center gap-1 rounded-lg border border-gray-300 px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50"
                            >
                              <X className="h-3 w-3" />
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => startEditing(order)}
                          className="flex items-center gap-1 rounded-lg bg-blue-600 px-2 py-1 text-xs font-medium text-white hover:bg-blue-700"
                        >
                          <Edit2 className="h-3 w-3" />
                          Manage
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
