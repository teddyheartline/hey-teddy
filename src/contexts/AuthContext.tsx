import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  getDocs,
  limit,
  query,
} from 'firebase/firestore';
import { auth, db, googleProvider, handleFirestoreError, OperationType } from '../lib/firebase';
import { UserProfile, UserRole } from '../types';

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userProfile: UserProfile | null;
  isAdmin: boolean;
  isAdminInitialized: boolean;
  isLoading: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (email: string, pass: string, displayName: string, username: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
  initializeFirstAdmin: () => Promise<boolean>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const OWNER_EMAIL = 'bussostudio6@gmail.com';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isAdminInitialized, setIsAdminInitialized] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Check if first admin has been initialized
  const checkAdminInitialization = async () => {
    try {
      const adminCol = collection(db, 'admins');
      const q = query(adminCol, limit(1));
      const snap = await getDocs(q);
      setIsAdminInitialized(!snap.empty);
    } catch {
      // Default to true if unable to read to stay safe
      setIsAdminInitialized(true);
    }
  };

  const fetchProfile = async (user: FirebaseUser) => {
    const userRef = doc(db, 'users', user.uid);
    try {
      const snap = await getDoc(userRef);

      // Check admin status in /admins/{uid} or matching the primary owner email
      let adminStatus = false;
      const adminRef = doc(db, 'admins', user.uid);
      const adminSnap = await getDoc(adminRef);

      if (adminSnap.exists() || (user.email && user.email.toLowerCase() === OWNER_EMAIL.toLowerCase())) {
        adminStatus = true;
        // Ensure admin doc exists if matching owner email
        if (!adminSnap.exists()) {
          try {
            await setDoc(adminRef, {
              uid: user.uid,
              email: user.email,
              initializedAt: new Date().toISOString(),
            });
            setIsAdminInitialized(true);
          } catch {
            // Rules will enforce if allowed
          }
        }
      }

      setIsAdmin(adminStatus);

      if (snap.exists()) {
        const data = snap.data() as UserProfile;
        // Sync role if admin
        if (adminStatus && data.role !== 'admin') {
          await updateDoc(userRef, { role: 'admin' });
          data.role = 'admin';
        }
        setUserProfile(data);
      } else {
        // Create initial profile
        const baseUsername = user.email ? user.email.split('@')[0] : `user_${user.uid.slice(0, 5)}`;
        const cleanUsername = baseUsername.replace(/[^a-zA-Z0-9_.]/g, '').toLowerCase() || `teddy_${Date.now()}`;

        const newProfile: UserProfile = {
          uid: user.uid,
          displayName: user.displayName || 'Client hey Teddy',
          username: cleanUsername,
          email: user.email || '',
          photoURL: user.photoURL || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80`,
          bio: adminStatus ? 'Photographe Officiel @ hey Teddy, 📸' : 'Passionné de photographie & client hey Teddy,',
          role: adminStatus ? 'admin' : 'client',
          followersCount: 0,
          followingCount: 0,
          postsCount: 0,
          createdAt: new Date().toISOString(),
        };

        await setDoc(userRef, newProfile);
        setUserProfile(newProfile);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `users/${user.uid}`);
    }
  };

  useEffect(() => {
    checkAdminInitialization();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        await fetchProfile(user);
      } else {
        setUserProfile(null);
        setIsAdmin(false);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    setIsLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Google Sign-In Error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (error) {
      console.error('Email Sign-In Error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const registerWithEmail = async (email: string, pass: string, displayName: string, username: string) => {
    setIsLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, pass);
      await updateProfile(cred.user, { displayName });

      const isOwner = email.toLowerCase() === OWNER_EMAIL.toLowerCase();
      const role: UserRole = isOwner ? 'admin' : 'client';

      const newProfile: UserProfile = {
        uid: cred.user.uid,
        displayName,
        username: username.toLowerCase().replace(/[^a-zA-Z0-9_.]/g, ''),
        email,
        photoURL: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80`,
        bio: isOwner ? 'Photographe Officiel @ hey Teddy, 📸' : 'Client @ hey Teddy,',
        role,
        followersCount: 0,
        followingCount: 0,
        postsCount: 0,
        createdAt: new Date().toISOString(),
      };

      await setDoc(doc(db, 'users', cred.user.uid), newProfile);
      if (isOwner) {
        await setDoc(doc(db, 'admins', cred.user.uid), {
          uid: cred.user.uid,
          email,
          initializedAt: new Date().toISOString(),
        });
        setIsAdmin(true);
        setIsAdminInitialized(true);
      }
      setUserProfile(newProfile);
    } catch (error) {
      console.error('Registration Error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUserProfile(null);
    setIsAdmin(false);
  };

  const updateUserProfile = async (data: Partial<UserProfile>) => {
    if (!currentUser || !userProfile) return;
    const userRef = doc(db, 'users', currentUser.uid);
    try {
      // Prevent client from escalating role unless admin
      const updatePayload = { ...data, updatedAt: new Date().toISOString() };
      if (!isAdmin && updatePayload.role && updatePayload.role !== 'client') {
        delete updatePayload.role;
      }
      await updateDoc(userRef, updatePayload);
      setUserProfile((prev) => (prev ? { ...prev, ...updatePayload } : null));
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${currentUser.uid}`);
    }
  };

  const initializeFirstAdmin = async (): Promise<boolean> => {
    if (!currentUser) return false;
    try {
      // Check if admin already exists
      const adminCol = collection(db, 'admins');
      const snap = await getDocs(query(adminCol, limit(1)));
      if (!snap.empty && !isAdmin) {
        throw new Error('Un administrateur principal existe déjà sur la plateforme.');
      }

      await setDoc(doc(db, 'admins', currentUser.uid), {
        uid: currentUser.uid,
        email: currentUser.email || '',
        initializedAt: new Date().toISOString(),
      });

      await updateDoc(doc(db, 'users', currentUser.uid), {
        role: 'admin',
        bio: 'Photographe Officiel & Fondateur @ hey Teddy, 📸',
      });

      setIsAdmin(true);
      setIsAdminInitialized(true);
      if (userProfile) {
        setUserProfile({ ...userProfile, role: 'admin' });
      }
      return true;
    } catch (error) {
      console.error('Failed to initialize first admin:', error);
      throw error;
    }
  };

  const refreshProfile = async () => {
    if (currentUser) {
      await fetchProfile(currentUser);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        isAdmin,
        isAdminInitialized,
        isLoading,
        loginWithGoogle,
        loginWithEmail,
        registerWithEmail,
        logout,
        updateUserProfile,
        initializeFirstAdmin,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
