// context/AuthContext.tsx
// จัดการสถานะ login ทั้งแอป — เก็บ token ใน secure storage, ดึงข้อมูล user จริงจาก /api/profile
// ใช้: const { user, avatarUri, updateAvatarUri, login, register, logout, isLoading } = useAuth();
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { apiFetch, ApiError } from '@/lib/api';
import { saveToken, getToken, clearToken, saveAvatarUri, getAvatarUri, clearAvatarUri } from '@/lib/storage';
import type { User } from '@/types';

type AuthContextValue = {
  user: User | null;
  avatarUri: string | null;
  updateAvatarUri: (uri: string | null) => Promise<void>;
  isLoading: boolean; // true ระหว่างเช็ค token ที่เก็บไว้ตอนเปิดแอปครั้งแรก
  login: (email: string, password: string) => Promise<void>; // throw ApiError ถ้าไม่สำเร็จ
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadAvatarForUser = useCallback(async (userId: string, remoteAvatarUrl?: string | null) => {
    try {
      const saved = await getAvatarUri(userId);
      if (saved) {
        setAvatarUri(saved);
      } else if (remoteAvatarUrl) {
        setAvatarUri(remoteAvatarUrl);
      } else {
        setAvatarUri(null);
      }
    } catch {
      setAvatarUri(remoteAvatarUrl ?? null);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const data = await apiFetch<{ user: User }>('/api/profile');
      setUser(data.user);
      if (data.user?.id) {
        await loadAvatarForUser(data.user.id, data.user.avatarUrl);
      }
    } catch {
      setUser(null);
      setAvatarUri(null);
    }
  }, [loadAvatarForUser]);

  useEffect(() => {
    (async () => {
      const token = await getToken();
      if (token) {
        await refreshUser();
      }
      setIsLoading(false);
    })();
  }, [refreshUser]);

  const updateAvatarUri = useCallback(
    async (uri: string | null) => {
      setAvatarUri(uri);
      if (user?.id) {
        if (uri) {
          await saveAvatarUri(user.id, uri);
        } else {
          await clearAvatarUri(user.id);
        }
      }
    },
    [user?.id]
  );

  const login = useCallback(async (email: string, password: string) => {
    const data = await apiFetch<{ user: User; token: string }>('/api/auth/login', {
      method: 'POST',
      body: { email, password },
    });
    await saveToken(data.token);
    if (data.user) {
      setUser(data.user);
      if (data.user.id) {
        await loadAvatarForUser(data.user.id, data.user.avatarUrl);
      }
    }
    await refreshUser();
  }, [loadAvatarForUser, refreshUser]);

  const register = useCallback(async (email: string, password: string) => {
    const data = await apiFetch<{ user: User; token: string }>('/api/auth/register', {
      method: 'POST',
      body: { email, password },
    });
    await saveToken(data.token);
    if (data.user) {
      setUser(data.user);
      if (data.user.id) {
        await loadAvatarForUser(data.user.id, data.user.avatarUrl);
      }
    }
    await refreshUser();
  }, [loadAvatarForUser, refreshUser]);

  const logout = useCallback(async () => {
    await clearToken();
    setUser(null);
    setAvatarUri(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        avatarUri,
        updateAvatarUri,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
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
