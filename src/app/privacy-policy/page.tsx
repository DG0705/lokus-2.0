export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
        <p className="text-xl text-gray-600">
          Your privacy is important to us. This policy explains how we collect, use, and protect your information.
        </p>
      </div>

      <div className="prose prose-lg max-w-none space-y-8">
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Information We Collect</h2>
          <p className="text-gray-600 mb-4">
            We collect information you provide directly to us, such as when you create an account, make a purchase, or contact us for support.
          </p>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">Types of Information Collected:</h3>
            <ul className="list-disc list-inside text-gray-600 space-y-1">
              <li>Name, email address, and phone number</li>
              <li>Shipping and billing addresses</li>
              <li>Payment information (processed securely by third-party payment processors)</li>
              <li>Order history and preferences</li>
              <li>Device and browser information for analytics</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. How We Use Your Information</h2>
          <p className="text-gray-600 mb-4">
            We use the information we collect to provide, maintain, and improve our services, including:
          </p>
          <ul className="list-disc list-inside text-gray-600 space-y-2">
            <li>Processing and fulfilling your orders</li>
            <li>Providing customer support and responding to your inquiries</li>
            <li>Sending you transactional emails and order updates</li>
            <li>Personalizing your shopping experience</li>
            <li>Analyzing website usage to improve our services</li>
            <li>Detecting and preventing fraud</li>
            <li>Complying with legal obligations</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Information Sharing</h2>
          <p className="text-gray-600 mb-4">
            We do not sell, trade, or otherwise transfer your personal information to third parties, except in the following circumstances:
          </p>
          <ul className="list-disc list-inside text-gray-600 space-y-2">
            <li>With trusted third-party service providers who assist us in operating our website (payment processors, shipping carriers)</li>
            <li>When required by law or to protect our rights, property, or safety</li>
            <li>With your consent for specific purposes</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Data Security</h2>
          <p className="text-gray-600 mb-4">
            We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, 
            alteration, disclosure, or destruction. These include:
          </p>
          <ul className="list-disc list-inside text-gray-600 space-y-2">
            <li>SSL encryption for data transmission</li>
            <li>Secure payment processing through PCI-compliant payment gateways</li>
            <li>Regular security audits and updates</li>
            <li>Limited employee access to personal data</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Cookies and Tracking</h2>
          <p className="text-gray-600 mb-4">
            We use cookies and similar tracking technologies to enhance your experience on our website:
          </p>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">Types of Cookies:</h3>
            <ul className="list-disc list-inside text-gray-600 space-y-1">
              <li><strong>Essential Cookies:</strong> Required for basic website functionality</li>
              <li><strong>Performance Cookies:</strong> Help us understand how our website is used</li>
              <li><strong>Functional Cookies:</strong> Remember your preferences and settings</li>
              <li><strong>Marketing Cookies:</strong> Used to deliver relevant advertisements</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Your Rights</h2>
          <p className="text-gray-600 mb-4">
            You have the following rights regarding your personal information:
          </p>
          <ul className="list-disc list-inside text-gray-600 space-y-2">
            <li>Access to your personal information</li>
            <li>Correction of inaccurate information</li>
            <li>Deletion of your personal information</li>
            <li>Restriction of processing</li>
            <li>Data portability</li>
            <li>Objection to processing</li>
          </ul>
          <p className="text-gray-600 mt-4">
            To exercise these rights, please contact us at support@lokus.com.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Data Retention</h2>
          <p className="text-gray-600">
            We retain your personal information only as long as necessary to fulfill the purposes for which it was collected, 
            unless a longer retention period is required or permitted by law.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Children's Privacy</h2>
          <p className="text-gray-600">
            Our services are not intended for individuals under the age of 18. We do not knowingly collect personal information 
            from children under 18. If you believe we have collected such information, please contact us immediately.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. International Data Transfers</h2>
          <p className="text-gray-600">
            Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards 
            are in place to protect your personal information in accordance with applicable data protection laws.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Changes to This Policy</h2>
          <p className="text-gray-600">
            We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page 
            and updating the "Last updated" date below.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Contact Us</h2>
          <p className="text-gray-600 mb-4">
            If you have any questions about this Privacy Policy or our data practices, please contact us:
          </p>
          <div className="bg-gray-50 p-4 rounded-lg">
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
