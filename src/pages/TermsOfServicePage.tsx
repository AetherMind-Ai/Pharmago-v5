 import React from 'react';

const TermsOfServicePage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
      <div className="prose max-w-none">
        <p><strong>Effective Date: June 21, 2025</strong></p>

        <h2 className="text-2xl font-semibold mt-6 mb-3">1. Acceptance of Terms</h2>
        <p>By accessing or using the PharmaGo mobile application and website (collectively, the "Service"), you agree to be bound by these Terms of Service ("Terms"), all applicable laws and regulations, and agree that you are responsible for compliance with any applicable local laws. If you do not agree with any of these terms, you are prohibited from using or accessing this site. The materials contained in this Service are protected by applicable copyright and trademark law.</p>

        <h2 className="text-2xl font-semibold mt-6 mb-3">2. Use License</h2>
        <ul className="list-disc list-inside ml-4">
          <li>Permission is granted to temporarily download one copy of the materials (information or software) on PharmaGo's Service for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
            <ul className="list-circle list-inside ml-8">
              <li>modify or copy the materials;</li>
              <li>use the materials for any commercial purpose, or for any public display (commercial or non-commercial);</li>
              <li>attempt to decompile or reverse engineer any software contained on PharmaGo's Service;</li>
              <li>remove any copyright or other proprietary notations from the materials; or</li>
              <li>transfer the materials to another person or "mirror" the materials on any other server.</li>
            </ul>
          </li>
          <li>This license shall automatically terminate if you violate any of these restrictions and may be terminated by PharmaGo at any time. Upon terminating your viewing of these materials or upon the termination of this license, you must destroy any downloaded materials in your possession whether in electronic or printed format.</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-6 mb-3">3. Disclaimer</h2>
        <ul className="list-disc list-inside ml-4">
          <li>The materials on PharmaGo's Service are provided on an 'as is' basis. PharmaGo makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.</li>
          <li>Further, PharmaGo does not warrant or make any representations concerning the accuracy, likely results, or reliability of the use of the materials on its Service or otherwise relating to such materials or on any sites linked to this site.</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-6 mb-3">4. Limitations</h2>
        <p>In no event shall PharmaGo or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on PharmaGo's Service, even if PharmaGo or a PharmaGo authorized representative has been notified orally or in writing of the possibility of such damage. Because some jurisdictions do not allow limitations on implied warranties, or limitations of liability for consequential or incidental damages, these limitations may not apply to you.</p>

        <h2 className="text-2xl font-semibold mt-6 mb-3">5. Accuracy of Materials</h2>
        <p>The materials appearing on PharmaGo's Service could include technical, typographical, or photographic errors. PharmaGo does not warrant that any of the materials on its Service are accurate, complete or current. PharmaGo may make changes to the materials contained on its Service at any time without notice. However PharmaGo does not make any commitment to update the materials.</p>

        <h2 className="text-2xl font-semibold mt-6 mb-3">6. Links</h2>
        <p>PharmaGo has not reviewed all of the sites linked to its Service and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by PharmaGo of the site. Use of any such linked website is at the user's own risk.</p>

        <h2 className="text-2xl font-semibold mt-6 mb-3">7. Modifications</h2>
        <p>PharmaGo may revise these Terms of Service for its Service at any time without notice. By using this Service you are agreeing to be bound by the then current version of these Terms of Service.</p>

        <h2 className="text-2xl font-semibold mt-6 mb-3">8. Governing Law</h2>
        <p>These terms and conditions are governed by and construed in accordance with the laws of [Your Country/State] and you irrevocably submit to the exclusive jurisdiction of the courts in that State or location.</p>
      </div>
    </div>
  );
};

export default TermsOfServicePage;
