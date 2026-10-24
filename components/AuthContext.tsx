'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
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
  emailVerified: boolean;
  provider: string | null;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  logout: async () => {},
  refreshUser: async () => {},
});

function mapAuthUser(
  firebaseUser: FirebaseUser,
  extras?: { emailVerified?: boolean; provider?: string | null },
): AuthUser {
  const provider = extras?.provider || firebaseUser.providerData[0]?.providerId || 'password';
  const oauth = provider === 'google.com' || provider === 'apple.com';
  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    displayName: firebaseUser.displayName,
    photoURL: firebaseUser.photoURL,
    emailVerified: extras?.emailVerified ?? (oauth || firebaseUser.emailVerified),
    provider,
  };
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const syncFirebaseUser = useCallback(async (firebaseUser: FirebaseUser) => {
    const token = await firebaseUser.getIdToken();

    let tempPassword = null;
    if (typeof window !== 'undefined') {
      tempPassword = sessionStorage.getItem('temp_auth_pwd');
      sessionStorage.removeItem('temp_auth_pwd');
    }

    document.cookie = `qrj_token=${token}; path=/; max-age=3600; SameSite=Lax; Secure`;

    const syncRes = await fetch('/api/auth/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        password: tempPassword,
        provider: firebaseUser.providerData[0]?.providerId || 'password',
      }),
    });

    let emailVerified: boolean | undefined;
    let provider: string | null = firebaseUser.providerData[0]?.providerId || 'password';
    if (syncRes.ok) {
      const syncData = await syncRes.json().catch(() => null);
      if (typeof syncData?.user?.emailVerified === 'boolean') {
        emailVerified = syncData.user.emailVerified;
      }
      if (syncData?.user?.provider) {
        provider = syncData.user.provider;
      }
    }

    setUser(mapAuthUser(firebaseUser, { emailVerified, provider }));
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          await syncFirebaseUser(firebaseUser);
        } else {
          document.cookie = 'qrj_token=; path=/; max-age=0; SameSite=Lax; Secure';
          setUser(null);
        }
      } catch (error) {
        console.error('Error during auth state change:', error);
        if (firebaseUser) {
          setUser(mapAuthUser(firebaseUser));
        } else {
          setUser(null);
        }
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [syncFirebaseUser]);

  const refreshUser = useCallback(async () => {
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) {
      setUser(null);
      return;
    }
    try {
      await firebaseUser.reload();
      await firebaseUser.getIdToken(true);
      await syncFirebaseUser(auth.currentUser || firebaseUser);
    } catch (error) {
      console.error('Error refreshing user:', error);
    }
  }, [syncFirebaseUser]);

  const logout = async () => {
    try {
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('qrj_otp_lock');
      }
      await signOut(auth);
      document.cookie = 'qrj_token=; path=/; max-age=0; SameSite=Lax; Secure';
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
