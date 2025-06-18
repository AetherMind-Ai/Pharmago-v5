import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  FaCamera, FaSpinner, FaGlobe, FaGithub, FaTwitter, FaInstagram, FaFacebook
} from 'react-icons/fa';

// --- Helper Components for a Cleaner Structure ---

// A single progress bar item for the Project Status card
const ProgressBar: React.FC<{ label: string; percentage: number }> = ({ label, percentage }) => (
  <div className="mb-3">
    <div className="flex justify-between mb-1">
      <span className="text-sm text-gray-600">{label}</span>
      <span className="text-sm text-gray-600">{percentage}%</span>
    </div>
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div
        className="bg-blue-600 h-2 rounded-full"
        style={{ width: `${percentage}%` }}
      ></div>
    </div>
  </div>
);

// A single social link item
const SocialLink: React.FC<{ icon: React.ReactNode; label: string; value: string }> = ({ icon, label, value }) => (
  <li className="flex items-center justify-between py-3 border-b border-gray-200">
    <div className="flex items-center text-gray-700">
      <span className="text-xl mr-3">{icon}</span>
      {label}
    </div>
    <span className="text-gray-500">{value}</span>
  </li>
);

// --- Main Account Page Component ---

export const AccountPage: React.FC = () => {
  // --- Hooks and State ---
  const { user, userData, loading, signOutUser, uploadProfilePicture, updateUserProfile } = useAuth(); // Added updateUserProfile
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // State for About Me section
  const defaultAboutMe = `Hello, I am ${userData?.fullName || 'User'}. I am using PharmaGo To Buy Medical Products Online.`;
  const [aboutMeText, setAboutMeText] = useState(userData?.aboutMe || defaultAboutMe);
  const [isEditingAboutMe, setIsEditingAboutMe] = useState(false);

  // Update aboutMeText if userData.aboutMe changes (e.g., after initial load or update)
  useEffect(() => {
    if (userData) {
      setAboutMeText(userData.aboutMe || defaultAboutMe);
    }
  }, [userData, defaultAboutMe]);

  // --- Effects and Handlers ---
  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  const handleSignOut = async () => {
    await signOutUser();
    navigate('/login');
  };

  const handleImageSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validation
    if (!file.type.startsWith('image/')) {
        setUploadError('Please select a valid image file.');
        return;
    }
    if (file.size > 5 * 1024 * 1024) { // 5MB
        setUploadError('Image size cannot exceed 5MB.');
        return;
    }

    setIsUploading(true);
    setUploadError(null);
    try {
        await uploadProfilePicture(file, user);
    } catch (error) {
        console.error("Error uploading image:", error);
        setUploadError('Failed to upload image.');
    } finally {
        setIsUploading(false);
    }
  };

  const triggerFileInput = () => {
    if (isUploading) return;
    fileInputRef.current?.click();
  };

  const handleSaveAboutMe = async () => {
    if (user && userData) {
      await updateUserProfile({ aboutMe: aboutMeText });
      setIsEditingAboutMe(false);
    }
  };

  // --- Loading and Fallback States ---
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <FaSpinner className="animate-spin text-4xl text-blue-500" />
      </div>
    );
  }

  if (!user || !userData) {
    return null; // The useEffect will handle the redirect
  }

  const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.fullName || userData.email)}&background=0D8ABC&color=fff&size=128`;

  // --- Render ---
  return (
    <div className="bg-gray-100 min-h-[calc(100vh-80px)] p-4 sm:p-6 lg:p-8">
      <div className="container mx-auto">
        {/* Breadcrumbs */}
        <nav className="mb-6 text-sm text-gray-500">
          <span>Home</span>
          <span className="mx-2">/</span>
          <span>User</span>
          <span className="mx-2">/</span>
          <span className="font-semibold text-gray-700">User Profile</span>
        </nav>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Profile Card */}
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div
                className="relative w-32 h-32 mx-auto group cursor-pointer"
                onClick={triggerFileInput}
                title="Change profile picture"
              >
                <img
                  className="w-full h-full rounded-full object-cover border-4 border-white shadow-lg"
                  src={userData.photoDataUrl || user.photoURL || fallbackAvatar} // Use photoDataUrl first
                  alt="Profile"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 rounded-full flex items-center justify-center transition-opacity duration-300">
                  {isUploading ? (
                    <FaSpinner className="animate-spin text-white text-3xl" />
                  ) : (
                    <FaCamera className="text-white text-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  )}
                </div>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageSelect}
                accept="image/*"
                className="hidden"
                disabled={isUploading}
              />
              {uploadError && <p className="text-red-500 text-sm mt-2">{uploadError}</p>}
              
              <h3 className="text-2xl font-semibold mt-4">{userData.fullName || 'User Name'}</h3>
              <p className="text-gray-500">{userData.role || 'User Role'}</p>
              <div className="mt-6 flex justify-center gap-3">
                <button onClick={() => navigate('/products')} className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">Start Buying</button>
              </div>
            </div>

            {/* Address and Contact Info Card */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h4 className="text-lg font-semibold mb-4 text-gray-800">Contact Information</h4>
              <div className="divide-y divide-gray-200">
                <div className="flex justify-between items-center py-3">
                  <span className="text-gray-600 font-medium">Address</span>
                  <span className="text-gray-800">Governorate Beheira, Abo Homos</span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="text-gray-600 font-medium">Zip Code</span>
                  <span className="text-gray-800">5935360</span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="text-gray-600 font-medium">Country</span>
                  <span className="text-gray-800">Egypt</span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="text-gray-600 font-medium">City</span>
                  <span className="text-gray-800">Abo Homos</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-2 space-y-6">

            {/* User Details Card */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="divide-y divide-gray-200">
                    <div className="flex justify-between items-center py-3">
                        <span className="text-gray-600 font-medium">Full Name</span>
                        <span className="text-gray-800">{userData.fullName || 'Not provided'}</span>
                    </div>
                    <div className="flex justify-between items-center py-3">
                        <span className="text-gray-600 font-medium">Email</span>
                        <span className="text-gray-800">{userData.email}</span>
                    </div>
                    <div className="flex justify-between items-center py-3">
                        <span className="text-gray-600 font-medium">Username</span>
                        <span className="text-gray-800">{userData.username}</span>
                    </div>
                    <div className="flex justify-between items-center py-3">
                        <span className="text-gray-600 font-medium">Phone</span>
                        <span className="text-gray-800">{userData.phoneNumber || 'Not provided'}</span>
                    </div>
                </div>
                <div className="mt-6 flex justify-end gap-3">
                    <button onClick={handleSignOut} className="px-5 py-2 bg-red-600 text-white font-semibold rounded-md hover:bg-red-700 transition">Sign Out</button>
                </div>
            </div>

            {/* About Me Card */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h4 className="text-lg font-semibold mb-4 text-gray-800">About Me</h4>
              {isEditingAboutMe ? (
                <textarea
                  className="w-full p-2 border border-gray-300 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  value={aboutMeText}
                  onChange={(e) => setAboutMeText(e.target.value)}
                ></textarea>
              ) : (
                <p className="text-gray-700 mb-4 whitespace-pre-wrap">
                  {aboutMeText}
                </p>
              )}
              <div className="flex justify-end gap-3">
                {isEditingAboutMe ? (
                  <button
                    onClick={handleSaveAboutMe}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                  >
                    Save
                  </button>
                ) : (
                  <button
                    onClick={() => setIsEditingAboutMe(true)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition"
                  >
                    Edit
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
