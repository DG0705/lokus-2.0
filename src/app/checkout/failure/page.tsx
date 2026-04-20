import Link from "next/link";
import { AlertTriangle, RefreshCw, ShoppingCart } from "lucide-react";

export default function PaymentFailurePage() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center">
        {/* Error Icon */}
        <div className="mb-6 flex justify-center">
          <div className="rounded-full bg-red-100 p-4">
            <AlertTriangle className="h-12 w-12 text-red-600" />
          </div>
        </div>

        {/* Error Message */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Payment Failed</h1>
        <p className="text-lg text-gray-600 mb-8">
          Your payment could not be processed, but your items are still in the cart.
        </p>

        {/* Recovery Actions */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/checkout"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Link>
            <Link
              href="/cart"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <ShoppingCart className="h-4 w-4" />
              View Cart
            </Link>
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-12 bg-gray-50 rounded-lg p-6 text-left">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">What happened?</h2>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">â¢</span>
              <span>Your payment was not successfully processed by the payment gateway</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-1">â¢</span>
              <span>Your cart items have been preserved and are still available</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">â¢</span>
              <span>No charges were made to your payment method</span>
            </li>
          </ul>
        </div>

        {/* Additional Help */}
        <div className="mt-8 text-sm text-gray-500">
          <p>If you continue to experience issues, please:</p>
          <ul className="mt-2 space-y-1">
            <li>â¢ Check your payment method details</li>
            <li>â¢ Ensure you have sufficient funds</li>
            <li>â¢ Try a different payment method</li>
            <li>â¢ Contact our support team if the problem persists</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
