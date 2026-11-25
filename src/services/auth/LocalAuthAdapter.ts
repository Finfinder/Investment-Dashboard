import { IAuthAdapter, Setup2FAResult } from './IAuthAdapter';
import { AuthResponse, AuthState, UserProfile, UserRecord } from '../../types/user';
import { generateSecret, getOtpAuthUrl, generateBackupCodes, verifyTOTP } from '../../utils/totp';

const USERS_DB_KEY = 'inv_dashboard_registered_users_v2';
const SESSION_KEY = 'inv_dashboard_active_session_v2';
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export class LocalAuthAdapter implements IAuthAdapter {
  private getUsers(): UserRecord[] {
    const raw = localStorage.getItem(USERS_DB_KEY);
    if (!raw) {
      const defaultUser: UserRecord = {
        id: 'usr-demo-1',
        email: 'demo@xtb.pl',
        passwordHash: 'demo123',
        twoFactorSecret: 'JBSWY3DPEHPK3PXP', // Domyślny tajny klucz 2FA demo
        profile: {
          id: 'usr-demo-1',
          email: 'demo@xtb.pl',
          name: 'Inwestor Demo',
          twoFactorEnabled: false,
          createdAt: new Date().toISOString(),
          preferences: {
            theme: 'dark',
            defaultCurrency: 'PLN',
            autoSyncPrices: true
          }
        }
      };
      localStorage.setItem(USERS_DB_KEY, JSON.stringify([defaultUser]));
      return [defaultUser];
    }
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  private saveUsers(users: UserRecord[]): void {
    localStorage.setItem(USERS_DB_KEY, JSON.stringify(users));
  }

  private getStoredSession(): AuthState | null {
    const sessionRaw = sessionStorage.getItem(SESSION_KEY);
    if (sessionRaw) {
      try {
        const state: AuthState = JSON.parse(sessionRaw);
        if (state.isAuthenticated && state.user) {
          return state;
        }
      } catch {
        sessionStorage.removeItem(SESSION_KEY);
      }
    }

    const localRaw = localStorage.getItem(SESSION_KEY);
    if (localRaw) {
      try {
        const state: AuthState = JSON.parse(localRaw);
        if (state.expiresAt && state.expiresAt < Date.now()) {
          localStorage.removeItem(SESSION_KEY);
          return null;
        }
        if (state.isAuthenticated && state.user) {
          return state;
        }
      } catch {
        localStorage.removeItem(SESSION_KEY);
      }
    }

    return null;
  }

  private saveSession(user: UserProfile, remember30Days: boolean): AuthState {
    const expiresAt = remember30Days ? Date.now() + THIRTY_DAYS_MS : undefined;
    const authState: AuthState = {
      isAuthenticated: true,
      user,
      rememberMe: remember30Days,
      expiresAt
    };

    if (remember30Days) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(authState));
      sessionStorage.removeItem(SESSION_KEY);
    } else {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(authState));
      localStorage.removeItem(SESSION_KEY);
    }

    return authState;
  }

  async getAuthState(): Promise<AuthState> {
    const stored = this.getStoredSession();
    if (stored) {
      const users = this.getUsers();
      const updatedUser = users.find(u => u.id === stored.user?.id);
      if (updatedUser) {
        stored.user = updatedUser.profile;
      }
      return stored;
    }
    return { isAuthenticated: false, user: null };
  }

  async register(
    name: string,
    email: string,
    pass: string,
    enable2FA: boolean = false
  ): Promise<AuthResponse> {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !pass || !name) {
      return { success: false, message: 'Wszystkie pola są wymagane.' };
    }

    const users = this.getUsers();
    if (users.some(u => u.email.toLowerCase() === cleanEmail)) {
      return { success: false, message: 'Użytkownik o takim adresie e-mail już istnieje.' };
    }

    const userId = 'usr-' + Date.now();
    const newUser: UserRecord = {
      id: userId,
      email: cleanEmail,
      passwordHash: pass,
      profile: {
        id: userId,
        email: cleanEmail,
        name: name.trim(),
        twoFactorEnabled: false, // Będzie włączone po potwierdzeniu kodu QR
        createdAt: new Date().toISOString(),
        preferences: {
          theme: 'dark',
          defaultCurrency: 'PLN',
          autoSyncPrices: true
        }
      }
    };

    users.push(newUser);
    this.saveUsers(users);

    if (enable2FA) {
      return {
        success: true,
        requires2FA: true,
        tempUserId: userId,
        message: 'Konto zarejestrowane. Skonfiguruj teraz 2FA w Microsoft Authenticator.'
      };
    }

    this.saveSession(newUser.profile, true);

    return {
      success: true,
      user: newUser.profile,
      message: 'Rejestracja zakończona sukcesem.'
    };
  }

  async login(email: string, pass: string, remember30Days: boolean = true): Promise<AuthResponse> {
    const cleanEmail = email.trim().toLowerCase();
    const users = this.getUsers();
    const found = users.find(u => u.email.toLowerCase() === cleanEmail);

    if (!found || found.passwordHash !== pass) {
      return { success: false, message: 'Nieprawidłowy adres e-mail lub hasło.' };
    }

    if (found.profile.twoFactorEnabled) {
      return {
        success: true,
        requires2FA: true,
        tempUserId: found.id,
        message: 'Wymagana weryfikacja 2FA.'
      };
    }

    this.saveSession(found.profile, remember30Days);

    return {
      success: true,
      user: found.profile,
      message: 'Zalogowano pomyślnie.'
    };
  }

  async verify2FA(userId: string, token: string, remember30Days: boolean = true): Promise<AuthResponse> {
    const users = this.getUsers();
    const found = users.find(u => u.id === userId);

    if (!found) {
      return { success: false, message: 'Nie odnaleziono użytkownika.' };
    }

    const secret = found.twoFactorSecret || 'JBSWY3DPEHPK3PXP';
    const backupCodes = (found as any).backupCodes || [];

    const result = await verifyTOTP(token, secret, backupCodes);

    if (!result.valid) {
      return {
        success: false,
        message: 'Nieprawidłowy kod 2FA lub kod odzyskiwania. Sprawdź czas w aplikacji (np. Microsoft Authenticator) lub użyj kodu awaryjnego lub domyślnego (123456).'
      };
    }

    // Jeśli użyto kodu jednorazowego backup, usuwamy go z dostępnej listy
    if (result.usedBackupCode) {
      (found as any).backupCodes = backupCodes.filter((c: string) => c !== result.usedBackupCode);
      this.saveUsers(users);
    }

    this.saveSession(found.profile, remember30Days);

    return {
      success: true,
      user: found.profile,
      message: 'Kod 2FA zweryfikowany pomyślnie.'
    };
  }

  async setup2FA(userId?: string, userEmail?: string): Promise<Setup2FAResult> {
    const users = this.getUsers();
    const targetUser = users.find(u => u.id === userId) || users[0];
    const email = userEmail || targetUser?.email || 'inwestor@xtb.pl';

    const secret = generateSecret(16);
    const backupCodes = generateBackupCodes(8);
    const otpAuthUrl = getOtpAuthUrl(email, secret, 'Investment Dashboard');

    return {
      secret,
      otpAuthUrl,
      backupCodes
    };
  }

  async confirm2FA(userId: string, secret: string, code: string, backupCodes: string[]): Promise<boolean> {
    const users = this.getUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) return false;

    const result = await verifyTOTP(code, secret, backupCodes);
    if (!result.valid) return false;

    users[userIndex].twoFactorSecret = secret;
    (users[userIndex] as any).backupCodes = backupCodes;
    users[userIndex].profile.twoFactorEnabled = true;

    this.saveUsers(users);
    this.saveSession(users[userIndex].profile, true);

    return true;
  }

  async disable2FA(userId?: string): Promise<boolean> {
    const session = this.getStoredSession();
    const targetId = userId || session?.user?.id;
    if (!targetId) return false;

    const users = this.getUsers();
    const userIndex = users.findIndex(u => u.id === targetId);
    if (userIndex !== -1) {
      users[userIndex].profile.twoFactorEnabled = false;
      users[userIndex].twoFactorSecret = undefined;
      delete (users[userIndex] as any).backupCodes;

      this.saveUsers(users);
      this.saveSession(users[userIndex].profile, session?.rememberMe ?? true);
      return true;
    }

    return false;
  }

  async deleteAccount(userId?: string): Promise<boolean> {
    const session = this.getStoredSession();
    const targetId = userId || session?.user?.id;
    if (!targetId) return false;

    // Usuwamy użytkownika z bazy zarejestrowanych użytkowników
    let users = this.getUsers();
    users = users.filter(u => u.id !== targetId);
    this.saveUsers(users);

    // Czyszczenie odosobnionego magazynu portfeli i transakcji użytkownika
    localStorage.removeItem(`inv_dashboard_portfolios_user_${targetId}`);
    localStorage.removeItem(`inv_dashboard_transactions_user_${targetId}`);

    // Czyszczenie sesji
    await this.logout();
    return true;
  }

  async logout(): Promise<void> {
    localStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(SESSION_KEY);
  }

  async toggle2FA(enable: boolean): Promise<boolean> {
    if (!enable) {
      return this.disable2FA();
    }
    return true;
  }
}
