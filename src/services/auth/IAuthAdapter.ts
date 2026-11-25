import { AuthResponse, AuthState } from '../../types/user';

export interface Setup2FAResult {
  secret: string;
  otpAuthUrl: string;
  backupCodes: string[];
}

export interface IAuthAdapter {
  getAuthState(): Promise<AuthState>;
  login(email: string, pass: string, remember30Days?: boolean): Promise<AuthResponse>;
  verify2FA(userId: string, token: string, remember30Days?: boolean): Promise<AuthResponse>;
  register(name: string, email: string, pass: string, enable2FA?: boolean): Promise<AuthResponse>;
  setup2FA(userId?: string, userEmail?: string): Promise<Setup2FAResult>;
  confirm2FA(userId: string, secret: string, code: string, backupCodes: string[]): Promise<boolean>;
  disable2FA(userId?: string): Promise<boolean>;
  deleteAccount(userId?: string): Promise<boolean>;
  logout(): Promise<void>;
  toggle2FA(enable: boolean): Promise<boolean>;
}
