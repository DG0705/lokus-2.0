import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-[#D4C4B7] bg-[#F9F7F5] py-12">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Column */}
          <div>
            <h3 className="font-semibold text-[#2C2B2B] mb-4">LOKUS</h3>
            <p className="text-sm text-[#2C2B2B]/70 mb-4">
              Premium Footwear, Uncomplicated.
            </p>
          </div>

          {/* Shop Column */}
          <div>
            <h3 className="font-semibold text-[#2C2B2B] mb-4">Shop</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/category" className="text-[#2C2B2B]/70 hover:text-[#2C2B2B] transition-colors">
                  All Products
                </Link>
              </li>
              <li>
                <Link href="/account/orders" className="text-[#2C2B2B]/70 hover:text-[#2C2B2B] transition-colors">
                  My Orders
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service Column */}
          <div>
            <h3 className="font-semibold text-[#2C2B2B] mb-4">Customer Service</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/contact" className="text-[#2C2B2B]/70 hover:text-[#2C2B2B] transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/shipping-and-returns" className="text-[#2C2B2B]/70 hover:text-[#2C2B2B] transition-colors">
                  Shipping & Returns
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-[#2C2B2B]/70 hover:text-[#2C2B2B] transition-colors">
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Column */}
          <div>
            <h3 className="font-semibold text-[#2C2B2B] mb-4">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/terms-and-conditions" className="text-[#2C2B2B]/70 hover:text-[#2C2B2B] transition-colors">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="text-[#2C2B2B]/70 hover:text-[#2C2B2B] transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[#D4C4B7] pt-8 text-center">
          <p className="text-sm text-[#2C2B2B]/70">
            © 2026 LOKUS. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
