'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  signOut, 
  User as FirebaseUser 
} from 'firebase/auth';
import { auth } from '@/lib/firebase';

interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  logout: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          const token = await firebaseUser.getIdToken();
          
          // Retrieve temporary password if set by register/login forms
          let tempPassword = null;
          if (typeof window !== 'undefined') {
            tempPassword = sessionStorage.getItem('temp_auth_pwd');
            sessionStorage.removeItem('temp_auth_pwd');
          }

          // Set cookie for Server Components to read
          document.cookie = `qrj_token=${token}; path=/; max-age=3600; SameSite=Lax; Secure`;
          
          // Sync user to local PostgreSQL
          await fetch('/api/auth/sync', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
              password: tempPassword,
              provider: firebaseUser.providerData[0]?.providerId || 'password',
            }),
          });

          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
          });
        } else {
          // Clear cookie
          document.cookie = 'qrj_token=; path=/; max-age=0; SameSite=Lax; Secure';
          setUser(null);
        }
      } catch (error) {
        console.error('Error during auth state change:', error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    try {
      await signOut(auth);
      document.cookie = 'qrj_token=; path=/; max-age=0; SameSite=Lax; Secure';
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
