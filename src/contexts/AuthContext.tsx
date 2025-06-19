import React, { createContext, useContext, useEffect, useState, ReactNode, useRef } from 'react';
import { useFirebase } from '../contexts/FirebaseContext'; // Import useFirebase
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { toast } from 'react-toastify';
import { useNavigate, useLocation } from 'react-router-dom';
import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User as FirebaseAuthUser } from 'firebase/auth'; // Firebase Auth imports

interface UserData {
  uid: string; // Add uid to UserData
  phoneNumber?: string;
  email: string;
  username: string;
  fullName?: string;
  role?: string;
  photoDataUrl?: string; // Add this line
  aboutMe?: string; // Add aboutMe field
  pharmacyName?: string; // Add pharmacyName field
  pharmacyInfo?: {
    name: string;
    vodafoneCash: string;
    address: string;
    mapLink: string;
    logoImage: string | null;
    pharmacyImages: Array<string | null>;
  };
}

interface AuthContextType {
  user: FirebaseAuthUser | null; // Firebase Auth user object
  userData: UserData | null;
  loading: boolean;
  signInWithGoogle: (fullName: string) => void;
  signOutUser: () => void;
  updateUserProfile: (updates: Partial<UserData>) => Promise<void>; // Modified to accept partial updates
  updateUserRole: (role: string) => Promise<void>;
  uploadProfilePicture: (file: File, user: FirebaseAuthUser) => Promise<void>; // Add this line
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseAuthUser | null>(null); // Firebase Auth user
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
        } else {
          // If user exists in Auth but not Firestore, create a basic entry
          // This might happen if they signed in via Google but the Firestore doc wasn't created yet
          const initialUserData: UserData = {
            uid: currentUser.uid,
            email: currentUser.email || '',
            username: currentUser.email?.split('@')[0] || '',
            fullName: currentUser.displayName || pendingFullName.current || '', // Use displayName from Google or pendingFullName
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

    const publicRoutes = ['/', '/login'];

    if (user && userData) { // Check for both Firebase Auth user and Firestore userData
      if (!userData.phoneNumber && location.pathname !== '/number') {
        toast.info('Please complete your profile by adding a phone number.');
        navigate('/number');
        return;
      }
      // Keep the role check, but only if phoneNumber exists
      if (userData.phoneNumber && !userData.role && location.pathname !== '/role') {
        toast.info('Please select a role to continue.');
        navigate('/role');
        return;
      }
    }
    // Removed the !user redirection logic from here, ProtectedRoute handles it
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
          };
          await setDoc(userDocRef, initialUserData);
          setUserData(initialUserData);
        } else {
          console.log('Existing user, loading and updating data...');
          const existingUserData = userDocSnap.data() as UserData;
          // Update fullName for existing user if it's different or was not set
          const updatedFullName = pendingFullName.current || existingUserData.fullName || currentUser.displayName || '';
          const updatedUserData = { ...existingUserData, uid: currentUser.uid, fullName: updatedFullName };
          await updateDoc(userDocRef, { fullName: updatedFullName }); // Update in Firestore
          setUserData(updatedUserData);
        }
        toast.success('Logged in successfully!');
      }
    } catch (error: any) {
      console.error('Error during Google sign-in:', error);
      toast.error(`Login failed: ${error.message}`);
      pendingFullName.current = null; // Clear the ref on error
    }
  };

  const signOutUser = async () => {
    try {
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
    } catch (error: any) {
      console.error('Error updating role:', error);
      toast.error(`Failed to update role: ${error.message}`);
    }
  };

  return (
    <AuthContext.Provider value={{ user, userData, loading, signInWithGoogle, signOutUser, updateUserProfile, updateUserRole, uploadProfilePicture }}>
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
