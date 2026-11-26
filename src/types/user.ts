export interface UserProfile {
  id: string;
  email: string;
  name: string;
  twoFactorEnabled: boolean;
  avatarUrl?: string;
  createdAt?: string;
  preferences: {
    theme: 'dark' | 'light';
    defaultCurrency: string;
    autoSyncPrices: boolean;
  };
}

export interface AuthState {
  isAuthenticated: boolean;
  user: UserProfile | null;
  expiresAt?: number;
  rememberMe?: boolean;
  requires2FA?: boolean;
  tempUserId?: string;
  token?: string;
}

export interface UserRecord {
  id: string;
  email: string;
  passwordHash: string; // w demo prosty tekst/hash
  profile: UserProfile;
  twoFactorSecret?: string;
  backupCodes?: string[];
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  requires2FA?: boolean;
  tempUserId?: string;
  user?: UserProfile;
}
