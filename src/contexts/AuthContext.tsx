import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { User, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { useFirebase } from './FirebaseContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { UserData } from '../types';
import emailjs from '@emailjs/browser';
import { User as FirebaseAuthUser } from 'firebase/auth';

// EmailJS configuration
const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  signInWithGoogle: (fullName: string) => Promise<void>;
  signOutUser: () => Promise<void>;
  updateUserProfile: (updates: Partial<UserData>) => Promise<void>;
  updateUserRole: (role: string) => Promise<void>;
  uploadProfilePicture: (file: File, user: User) => Promise<void>;
  verifyPharmacy: (pharmacyId: string, mtp: string) => Promise<boolean>;
  generatePharmacyCredentials: () => Promise<{pharmacyId: string, mtp: string} | null>;
  checkDuplicatePharmacy: (name: string, address: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper functions
function generateOtp(length = 6) {
  return Array.from({ length }, () => Math.floor(Math.random() * 10)).join('');
}

function generatePharmacyId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let res = 'PGP-';
  for (let i = 0; i < 11; i++) res += chars.charAt(Math.floor(Math.random() * chars.length));
  return res;
}

function extractUsername(email: string) {
  return email.split('@')[0];
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null); // Firebase Auth user
  const [userData, setUserData] = useState<UserData | null>(null); // Firestore user data
  const [loading, setLoading] = useState(true);
  const { db, auth } = useFirebase(); // Get db and auth from FirebaseContext
  const navigate = useNavigate();
  const location = useLocation();
  const pendingFullName = useRef<string | null>(null); // Ref to store fullName

  // Listen for Firebase Auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Fetch user data from Firestore
        const userDocRef = doc(db, 'users', currentUser.uid);
        console.log('Attempting to fetch user document:', userDocRef.path);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          setUserData({ uid: currentUser.uid, ...userDocSnap.data() } as UserData);
          // Ensure photoDataUrl is updated from Google photoURL if available and different
          if (currentUser.photoURL && userDocSnap.data().photoDataUrl !== currentUser.photoURL) {
            await updateDoc(userDocRef, { photoDataUrl: currentUser.photoURL });
            setUserData(prevData => ({ ...prevData!, photoDataUrl: currentUser.photoURL! }));
          }
        } else {
          // If user exists in Auth but not Firestore, create a basic entry
          // This might happen if they signed in via Google but the Firestore doc wasn't created yet
          const initialUserData: UserData = {
            uid: currentUser.uid,
            email: currentUser.email || '',
            username: currentUser.email?.split('@')[0] || '',
            fullName: currentUser.displayName || pendingFullName.current || '', // Use displayName from Google or pendingFullName
            photoDataUrl: currentUser.photoURL || undefined, // Set photoDataUrl from Google photoURL
          };
          await setDoc(userDocRef, initialUserData);
          setUserData(initialUserData);
        }
      } else {
        setUserData(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Effect to handle redirection based on user and userData state
  useEffect(() => {
    if (loading) {
      return;
    }

    if (user && userData) { // Check for both Firebase Auth user and Firestore userData
      const currentPath = location.pathname;

      // First-Time Login Flow: Persist Basic Profile (handled by onAuthStateChanged)
      // Step 1: Phone Number Collection (/number)
      if (!userData.phoneNumber && currentPath !== '/number') {
        toast.info('Please complete your profile by adding a phone number.');
        navigate('/number');
        return;
      }

      // Step 2: Role Selection (/role) - after phone number verification
      if (userData.phoneNumber && !userData.role && currentPath !== '/role') {
        toast.info('Please select a role to continue.');
        navigate('/role');
        return;
      }

      // Conditional Routing for Pharmacies (First-time and Returning)
      if (userData.role === 'Pharmacy') {
        // Pharmacy Onboarding / OTP Verification (/verify-pharmacy)
        // If pharmacy is not verified and not on a pharmacy-specific verification/info page
        if (!userData.isPharmacyVerified && 
            currentPath !== '/verify-pharmacy' && 
            currentPath !== '/verify-pharmacy-login' && 
            currentPath !== '/info-pharmacy') {
          
          // If it's a returning pharmacy (has pharmacyInfo.pharmacyId), redirect to re-authentication
          if (userData.pharmacyInfo?.pharmacyId) {
            toast.info('Please re-verify your pharmacy account with your Pharmacy ID and OTP.');
            navigate('/verify-pharmacy-login');
          } else {
            // First-time pharmacy, redirect to initial verification
            toast.info('Please verify your pharmacy account to continue.');
            navigate('/verify-pharmacy');
          }
          return;
        }

        // If pharmacy is verified and on a login/verification page, redirect to account
        if (userData.isPharmacyVerified && 
            (currentPath === '/login' || 
             currentPath === '/verify-pharmacy' || 
             currentPath === '/verify-pharmacy-login' || 
             currentPath === '/info-pharmacy')) {
          navigate('/account');
          return;
        }
      } 
      // Client: immediately redirect to /account if they have a role and are on login page
      else if (userData.role === 'Client' && currentPath === '/login') {
        navigate('/account');
        return;
      }

      // If user has completed all onboarding steps and is on the login page, redirect to account
      if (userData.phoneNumber && userData.role && userData.isPharmacyVerified === true && currentPath === '/login') {
        navigate('/account');
        return;
      }
      // If user has completed all onboarding steps and is on the login page, redirect to account (for clients)
      if (userData.phoneNumber && userData.role === 'Client' && currentPath === '/login') {
        navigate('/account');
        return;
      }

    } else if (!user && location.pathname !== '/login' && location.pathname !== '/') { // If no user and not on the login or home page, redirect to login
      navigate('/login');
    }
  }, [user, userData, loading, navigate, location.pathname]);

  const uploadProfilePicture = async (file: File, currentUser: FirebaseAuthUser) => {
    if (!currentUser || !currentUser.uid) {
      toast.error('You must be logged in to upload a profile picture.');
      throw new Error('User not authenticated.');
    }

    return new Promise<void>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const dataUrl = reader.result as string;
        if (dataUrl.length > 1024 * 1024) { // Check if Base64 string exceeds 1MB (Firestore limit)
          toast.error('Image is too large. Please select a smaller image.');
          reject(new Error('Image too large for Firestore document.'));
          return;
        }

        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          await updateDoc(userDocRef, { photoDataUrl: dataUrl });

          // Update local state
          setUserData(prevData => ({ ...prevData!, photoDataUrl: dataUrl }));
          toast.success('Profile picture uploaded successfully!');
          resolve();
        } catch (error: any) {
          console.error('Error saving photoDataUrl to Firestore:', error);
          toast.error(`Failed to save profile picture: ${error.message}`);
          reject(error);
        }
      };
      reader.onerror = (error) => {
        console.error('FileReader error:', error);
        toast.error('Failed to read image file.');
        reject(error);
      };
      reader.readAsDataURL(file);
    });
  };

  const signInWithGoogle = async (fullName: string) => {
    const provider = new GoogleAuthProvider();
    provider.addScope('profile');
    provider.addScope('email');
    // Optional: Force account selection
    provider.setCustomParameters({
      prompt: 'select_account'
    });

    try {
      pendingFullName.current = fullName; // Store fullName before popup
      const result = await signInWithPopup(auth, provider);
      // The user object from result.user is the FirebaseAuthUser
      const currentUser = result.user;

      if (currentUser) {
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (!userDocSnap.exists()) {
          console.log('New user, creating document...');
          const initialUserData: UserData = {
            uid: currentUser.uid,
            email: currentUser.email || '',
            username: currentUser.email?.split('@')[0] || '',
            fullName: pendingFullName.current || currentUser.displayName || '',
            photoDataUrl: currentUser.photoURL || undefined, // Set photoDataUrl from Google photoURL
          };
          await setDoc(userDocRef, initialUserData);
          setUserData(initialUserData);
          toast.success('Account created successfully!');
          // New users will be redirected to phone number input by the useEffect
        } else {
          console.log('Existing user, loading and updating data...');
          const existingUserData = userDocSnap.data() as UserData;
          // Update fullName and photoDataUrl for existing user if they are different or were not set
          const updatedFullName = pendingFullName.current || existingUserData.fullName || currentUser.displayName || '';
          const updatedPhotoDataUrl = currentUser.photoURL || existingUserData.photoDataUrl || undefined;

          const updates: Partial<UserData> = {};
          if (updatedFullName !== existingUserData.fullName) {
            updates.fullName = updatedFullName;
          }
          if (updatedPhotoDataUrl !== existingUserData.photoDataUrl) {
            updates.photoDataUrl = updatedPhotoDataUrl;
          }

          // For pharmacy users, always set isPharmacyVerified to false to force re-verification
          // and clear MTP on sign-in to ensure re-verification with new MTP
          if (existingUserData.role === 'Pharmacy') {
            const pharmacyLoginUpdates: { isPharmacyVerified: boolean; 'pharmacyInfo.mtp'?: null } = {
              isPharmacyVerified: false,
            };
            if (existingUserData.pharmacyInfo?.mtp) {
              pharmacyLoginUpdates['pharmacyInfo.mtp'] = null;
            }
            await updateDoc(userDocRef, pharmacyLoginUpdates);
            setUserData(prevData => ({ 
              ...prevData!, 
              isPharmacyVerified: false, 
              pharmacyInfo: prevData?.pharmacyInfo ? { ...prevData.pharmacyInfo, mtp: undefined } : undefined 
            }));
            toast.success('Logged in successfully!');
            navigate('/verify-pharmacy-login'); // Redirect to re-verification
            return; // Exit early as redirection is handled
          }

          if (Object.keys(updates).length > 0) {
            await updateDoc(userDocRef, updates); // Update in Firestore
            setUserData(prevData => ({ ...prevData!, ...updates }));
          } else {
            setUserData(existingUserData); // No updates needed, just set existing data
          }
          
          toast.success('Logged in successfully!');
          
          // Handle redirects for returning users based on their role and verification status
          if (existingUserData.role === 'Client') {
            // Client users go directly to account
            navigate('/account');
          }
          // Other cases (no role, no phone) will be handled by the useEffect
        }
      }
    } catch (error: any) {
      console.error('Error during Google sign-in:', error);
      toast.error(`Login failed: ${error.message}`);
      pendingFullName.current = null; // Clear the ref on error
    }
  };

  const signOutUser = async () => {
    try {
      if (user?.uid) {
        const userDocRef = doc(db, 'users', user.uid);
        // Set isPharmacyVerified to false upon sign out for pharmacy users
        // This forces re-verification on next login for security
        // Also clear MTP on sign out
        await updateDoc(userDocRef, { 
          isPharmacyVerified: false,
          'pharmacyInfo.mtp': null // Clear MTP on sign out
        });
        // Update local state immediately for a smoother UX
        setUserData(prevData => prevData ? { 
          ...prevData, 
          isPharmacyVerified: false, 
          pharmacyInfo: prevData.pharmacyInfo ? { ...prevData.pharmacyInfo, mtp: undefined } : undefined 
        } : null);
      }
      await signOut(auth);
      setUserData(null);
      setUser(null);
      toast.info('You have been logged out.');
      navigate('/login');
    } catch (error: any) {
      console.error('Error signing out:', error);
      toast.error(`Sign out failed: ${error.message}`);
    }
  };

  const updateUserProfile = async (updates: Partial<UserData>) => {
    if (!user || !user.uid) {
      toast.error('You must be logged in to update your profile.');
      return;
    }
    try {
      const userDocRef = doc(db, 'users', user.uid);
      
      await updateDoc(userDocRef, updates);

      setUserData(prevData => ({ ...prevData!, ...updates }));
      
      toast.success('Profile updated successfully!');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(`Failed to update profile: ${error.message}`);
    }
  };

  const updateUserRole = async (role: string) => {
    if (!user || !user.uid) {
      toast.error('You must be logged in to select a role.');
      return;
    }
    try {
      const userDocRef = doc(db, 'users', user.uid);
      const updatedData = { role };

      await updateDoc(userDocRef, updatedData);

      setUserData(prevData => ({ ...prevData!, ...updatedData }));

      toast.success(`Role set to ${role}!`);

      // Redirect based on role
      if (role === 'Client') {
        navigate('/account');
      } else if (role === 'Pharmacy') {
        navigate('/verify-pharmacy');
      }
    } catch (error: any) {
      console.error('Error updating role:', error);
      toast.error(`Failed to update role: ${error.message}`);
    }
  };

  // Check if a pharmacy with the same name and address already exists
  const checkDuplicatePharmacy = async (name: string, address: string) => {
    try {
      // Query users collection for pharmacies with the same name and address
      const usersRef = collection(db, 'users');
      const q = query(
        usersRef, 
        where('role', '==', 'Pharmacy'),
        where('pharmacyInfo.name', '==', name),
        where('pharmacyInfo.address', '==', address)
      );
      
      const querySnapshot = await getDocs(q);
      
      // If any documents match, a duplicate exists
      return !querySnapshot.empty;
    } catch (error: any) {
      console.error('Error checking for duplicate pharmacy:', error);
      toast.error(`Failed to check for duplicate pharmacy: ${error.message}`);
      return false; // Default to false on error
    }
  };

  // Generate pharmacy credentials (ID and MTP) and save to Firestore
  const generatePharmacyCredentials = async () => {
    if (!user || !user.email) {
      toast.error('User not authenticated or missing email.');
      return null;
    }

    try {
      const pharmacyId = generatePharmacyId();
      const mtp = generateOtp(); // Use generateOtp for MTP

      // Save MTP directly to user's pharmacyInfo
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        'pharmacyInfo.pharmacyId': pharmacyId,
        'pharmacyInfo.mtp': mtp, // Save MTP in pharmacyInfo
        isPharmacyVerified: false // Ensure it's false until verified
      });

      // Send MTP via EmailJS
      if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY) {
        toast.error('Email service not configured. Please check your .env file and EmailJS setup.');
        console.error('EmailJS environment variables are missing.');
        return null;
      }

      const username = extractUsername(user.email);
      const templateParams = {
        email: user.email,
        to_name: username,
        otp_code: mtp, // Send MTP as otp_code
        user_role: 'Pharmacy',
        pharmacy_id: pharmacyId,
        from_email: 'PharmaGo Team',
      };

      await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams, EMAILJS_PUBLIC_KEY);
      toast.success(`MTP sent to ${user.email}. Please check your inbox.`);

      return { pharmacyId, mtp }; // Return mtp instead of otp
    } catch (error: any) {
      console.error('Error generating pharmacy credentials:', error);
      toast.error(`Failed to generate credentials: ${error.message}`);
      return null;
    }
  };

  // Verify pharmacy with ID and MTP
  const verifyPharmacy = async (pharmacyId: string, mtp: string) => {
    if (!user || !user.uid) {
      toast.error('User not authenticated.');
      return false;
    }

    try {
      const userDocRef = doc(db, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (!userDocSnap.exists()) {
        toast.error('User data not found.');
        return false;
      }

      const currentUserData = userDocSnap.data() as UserData;
      const storedPharmacyId = currentUserData.pharmacyInfo?.pharmacyId;
      const storedMtp = currentUserData.pharmacyInfo?.mtp;

      // Check if the provided pharmacyId matches the stored one
      if (storedPharmacyId !== pharmacyId) {
        toast.error('Invalid Pharmacy ID. Please try again.');
        return false;
      }

      // Check if the provided MTP matches the stored one
      if (storedMtp !== mtp) {
        toast.error('Invalid MTP. Please try again.');
        return false;
      }

      // If both match, mark as verified and clear the MTP for security
      await updateDoc(userDocRef, {
        isPharmacyVerified: true,
        'pharmacyInfo.mtp': null // Clear MTP after successful verification
      });

      // Update local state
      setUserData(prevData => prevData ? { 
        ...prevData, 
        isPharmacyVerified: true,
        pharmacyInfo: prevData.pharmacyInfo ? { ...prevData.pharmacyInfo, mtp: undefined } : undefined
      } : null);

      toast.success('Pharmacy verified successfully!');
      return true;
    } catch (error: any) {
      console.error('Error verifying pharmacy:', error);
      toast.error(`Verification failed: ${error.message}`);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      userData,
      loading,
      signInWithGoogle,
      signOutUser,
      updateUserProfile,
      updateUserRole,
      uploadProfilePicture,
      verifyPharmacy,
      generatePharmacyCredentials,
      checkDuplicatePharmacy
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
