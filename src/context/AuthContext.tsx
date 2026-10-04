import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AuthUser, login as loginApi, register as registerApi } from "../api/auth";
import { setForceLogout } from "../api/client";
import { clearToken, getToken, setToken } from "../utils/tokenStorage";
import { getMe } from "../api/profile";
import { clearPushToken } from "../api/admin";
import { forgetPushRegistration } from "../hooks/usePushNotifications";

const USER_KEY = "temple-connect-user";

export interface AuthUserWithRole extends AuthUser {
  role?: string;
}

interface AuthContextValue {
  user: AuthUserWithRole | null;
  loading: boolean;
  isAdmin: boolean;
  isPriest: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  /** Stores a new token/user (e.g. after a password change) or updates the cached profile. */
  updateSession: (user: AuthUserWithRole, token?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUserWithRole | null>(null);
  const [loading, setLoading] = useState(true);
  const isAdmin = user?.role === "admin";
  const isPriest = user?.role === "priest";

  async function clearLocal() {
    await clearToken();
    await AsyncStorage.removeItem(USER_KEY);
    setUser(null);
  }

  useEffect(() => {
    (async () => {
      try {
        const [token, storedUser] = await Promise.all([getToken(), AsyncStorage.getItem(USER_KEY)]);
        if (!token) { await clearLocal(); return; }
        if (storedUser) setUser(JSON.parse(storedUser));
        // Validate the session and pick up role/name changes made on the server.
        try {
          const me = await getMe();
          await AsyncStorage.setItem(USER_KEY, JSON.stringify(me));
          setUser(me);
        } catch (err: any) {
          if (err?.response?.status === 401) await clearLocal();
          // Network errors keep the cached user so the app still opens offline.
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function persist(token: string, authUser: AuthUserWithRole) {
    await setToken(token);
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(authUser));
    setUser(authUser);
  }

  // Ref so forceLogout (registered once) always runs the latest logic.
  const signOutRef = useRef(async (notifyServer: boolean) => {
    if (notifyServer) {
      // Stop push notifications for this account on this device.
      try { await clearPushToken(); } catch {}
    }
    await forgetPushRegistration();
    await clearLocal();
  });

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      isAdmin,
      isPriest,
      signIn: async (email, password) => {
        const res = await loginApi(email.trim(), password);
        await persist(res.token, res.user);
      },
      signUp: async (name, email, password) => {
        const res = await registerApi(name.trim(), email.trim(), password);
        await persist(res.token, res.user);
      },
      signOut: async () => {
        await signOutRef.current(true);
      },
      updateSession: async (nextUser, token) => {
        if (token) await setToken(token);
        await AsyncStorage.setItem(USER_KEY, JSON.stringify(nextUser));
        setUser(nextUser);
      },
    }),
    [user, loading, isAdmin, isPriest]
  );

  useEffect(() => {
    // The session is already invalid server-side, so skip the server call.
    setForceLogout(() => { signOutRef.current(false); });
  }, []);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
