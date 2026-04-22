import { notFound } from "next/navigation";
import { CheckCircle, Package, Truck, MapPin, Calendar } from "lucide-react";
import { connectToDatabase } from "@/lib/db";
import Order from "@/models/Order";

// Calculate estimated delivery date (5-7 business days from order date)
function calculateEstimatedDelivery(orderDate: Date): { min: Date; max: Date } {
  const businessDays = 5;
  const maxBusinessDays = 7;
  
  const addBusinessDays = (date: Date, days: number): Date => {
    const result = new Date(date);
    let remainingDays = days;
    
    while (remainingDays > 0) {
      result.setDate(result.getDate() + 1);
      const dayOfWeek = result.getDay();
      
      // Skip weekends (Saturday = 6, Sunday = 0)
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        remainingDays--;
      }
    }
    
    return result;
  };
  
  return {
    min: addBusinessDays(orderDate, businessDays),
    max: addBusinessDays(orderDate, maxBusinessDays),
  };
}

interface OrderPageProps {
  params: {
    id: string;
  };
}

export default async function OrderSuccessPage({ params }: OrderPageProps) {
  const { id } = params;
  
  try {
    await connectToDatabase();
    
    // Fetch order with populated address
    const order = await Order.findById(id)
      .populate('userId', 'name email')
      .populate('addressId')
      .lean();
    
    if (!order) {
      notFound();
    }
    
    const orderData = order as any;
    const address = orderData.addressId;
    
    // Calculate estimated delivery
    const estimatedDelivery = calculateEstimatedDelivery(new Date(orderData.createdAt));
    
    // Format date ranges
    const formatDate = (date: Date) => {
      return date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    };
    
    const deliveryRange = `${formatDate(estimatedDelivery.min)} - ${formatDate(estimatedDelivery.max)}`;
    
    return (
      <div className="max-w-4xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="mb-4 flex justify-center">
            <div className="rounded-full bg-green-100 p-4">
              <CheckCircle className="h-16 w-16 text-green-600" />
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Successful</h1>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
            <Package className="h-4 w-4" />
            <span>Order ID: {orderData._id.toString().slice(-8).toUpperCase()}</span>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Order Summary */}
          <div className="space-y-6">
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
              
              {/* Items */}
              <div className="space-y-4 mb-6">
                {orderData.items.map((item: any, index: number) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className="flex-1">
                      <h3 className="font-medium">{item.name}</h3>
                      <p className="text-sm text-gray-600">
                        Size: {item.size} | Color: {item.color} | Qty: {item.qty}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">â¹{item.unitPrice.toLocaleString('en-IN')}</p>
                      <p className="text-sm text-gray-600">â¹{(item.unitPrice * item.qty).toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Price Breakdown */}
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>â¹{orderData.amount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Shipping</span>
                  <span className="text-green-600">Free</span>
                </div>
                <div className="flex justify-between font-semibold text-lg pt-2 border-t">
                  <span>Total</span>
                  <span>â¹{orderData.amount.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* Delivery Estimate */}
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Truck className="h-5 w-5 text-blue-600" />
                Delivery Estimate
              </h2>
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                <Calendar className="h-4 w-4" />
                <span>Estimated Delivery:</span>
              </div>
              <p className="text-lg font-semibold text-blue-600">{deliveryRange}</p>
              <p className="text-xs text-gray-500 mt-1">5-7 business days</p>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="space-y-6">
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-gray-600" />
                Shipping Address
              </h2>
              
              <div className="space-y-2">
                <p className="font-medium">{address.fullName}</p>
                <p className="text-gray-600">{address.line1}</p>
                {address.line2 && <p className="text-gray-600">{address.line2}</p>}
                <p className="text-gray-600">
                  {address.city}, {address.state} {address.postalCode}
                </p>
                <p className="text-gray-600">{address.phone}</p>
              </div>
            </div>

            {/* Order Status */}
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <h2 className="text-lg font-semibold mb-4">Order Status</h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-green-100 p-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-green-600">Payment Confirmed</p>
                    <p className="text-sm text-gray-600">
                      {new Date(orderData.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-gray-100 p-2">
                    <Package className="h-4 w-4 text-gray-400" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-600">Processing</p>
                    <p className="text-sm text-gray-500">Your order is being prepared</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-gray-100 p-2">
                    <Truck className="h-4 w-4 text-gray-400" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-600">Shipped</p>
                    <p className="text-sm text-gray-500">Will be updated once shipped</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <a
                href="/account/orders"
                className="block w-full rounded-lg bg-blue-600 px-4 py-3 text-center font-semibold text-white hover:bg-blue-700 transition-colors"
              >
                View All Orders
              </a>
              <a
                href="/"
                className="block w-full rounded-lg border border-gray-300 px-4 py-3 text-center font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Continue Shopping
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error loading order:', error);
    notFound();
  }
}
