export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms & Conditions</h1>
        <p className="text-xl text-gray-600">
          Please read these terms carefully before using our services.
        </p>
      </div>

      <div className="prose prose-lg max-w-none space-y-8">
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
          <p className="text-gray-600">
            By accessing and using Lokus ("the Website"), you accept and agree to be bound by the terms and provision of this agreement. 
            If you do not agree to abide by the above, please do not use this service.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. User Accounts</h2>
          <p className="text-gray-600 mb-4">
            When you create an account with us, you must provide information that is accurate, complete, and current at all times. 
            You are responsible for safeguarding the password that you use to access the service and for any activities or actions 
            under your password.
          </p>
          <p className="text-gray-600">
            We reserve the right to refuse service, terminate accounts, remove or edit content, or cancel orders in our sole discretion.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Products and Services</h2>
          <p className="text-gray-600 mb-4">
            All products are subject to availability. We reserve the right to discontinue any products at any time. 
            We make every effort to display as accurately as possible the colors, features, specifications, and details of the products available on the Website.
          </p>
          <p className="text-gray-600">
            However, we do not guarantee that the colors, features, specifications, and details of the products will be accurate, 
            complete, reliable, current, or free of other errors, and your electronic display may not accurately reflect the actual colors and details of the products.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Pricing and Payment</h2>
          <p className="text-gray-600 mb-4">
            All prices are displayed in Indian Rupees (INR) and are inclusive of applicable taxes unless otherwise stated. 
            We reserve the right to change our product prices at any time without further notice.
          </p>
          <p className="text-gray-600">
            Payment for products can be made through various payment methods including credit/debit cards, UPI, and other electronic payment methods. 
            All payment information is encrypted and secure. We do not store your payment details on our servers.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Shipping and Delivery</h2>
          <p className="text-gray-600 mb-4">
            We aim to process and ship orders within 1-2 business days. Standard delivery typically takes 5-7 business days from the date of shipment.
          </p>
          <p className="text-gray-600">
            Shipping charges may apply based on your location and order value. Free shipping is available for orders above ₹5,000. 
            Delivery timelines are estimates and may vary due to unforeseen circumstances.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Returns and Refunds</h2>
          <p className="text-gray-600 mb-4">
            We offer a 7-day return policy from the date of delivery. Products must be unused, in original packaging, and with all tags attached.
          </p>
          <p className="text-gray-600 mb-4">
            To initiate a return, please contact our customer support team. Refunds will be processed within 7-10 business days after we receive the returned product.
          </p>
          <p className="text-gray-600">
            Certain items may be non-returnable, including clearance items and products damaged due to customer misuse.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Intellectual Property</h2>
          <p className="text-gray-600">
            All content included on this site, such as text, graphics, logos, images, and software, is the property of Lokus or its content suppliers 
            and protected by international copyright and trademark laws.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Limitation of Liability</h2>
          <p className="text-gray-600">
            In no event shall Lokus, nor any of its officers, directors and employees, be held liable for anything arising out of or in any way 
            connected with your use of this website whether for breach of contract, negligent misrepresentation or otherwise.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Governing Law</h2>
          <p className="text-gray-600">
            These Terms and Conditions and any separate agreements whereby we provide you services shall be governed by and construed in accordance 
            with the laws of India.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Changes to Terms</h2>
          <p className="text-gray-600">
            We reserve the right to amend these terms at any time without prior notice. Your continued use of the Website after any such changes 
            shall constitute your acceptance of the new terms.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Contact Information</h2>
          <p className="text-gray-600">
            If you have any questions about these Terms and Conditions, please contact us at:
          </p>
          <div className="bg-gray-50 p-4 rounded-lg mt-4">
            <p className="text-gray-600">
              Email: support@lokus.com<br />
              Phone: +91 98765 43210<br />
              Address: Lokus Footwear Pvt. Ltd., 123 Fashion Street, Bandra West, Mumbai 400050
            </p>
          </div>
        </section>

        <div className="mt-12 p-6 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800 text-center">
            Last updated: {new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>
    </div>
  );
}
