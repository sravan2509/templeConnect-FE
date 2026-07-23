import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AuthUser, login as loginApi, register as registerApi } from "../api/auth";
import { TOKEN_KEY } from "../api/client";

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
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUserWithRole | null>(null);
  const [loading, setLoading] = useState(true);
  const isAdmin = user?.role === "admin";
  const isPriest = user?.role === "priest" || isAdmin;

  useEffect(() => {
    (async () => {
      const storedUser = await AsyncStorage.getItem(USER_KEY);
      if (storedUser) setUser(JSON.parse(storedUser));
      setLoading(false);
    })();
  }, []);

  async function persist(token: string, authUser: any) {
    await AsyncStorage.setItem(TOKEN_KEY, token);
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(authUser));
    setUser(authUser);
  }

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      isAdmin,
      isPriest,
      signIn: async (email, password) => {
        const res = await loginApi(email, password);
        await persist(res.token, res.user);
      },
      signUp: async (name, email, password) => {
        const res = await registerApi(name, email, password);
        await persist(res.token, res.user);
      },
      signOut: async () => {
        await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
        setUser(null);
      },
    }),
    [user, loading, isAdmin, isPriest]
  );

  useEffect(() => {
    import("../api/client").then(({ setForceLogout }) => {
      setForceLogout(() => {
        value.signOut();
      });
    });
  }, [value]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
