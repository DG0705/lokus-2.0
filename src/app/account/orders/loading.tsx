import OrderRowSkeleton from "@/components/orders/OrderRowSkeleton";

export default function OrdersLoading() {
  return (
    <div>
      <div className="mb-5">
        <h1 className="text-3xl font-semibold">Loading Orders</h1>
        <p className="mt-2 text-lokus-text/70">Fetching your order history...</p>
      </div>
      
      {/* Table of Skeletons */}
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
            {Array.from({ length: 5 }).map((_, index) => (
              <OrderRowSkeleton key={index} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
