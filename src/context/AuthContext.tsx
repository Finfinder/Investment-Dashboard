import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthResponse, AuthState } from '../types/user';
import { LocalAuthAdapter } from '../services/auth/LocalAuthAdapter';
import { Setup2FAResult } from '../services/auth/IAuthAdapter';

interface AuthContextType {
  authState: AuthState;
  isLoading: boolean;
  login: (email: string, pass: string, remember30Days?: boolean) => Promise<AuthResponse>;
  register: (name: string, email: string, pass: string, enable2FA?: boolean) => Promise<AuthResponse>;
  verify2FA: (userId: string, token: string, remember30Days?: boolean) => Promise<AuthResponse>;
  setup2FA: (userId?: string, userEmail?: string) => Promise<Setup2FAResult>;
  confirm2FA: (userId: string, secret: string, code: string, backupCodes: string[]) => Promise<boolean>;
  disable2FA: (userId?: string) => Promise<boolean>;
  deleteAccount: (userId?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  toggle2FA: (enable: boolean) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const authAdapter = new LocalAuthAdapter();

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({ isAuthenticated: false, user: null });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshState = async () => {
    setIsLoading(true);
    try {
      const state = await authAdapter.getAuthState();
      setAuthState(state);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshState();
  }, []);

  const login = async (email: string, pass: string, remember30Days: boolean = true): Promise<AuthResponse> => {
    const res = await authAdapter.login(email, pass, remember30Days);
    if (res.success && res.user) {
      await refreshState();
    }
    return res;
  };

  const register = async (
    name: string, 
    email: string, 
    pass: string, 
    enable2FA: boolean = false
  ): Promise<AuthResponse> => {
    const res = await authAdapter.register(name, email, pass, enable2FA);
    if (res.success && res.user) {
      await refreshState();
    }
    return res;
  };

  const verify2FA = async (userId: string, token: string, remember30Days: boolean = true): Promise<AuthResponse> => {
    const res = await authAdapter.verify2FA(userId, token, remember30Days);
    if (res.success && res.user) {
      await refreshState();
    }
    return res;
  };

  const setup2FA = async (userId?: string, userEmail?: string): Promise<Setup2FAResult> => {
    return authAdapter.setup2FA(userId, userEmail);
  };

  const confirm2FA = async (userId: string, secret: string, code: string, backupCodes: string[]): Promise<boolean> => {
    const ok = await authAdapter.confirm2FA(userId, secret, code, backupCodes);
    if (ok) {
      await refreshState();
    }
    return ok;
  };

  const disable2FA = async (userId?: string): Promise<boolean> => {
    const ok = await authAdapter.disable2FA(userId);
    if (ok) {
      await refreshState();
    }
    return ok;
  };

  const deleteAccount = async (userId?: string): Promise<boolean> => {
    const ok = await authAdapter.deleteAccount(userId);
    setAuthState({ isAuthenticated: false, user: null });
    return ok;
  };

  const logout = async () => {
    await authAdapter.logout();
    setAuthState({ isAuthenticated: false, user: null });
  };

  const toggle2FA = async (enable: boolean) => {
    const ok = await authAdapter.toggle2FA(enable);
    if (authState.user) {
      setAuthState(prev => ({
        ...prev,
        user: prev.user ? { ...prev.user, twoFactorEnabled: ok } : null
      }));
    }
    return ok;
  };

  return (
    <AuthContext.Provider value={{
      authState,
      isLoading,
      login,
      register,
      verify2FA,
      setup2FA,
      confirm2FA,
      disable2FA,
      deleteAccount,
      logout,
      toggle2FA
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
