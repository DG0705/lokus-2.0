import { Truck, Package, RefreshCw, Shield, Clock, MapPin } from "lucide-react";

export default function ShippingReturnsPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Shipping & Returns</h1>
        <p className="text-xl text-gray-600">
          Everything you need to know about delivery and our return policy.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-12 mb-16">
        {/* Shipping Section */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <Truck className="w-8 h-8 text-blue-600" />
            <h2 className="text-2xl font-semibold text-gray-900">Shipping Information</h2>
          </div>

          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                Delivery Timeline
              </h3>
              <p className="text-gray-600 mb-3">
                Standard delivery takes <strong>5-7 business days</strong> from the date of shipment.
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Order processing: 1-2 business days</li>
                <li>• Shipping time: 4-5 business days</li>
                <li>• Total delivery time: 5-7 business days</li>
              </ul>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Package className="w-5 h-5 text-blue-600" />
                Shipping Charges
              </h3>
              <ul className="text-gray-600 space-y-2">
                <li>• <strong>Free shipping</strong> on orders above ₹5,000</li>
                <li>• Standard shipping: ₹150 for orders below ₹5,000</li>
                <li>• Premium delivery: ₹300 for remote locations</li>
              </ul>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-600" />
                Service Areas
              </h3>
              <p className="text-gray-600 mb-3">
                We ship across India including all major cities and most remote locations.
              </p>
              <p className="text-sm text-gray-600">
                Premium delivery charges apply for North East states, Ladakh, Andaman & Nicobar Islands, and Lakshadweep.
              </p>
            </div>
          </div>
        </div>

        {/* Returns Section */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <RefreshCw className="w-8 h-8 text-green-600" />
            <h2 className="text-2xl font-semibold text-gray-900">Return Policy</h2>
          </div>

          <div className="space-y-6">
            <div className="bg-green-50 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Clock className="w-5 h-5 text-green-600" />
                7-Day Return Window
              </h3>
              <p className="text-gray-600 mb-3">
                You can return products within <strong>7 days</strong> from the date of delivery.
              </p>
              <p className="text-sm text-gray-600">
                The 7-day period starts from when you receive the order, not from the order date.
              </p>
            </div>

            <div className="bg-green-50 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-600" />
                Return Conditions
              </h3>
              <p className="text-gray-600 mb-3">Products must meet the following conditions:</p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Unused and unworn</li>
                <li>• Original packaging intact</li>
                <li>• All tags and labels attached</li>
                <li>• No damage or stains</li>
                <li>• Original receipt or order number</li>
              </ul>
            </div>

            <div className="bg-green-50 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-3">Non-Returnable Items</h3>
              <ul className="text-gray-600 space-y-1 text-sm">
                <li>• Clearance items and final sale products</li>
                <li>• Items damaged due to customer misuse</li>
                <li>• Products without original packaging</li>
                <li>• Items returned after 7 days</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Process Section */}
      <div className="mb-16">
        <h2 className="text-2xl font-semibold text-gray-900 text-center mb-8">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-4">
              <span className="text-blue-600 font-bold">1</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Initiate Return</h3>
            <p className="text-gray-600 text-sm">
              Contact our support team with your order number and reason for return.
            </p>
          </div>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-4">
              <span className="text-blue-600 font-bold">2</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Package & Ship</h3>
            <p className="text-gray-600 text-sm">
              Pack the item securely in original packaging and ship to our return center.
            </p>
          </div>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-4">
              <span className="text-blue-600 font-bold">3</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Get Refund</h3>
            <p className="text-gray-600 text-sm">
              Once received and inspected, your refund will be processed within 7-10 business days.
            </p>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="mb-16">
        <h2 className="text-2xl font-semibold text-gray-900 text-center mb-8">Frequently Asked Questions</h2>
        <div className="space-y-6">
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 mb-2">How do I track my order?</h3>
            <p className="text-gray-600">
              Once your order ships, you'll receive an email with tracking information. You can also track your order 
              through your account dashboard or contact our support team.
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 mb-2">Can I change my shipping address?</h3>
            <p className="text-gray-600">
              Address changes can be made within 24 hours of placing the order. After that, please contact our 
              support team immediately as we'll try our best to accommodate changes before shipment.
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 mb-2">What if I receive a damaged item?</h3>
            <p className="text-gray-600">
              If you receive a damaged item, please contact us within 48 hours of delivery with photos of the damage. 
              We'll arrange for a replacement or full refund immediately.
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 mb-2">Do you offer exchanges?</h3>
            <p className="text-gray-600">
              Yes, you can exchange for a different size or color within the 7-day return window, subject to availability. 
              Exchange shipping charges may apply.
            </p>
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="bg-blue-50 rounded-2xl p-8 text-center">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Need Help?</h2>
        <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
          Our customer support team is here to help with any questions about shipping, returns, or your orders.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a 
            href="mailto:support@lokus.com" 
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Email Support
          </a>
          <a 
            href="tel:+919876543210" 
            className="inline-flex items-center gap-2 bg-white text-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors border border-blue-200"
          >
            Call Us
          </a>
        </div>
      </div>
    </div>
  );
}
