// context/AuthContext.tsx
// จัดการสถานะ login ทั้งแอป — เก็บ token ใน secure storage, ดึงข้อมูล user จริงจาก /api/profile
// ใช้: const { user, login, register, logout, isLoading } = useAuth();
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { apiFetch, ApiError } from '@/lib/api';
import { saveToken, getToken, clearToken } from '@/lib/storage';
import type { User } from '@/types';

type AuthContextValue = {
  user: User | null;
  isLoading: boolean; // true ระหว่างเช็ค token ที่เก็บไว้ตอนเปิดแอปครั้งแรก
  login: (email: string, password: string) => Promise<void>; // throw ApiError ถ้าไม่สำเร็จ
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const data = await apiFetch<{ user: User }>('/api/profile');
      setUser(data.user);
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    (async () => {
      const token = await getToken();
      if (token) {
        await refreshUser();
      }
      setIsLoading(false);
    })();
  }, [refreshUser]);

  const login = useCallback(async (email: string, password: string) => {
    const data = await apiFetch<{ user: User; token: string }>('/api/auth/login', {
      method: 'POST',
      body: { email, password },
    });
    await saveToken(data.token);
    await refreshUser();
  }, [refreshUser]);

  const register = useCallback(async (email: string, password: string) => {
    const data = await apiFetch<{ user: User; token: string }>('/api/auth/register', {
      method: 'POST',
      body: { email, password },
    });
    await saveToken(data.token);
    await refreshUser();
  }, [refreshUser]);

  const logout = useCallback(async () => {
    await clearToken();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}

export { ApiError };
