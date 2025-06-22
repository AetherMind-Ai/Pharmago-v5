import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCheckCircle } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import emailjs from '@emailjs/browser';

// Environment variables for EmailJS
const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

// Helper function to generate a random 6-digit MTP
function generateMtp(length = 6): string {
  return Array.from({ length }, () => Math.floor(Math.random() * 10)).join('');
}

// Helper function to extract username from email
function extractUsername(email: string | null | undefined): string {
  if (!email) return 'User';
  return email.split('@')[0];
}

// Helper function to generate a unique Pharmacy ID
function generatePharmacyId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let res = 'PGP-';
  for (let i = 0; i < 11; i++) {
    res += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return res;
}

const VerifyPharmacyPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, userData, generatePharmacyCredentials } = useAuth(); // Destructure generatePharmacyCredentials
  const [pharmacyId, setPharmacyId] = useState('');
  const [mtpInput, setMtpInput] = useState<string[]>(Array(6).fill(''));
  const [sentMtp, setSentMtp] = useState('');
  const [message, setMessage] = useState('Please wait while we generate your Pharmacy ID...');
  const [isLoading, setIsLoading] = useState(false);
  const [mtpSent, setMtpSent] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // On component mount, check for existing Pharmacy ID but do not send email automatically.
  useEffect(() => {
    const checkPharmacyId = async () => {
      if (userData?.pharmacyInfo?.pharmacyId) {
        setPharmacyId(userData.pharmacyInfo.pharmacyId);
        setMessage('Your Pharmacy ID is already generated. Please verify with MTP.');
        setMtpSent(true); // If ID exists, assume MTP needs to be entered
      } else {
        // Generate Pharmacy ID locally without sending email
        const newPharmacyId = generatePharmacyId();
        setPharmacyId(newPharmacyId);
        setMessage('Please click the button to send MTP to your email.');
      }
    };

    if (!isLoading) {
      checkPharmacyId();
    }
  }, [user, userData]);

  // Handles changes in the MTP input fields
  const handleMtpChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const value = e.target.value.replace(/[^0-9]/g, ''); // Only allow numbers
    if (value.length > 1) return; // Prevent pasting multiple digits

    const newMtpInput = [...mtpInput];
    newMtpInput[index] = value;
    setMtpInput(newMtpInput);

    // Move focus to the next input field if a digit was entered
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handles backspace key for better UX in MTP input
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !mtpInput[index] && index > 0) {
      // If backspace is pressed and the current field is empty, move focus to the previous field
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Sends the MTP to the user's email via EmailJS
  const handleSendMtp = async () => {
    if (!user?.email) {
      toast.error('User email not available. Please log in again.');
      return;
    }
    if (!pharmacyId) {
      toast.warn('Pharmacy ID has not been generated yet. Please wait.');
      return;
    }

    if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY) {
      const errorMsg = 'Email service is not configured. Setup cannot proceed.';
      toast.error(errorMsg);
      setMessage(errorMsg);
      console.error('EmailJS environment variables are missing.');
      return;
    }

    setIsLoading(true);
    setMessage('Sending MTP to your email...');

    try {
      const generatedMtp = generateMtp();
      toast.info('MTP code generated successfully, sending email...');
      const templateParams = {
        email: user.email,
        to_name: extractUsername(user.email),
        mtp_code: generatedMtp,
        user_role: 'Pharmacy',
        pharmacy_id: pharmacyId,
        from_email: 'The PharmaGo Team',
      };

      await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams, EMAILJS_PUBLIC_KEY);

      setSentMtp(generatedMtp);
      setMtpSent(true);
      setMessage(`An MTP has been sent to ${user.email}. Please check your inbox.`);
      toast.success('MTP sent successfully!');
    } catch (err: any) {
      console.error('Failed to send MTP:', err);
      const errorMsg = `Failed to send MTP. Please try again.`;
      setMessage(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  // Verifies the MTP and saves the pharmacy credentials to Firestore
  const handleVerifyAndSave = async () => {
    if (!user?.uid || !user?.email) {
      toast.error('User not authenticated. Please log in again.');
      return;
    }

    const enteredMtp = mtpInput.join('');
    if (enteredMtp.length !== 6) {
      toast.warn('Please enter the complete 6-digit MTP.');
      return;
    }

    if (enteredMtp !== sentMtp) {
      toast.error('Invalid MTP. Please try again.');
      setMtpInput(Array(6).fill('')); // Clear input on failure
      inputRefs.current[0]?.focus();
      return;
    }

    setIsLoading(true);
    setMessage('Verifying MTP and saving your credentials...');

    try {
      // Save the verified credentials to Firestore
      const userDocRef = doc(db, 'users', user.uid);
      const isFirstTimeVerification = !userData?.isPharmacyVerified; // Check if it's the first verification

      await updateDoc(userDocRef, {
        role: 'pharmacy',
        pharmacyId: pharmacyId,
        isPharmacyVerified: true,
      });

      setMessage('Your credentials have been saved.');
      toast.success('Verification Successful!');
      navigate('/account'); // Redirect to account page after successful verification
    } catch (error) {
      console.error('Failed to save credentials to Firestore:', error);
      setMessage('Failed to save your credentials. Please try again.');
      toast.error('A database error occurred during setup.');
    } finally {
      setIsLoading(false);
    }
  };

  // Render the verification form
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-md w-full">
        <h2 className="text-center text-4xl font-extrabold mb-2 text-gray-800">Pharmacy Verification</h2>
        <p className="text-center text-gray-500 mb-8">
          Complete these steps to activate your pharmacy account.
        </p>

        {message && <p className="text-center text-blue-600 mb-6 font-medium">{message}</p>}

        <div className="space-y-6">
          <div className="bg-gray-100 p-4 rounded-xl border border-gray-200 text-center">
            <p className="text-gray-600 font-semibold mb-1">Your Unique Pharmacy ID</p>
            {pharmacyId ? (
              <p className="text-blue-700 font-mono break-all text-lg">{pharmacyId}</p>
            ) : (
              <p className="text-gray-500">Generating ID...</p>
            )}
          </div>

          {!mtpSent ? (
            <button
              onClick={handleSendMtp}
              disabled={isLoading || !pharmacyId}
              className="w-full py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-bold flex items-center justify-center disabled:opacity-50 hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-lg hover:shadow-green-500/50"
            >
              {isLoading ? 'Sending...' : 'Send MTP to My Email'}
            </button>
          ) : (
            <>
              <div>
                <label htmlFor="mtp" className="block text-gray-700 text-sm font-bold mb-3 text-center">
                  Enter the 6-digit MTP sent to your email
                </label>
                <div className="flex justify-center space-x-2 sm:space-x-3">
                  {mtpInput.map((digit, index) => (
                    <input
                      key={index}
                      id={`mtp-${index}`}
                      name="mtp"
                      type="tel" // Use 'tel' for better mobile numeric keyboard
                      autoComplete="one-time-code"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleMtpChange(e, index)}
                      onKeyDown={(e) => handleKeyDown(e, index)}
                      ref={(el) => (inputRefs.current[index] = el)}
                      className="w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-bold bg-gray-50 border-2 border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-300 outline-none transition-all duration-200"
                    />
                  ))}
                </div>
              </div>

              <p className="text-xs text-center text-gray-500">
                Didn't receive it? Check your spam folder or try sending again after a minute.
              </p>

              <button
                onClick={handleVerifyAndSave}
                disabled={isLoading || mtpInput.join('').length !== 6}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-xl font-bold flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:from-blue-700 hover:to-blue-900 transition-all duration-300 shadow-lg hover:shadow-blue-500/50"
              >
                {isLoading ? 'Verifying...' : <><FaCheckCircle className="mr-2" />Verify & Complete Setup</>}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyPharmacyPage;
