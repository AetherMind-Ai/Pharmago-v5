import React from 'react';

const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      <div className="prose max-w-none">
        <p><strong>Effective Date: June 21, 2025</strong></p>

        <h2 className="text-2xl font-semibold mt-6 mb-3">1. Introduction</h2>
        <p>Welcome to PharmaGo! We are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy describes how we collect, use, process, and disclose your information when you use our mobile application and website (collectively, the "Service").</p>

        <h2 className="text-2xl font-semibold mt-6 mb-3">2. Information We Collect</h2>
        <p>We collect various types of information to provide and improve our Service to you:</p>
        <h3 className="text-xl font-semibold mt-4 mb-2">2.1. Personal Information You Provide:</h3>
        <ul className="list-disc list-inside ml-4">
          <li><strong>Account Information:</strong> When you register for an account, we collect your name, email address, phone number, and role (e.g., client, pharmacy, delivery).</li>
          <li><strong>Profile Information:</strong> You may choose to provide additional information such as your full name, username, profile picture, and "about me" description.</li>
          <li><strong>Pharmacy Information:</strong> If you register as a pharmacy, we collect details such as pharmacy name, address, map link, Vodafone Cash number, logo image, and other pharmacy-related images.</li>
          <li><strong>Order Information:</strong> When you place an order, we collect details about the products you purchase, delivery address, and payment information.</li>
          <li><strong>Feedback and Reviews:</strong> Content you submit when leaving feedback, reviews, or replies, including text, ratings, and images.</li>
          <li><strong>Communications:</strong> Records of your communications with us, including customer support inquiries.</li>
        </ul>
        <h3 className="text-xl font-semibold mt-4 mb-2">2.2. Information Collected Automatically:</h3>
        <ul className="list-disc list-inside ml-4">
          <li><strong>Usage Data:</strong> Information about how you access and use the Service, such as pages viewed, features used, and time spent on the Service.</li>
          <li><strong>Device Information:</strong> Information about your device, including IP address, device type, operating system, and unique device identifiers.</li>
          <li><strong>Location Information:</strong> We may collect precise or approximate location information from your mobile device if you enable location services.</li>
          <li><strong>Cookies and Tracking Technologies:</strong> We use cookies and similar technologies to track activity on our Service and hold certain information.</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-6 mb-3">3. How We Use Your Information</h2>
        <p>We use the information we collect for various purposes, including:</p>
        <ul className="list-disc list-inside ml-4">
          <li>To provide, operate, and maintain our Service.</li>
          <li>To process your orders and manage your account.</li>
          <li>To improve, personalize, and expand our Service.</li>
          <li>To understand and analyze how you use our Service.</li>
          <li>To develop new products, services, features, and functionality.</li>
          <li>To communicate with you, either directly or through one of our partners, including for customer service, to provide you with updates and other information relating to the Service, and for marketing and promotional purposes.</li>
          <li>To send you push notifications (if you opt-in).</li>
          <li>To detect and prevent fraud and other illegal activities.</li>
          <li>To comply with legal obligations.</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-6 mb-3">4. How We Share Your Information</h2>
        <p>We may share your information with third parties in the following situations:</p>
        <ul className="list-disc list-inside ml-4">
          <li><strong>With Service Providers:</strong> We may share your information with third-party vendors, consultants, and other service providers who perform services on our behalf, such as payment processing, data analysis, email delivery, hosting services, and customer service.</li>
          <li><strong>With Pharmacies and Delivery Partners:</strong> If you are a client, your order and delivery information will be shared with the relevant pharmacies and delivery companies to fulfill your order.</li>
          <li><strong>For Business Transfers:</strong> In connection with, or during negotiations of, any merger, sale of company assets, financing, or acquisition of all or a portion of our business by another company.</li>
          <li><strong>For Legal Reasons:</strong> If required to do so by law or in response to valid requests by public authorities (e.g., a court or a government agency).</li>
          <li><strong>With Your Consent:</strong> We may disclose your personal information for any other purpose with your consent.</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-6 mb-3">5. Data Security</h2>
        <p>We implement reasonable security measures designed to protect your personal information from unauthorized access, use, alteration, and disclosure. However, no method of transmission over the Internet or method of electronic storage is 100% secure.</p>

        <h2 className="text-2xl font-semibold mt-6 mb-3">6. Your Data Protection Rights</h2>
        <p>Depending on your location, you may have the following rights regarding your personal data:</p>
        <ul className="list-disc list-inside ml-4">
          <li>The right to access, update, or delete the information we have on you.</li>
          <li>The right to rectify any inaccurate information.</li>
          <li>The right to object to our processing of your personal data.</li>
          <li>The right to request that we restrict the processing of your personal information.</li>
          <li>The right to data portability.</li>
          <li>The right to withdraw consent at any time where we rely on your consent to process your personal information.</li>
        </ul>
        <p>To exercise any of these rights, please contact us using the details provided below.</p>

        <h2 className="text-2xl font-semibold mt-6 mb-3">7. Changes to This Privacy Policy</h2>
        <p>We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Effective Date" at the top. You are advised to review this Privacy Policy periodically for any changes.</p>

        <h2 className="text-2xl font-semibold mt-6 mb-3">8. Contact Us</h2>
        <p>If you have any questions about this Privacy Policy, please contact us:</p>
        <ul className="list-disc list-inside ml-4">
          <li>By email: pharmago.help@gmail.com</li>
          <li>By phone: +20 122 791 9119</li>
        </ul>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
