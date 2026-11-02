"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { authService } from "@/lib/api";

export interface AuthUser {
  uid: string;
  id: number;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
  provider: string | null;
  role: string;
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

function mapPublicUser(raw: any): AuthUser {
  const id = Number(raw?.id) || 0;
  return {
    uid: String(id),
    id,
    email: raw?.email ?? null,
    displayName: raw?.name ?? null,
    photoURL: raw?.avatarUrl ?? null,
    emailVerified: Boolean(raw?.emailVerified),
    provider: raw?.provider ?? "password",
    role: raw?.role || "USER",
  };
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const res = await authService.me();
      if (!res.ok) {
        setUser(null);
        return;
      }
      const data = await res.json().catch(() => null);
      if (data?.user) {
        setUser(mapPublicUser(data.user));
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Error refreshing user:", error);
      setUser(null);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await refreshUser();
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [refreshUser]);

  const logout = async () => {
    try {
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("qrj_otp_lock");
        sessionStorage.removeItem("temp_auth_pwd");
      }
      await authService.logout();
      try {
        const { auth } = await import("@/lib/firebase");
        await auth.signOut();
      } catch {
        /* ignore Firebase client cleanup */
      }
      setUser(null);
    } catch (error) {
      console.error("Error signing out:", error);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
