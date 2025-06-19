// src/pages/VerifyPharmacyPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCheckCircle } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import { QRCodeCanvas } from 'qrcode.react'; // Import QRCodeCanvas component for rendering
import { toCanvas } from 'qrcode'; // Import toCanvas function from 'qrcode' library
import { doc, updateDoc } from 'firebase/firestore'; // Import Firestore functions
import { db } from '../firebaseConfig'; // Import your Firestore instance

// Remove APPS_SCRIPT_URL as it's no longer used
// const APPS_SCRIPT_URL = import.meta.env.VITE_APPS_SCRIPT_URL!;

function generatePharmacyId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let res = 'PGP-';
  for (let i = 0; i < 11; i++) res += chars.charAt(Math.floor(Math.random() * chars.length));
  return res;
}

function generateMtp() { // Renamed from generateOtp
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit numeric MTP
}

const VerifyPharmacyPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [pharmacyId, setPharmacyId] = useState('');
  const [mtp, setMtp] = useState(''); // Renamed from otpCode
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState(''); // State for QR code data URL

  useEffect(() => {
    // Generate ID and MTP on component mount
    const generatedPharmacyId = generatePharmacyId();
    const generatedMtp = generateMtp();

    setPharmacyId(generatedPharmacyId);
    setMtp(generatedMtp);
    setMessage('Your Pharmacy ID and MTP have been generated.');

    // Generate QR code data URL
    const qrData = `ID:${generatedPharmacyId},MTP:${generatedMtp}`;
    const canvas = document.createElement('canvas');
    // Use toCanvas function for generating on canvas
    toCanvas(canvas, qrData, { errorCorrectionLevel: 'H' }, (error: any) => { // Use imported toCanvas
      if (error) {
        console.error('QR code generation failed:', error);
        setQrCodeDataUrl('');
      } else {
        setQrCodeDataUrl(canvas.toDataURL('image/png'));
      }
    });

  }, []); // Empty dependency array means this runs once on mount

  const handleSaveAndContinue = async () => { // Renamed from handleVerify
    if (!user?.uid || !user?.email) {
        toast.error('User not authenticated.');
        return;
    }

    if (!pharmacyId || !mtp || !qrCodeDataUrl) {
        toast.warn('Credentials or QR code not generated yet.');
        return;
    }

    setIsLoading(true);
    setMessage('Saving credentials and updating profile...');

    try {
      // Save credentials and QR code data to Firestore
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        role: 'pharmacy', // Mark user role as pharmacy
        pharmacyId: pharmacyId,
        mtp: mtp,
        qrCodeDataUrl: qrCodeDataUrl, // Save QR code data URL
        // You might want to add a flag here to indicate verification is complete
        isPharmacyVerified: true,
      });

      // Download QR code image locally
      const link = document.createElement('a');
      link.href = qrCodeDataUrl;
      link.download = `PharmaGo_Credentials_${pharmacyId}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setMessage('Credentials saved and QR code downloaded. Redirecting...');
      toast.success('Setup complete! Redirecting to pharmacy info page.');

      // Navigate to the next page
      navigate('/info/pharmacy');

    } catch (err) {
      console.error('Failed to save credentials or update profile:', err);
      setMessage('Failed to save credentials. Please try again.');
      toast.error('Failed to complete setup.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-md w-full text-center"> {/* Added text-center */}
        <h2 className="text-center text-4xl font-extrabold mb-6">Pharmacy Setup</h2> {/* Increased bottom margin */}
        {/* Display message */}
        {message && <p className="text-center text-blue-600 mb-4">{message}</p>}

        {/* Display Generated Credentials */}
        {pharmacyId && mtp && (
          <div className="space-y-4 mb-8"> {/* Adjusted spacing */}
            <div className="bg-gray-100 p-4 rounded-lg">
              <p className="text-gray-700 font-semibold">Pharmacy ID:</p>
              <p className="text-blue-700 font-mono break-all">{pharmacyId}</p> {/* Added break-all */}
            </div>
            <div className="bg-gray-100 p-4 rounded-lg">
              <p className="text-gray-700 font-semibold">MTP (Multi-Time Password):</p>
              <p className="text-blue-700 font-mono break-all">{mtp}</p> {/* Added break-all */}
            </div>
          </div>
        )}

        {/* Display QR Code */}
        {qrCodeDataUrl && (
          <div className="mb-8 flex justify-center"> {/* Centered QR code */}
            {/* Using QRCodeCanvas for rendering */}
            <QRCodeCanvas value={`ID:${pharmacyId},MTP:${mtp}`} size={256} level="H" />
          </div>
        )}

        <p className="text-gray-700 mb-6">
          Please save your Pharmacy ID and MTP securely. You will need them to log in on other devices.
          The QR code contains this information for easy scanning. The QR code image will be downloaded automatically.
        </p>


        <button
          onClick={handleSaveAndContinue}
          disabled={isLoading || !pharmacyId || !mtp || !qrCodeDataUrl} // Disable if loading or credentials/QR not ready
          className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-xl font-bold flex items-center justify-center disabled:opacity-50"
        >
          {isLoading ? 'Saving...' : <><FaCheckCircle className="mr-2" />Save & Continue</>} {/* Updated button text */}
        </button>
      </div>
    </div>
  );
};

export default VerifyPharmacyPage;
