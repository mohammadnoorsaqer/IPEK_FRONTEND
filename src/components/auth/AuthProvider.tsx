'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { clearTokens, getAccessToken } from '@/lib/http';
import {
  getMe,
  login as loginApi,
  loginPhone as loginPhoneApi,
  logout as logoutApi,
  register as registerApi,
  registerPhone as registerPhoneApi,
} from '@/lib/api';
import type { User } from '@/lib/types';

type AuthContextValue = {
  user: User | null;
  ready: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginPhone: (idToken: string) => Promise<void>;
  register: (payload: {
    username: string;
    email: string;
    password: string;
    phone_number?: string;
  }) => Promise<void>;
  registerPhone: (payload: {
    username: string;
    phone_number: string;
    idToken: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function boot() {
      if (!getAccessToken()) {
        if (!cancelled) setReady(true);
        return;
      }
      try {
        const me = await getMe();
        if (!cancelled) setUser(me);
      } catch {
        clearTokens();
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setReady(true);
      }
    }
    boot();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const next = await loginApi(email, password);
    setUser(next);
  }, []);

  const loginPhone = useCallback(async (idToken: string) => {
    const next = await loginPhoneApi(idToken);
    setUser(next);
  }, []);

  const register = useCallback(
    async (payload: {
      username: string;
      email: string;
      password: string;
      phone_number?: string;
    }) => {
      const next = await registerApi({
        ...payload,
        username_ar: payload.username,
      });
      setUser(next);
    },
    [],
  );

  const registerPhone = useCallback(
    async (payload: {
      username: string;
      phone_number: string;
      idToken: string;
    }) => {
      const next = await registerPhoneApi(payload);
      setUser(next);
    },
    [],
  );

  const logout = useCallback(async () => {
    await logoutApi();
    clearTokens();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, ready, login, loginPhone, register, registerPhone, logout }),
    [user, ready, login, loginPhone, register, registerPhone, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
