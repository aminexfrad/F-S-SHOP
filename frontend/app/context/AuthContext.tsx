'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface AuthUser {
  id: string;
  username: string;
  email: string;
}

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  loading : boolean;
}

interface AuthContextType extends AuthState {
  login: (userData: AuthUser, accessToken: string, refreshToken: string) => void;
  logout: () => void;
  updateTokens: (accessToken: string, refreshToken: string) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  loading: false,
  login: () => {},
  logout: () => {},
  updateTokens: () => {},
});

const getCookie = (name: string) => {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
};

const setCookie = (name: string, value: string, days: number) => {
  const expires = new Date();
  expires.setDate(expires.getDate() + days);
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; expires=${expires.toUTCString()}`;
};

const deleteCookie = (name: string) => {
  document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC`;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
    loading: false,
  });

  const router = useRouter();

  useEffect(() => {
    const storedAccessToken = getCookie('accessToken');
    const storedRefreshToken = getCookie('refreshToken');
    const storedUser = getCookie('user');

    if (storedAccessToken && storedRefreshToken && storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setAuthState({
          user,
          accessToken: storedAccessToken,
          refreshToken: storedRefreshToken,
          isAuthenticated: true,
          loading: false,
        });
      } catch {
        deleteCookie('accessToken');
        deleteCookie('refreshToken');
        deleteCookie('user');
      }
    }
  }, []);

  const login = (userData: AuthUser, accessToken: string, refreshToken: string) => {
    setAuthState({
      user: userData,
      accessToken,
      refreshToken,
      isAuthenticated: true,
      loading: false,
    });

    setCookie('accessToken', accessToken, 1);
    setCookie('refreshToken', refreshToken, 7);
    setCookie('user', JSON.stringify(userData), 7);
  };

  const logout = () => {
    setAuthState({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      loading: false,
    });

    deleteCookie('accessToken');
    deleteCookie('refreshToken');
    deleteCookie('user');

    router.push('/login');
  };

  const updateTokens = (accessToken: string, refreshToken: string) => {
    setAuthState(prev => ({
      ...prev,
      accessToken,
      refreshToken,
    }));

    setCookie('accessToken', accessToken, 1);
    setCookie('refreshToken', refreshToken, 7);
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        logout,
        updateTokens,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);