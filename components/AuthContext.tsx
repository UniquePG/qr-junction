"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { authService } from "@/lib/api";

export type RestaurantAccessInfo = {
  kind: "owner" | "staff";
  restaurantId: number;
  restaurantName: string;
  staffId: number | null;
  roleName: string | null;
  permissions: string[] | "ALL";
};

export interface AuthUser {
  uid: string;
  id: number;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
  provider: string | null;
  role: string;
  restaurantAccess: RestaurantAccessInfo | null;
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

/** Guest surfaces never use auth — skip /api/auth/me to avoid 401 noise. */
function shouldSkipAuthBootstrap(pathname: string | null) {
  if (!pathname) return false;
  return /^\/(r|q|p)(\/|$)/.test(pathname);
}

function mapPublicUser(raw: any, restaurantAccess: any = null): AuthUser {
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
    restaurantAccess: restaurantAccess
      ? {
          kind: restaurantAccess.kind === "staff" ? "staff" : "owner",
          restaurantId: Number(restaurantAccess.restaurantId) || 0,
          restaurantName: String(restaurantAccess.restaurantName || ""),
          staffId: restaurantAccess.staffId == null ? null : Number(restaurantAccess.staffId),
          roleName: restaurantAccess.roleName ?? null,
          permissions: restaurantAccess.permissions === "ALL" ? "ALL" : Array.isArray(restaurantAccess.permissions) ? restaurantAccess.permissions.map(String) : [],
        }
      : null,
  };
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
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
        setUser(mapPublicUser(data.user, data.restaurantAccess));
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
        if (shouldSkipAuthBootstrap(pathname)) {
          return;
        }
        await refreshUser();
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [pathname, refreshUser]);

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
