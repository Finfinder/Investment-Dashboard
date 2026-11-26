import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { LocalAuthAdapter } from '../LocalAuthAdapter';
import { generateTOTP } from '../../../utils/totp';
import type { UserRecord } from '../../../types/user';

const USERS_DB_KEY = 'inv_dashboard_registered_users_v2';
const SESSION_KEY = 'inv_dashboard_active_session_v2';
/** Public RFC 4226/6238 vector - must never authenticate an account. */
const PUBLIC_VECTOR_SECRET = 'JBSWY3DPEHPK3PXP';
/** Arbitrary valid Base32 secret used as a real account secret in fixtures. */
const TEST_SECRET = 'KRSXG5CTMVRXEZLU';

/** Read the persisted user records written by the adapter. */
function readUsers(): UserRecord[] {
  const raw = localStorage.getItem(USERS_DB_KEY);
  return raw ? (JSON.parse(raw) as UserRecord[]) : [];
}

interface SeedOptions {
  id: string;
  email: string;
  twoFactorEnabled?: boolean;
  twoFactorSecret?: string;
  backupCodes?: string[];
}

/** Persist a single user record so the adapter works on a controlled fixture. */
function seedUser(options: SeedOptions): void {
  const { id, email, twoFactorEnabled = true, twoFactorSecret, backupCodes } = options;
  const record: UserRecord = {
    id,
    email,
    passwordHash: 'secret-pass',
    twoFactorSecret,
    backupCodes,
    profile: {
      id,
      email,
      name: 'Test User',
      twoFactorEnabled,
      preferences: { theme: 'dark', defaultCurrency: 'PLN', autoSyncPrices: true }
    }
  };
  localStorage.setItem(USERS_DB_KEY, JSON.stringify([record]));
}

describe('LocalAuthAdapter - 2FA verification hardening (SEC-15)', () => {
  let adapter: LocalAuthAdapter;

  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    adapter = new LocalAuthAdapter();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllEnvs();
  });

  it('rejects 2FA when the account has no secret instead of using a public fallback', async () => {
    seedUser({ id: 'usr-no-secret', email: 'no-secret@example.com' });

    // The RFC 4226/6238 public test vector must not authenticate this account.
    const publicVectorCode = await generateTOTP(PUBLIC_VECTOR_SECRET);
    const result = await adapter.verify2FA('usr-no-secret', publicVectorCode);

    expect(result.success).toBe(false);
    expect(result.user).toBeUndefined();
    expect(result.message).toMatch(/nie ma skonfigurowanego/i);
  });

  it('rejects the universal demo code when the account has no secret', async () => {
    seedUser({ id: 'usr-no-secret-2', email: 'no-secret-2@example.com' });

    vi.stubEnv('DEV', true);
    const result = await adapter.verify2FA('usr-no-secret-2', '123456');

    expect(result.success).toBe(false);
  });

  it('verifies 2FA successfully with the configured secret', async () => {
    seedUser({
      id: 'usr-with-secret',
      email: 'with-secret@example.com',
      twoFactorSecret: TEST_SECRET
    });

    const code = await generateTOTP(TEST_SECRET);
    const result = await adapter.verify2FA('usr-with-secret', code);

    expect(result.success).toBe(true);
    expect(result.user?.id).toBe('usr-with-secret');
  });

  it('rejects 2FA when the account has a secret but 2FA is disabled', async () => {
    seedUser({
      id: 'usr-disabled',
      email: 'disabled@example.com',
      twoFactorEnabled: false,
      twoFactorSecret: TEST_SECRET
    });

    const code = await generateTOTP(TEST_SECRET);
    const result = await adapter.verify2FA('usr-disabled', code);

    expect(result.success).toBe(false);
  });

  it('sanitizes a legacy record that stored the public test vector', async () => {
    seedUser({
      id: 'usr-legacy',
      email: 'legacy@example.com',
      twoFactorSecret: PUBLIC_VECTOR_SECRET,
      backupCodes: ['AAAA1111']
    });

    const publicVectorCode = await generateTOTP(PUBLIC_VECTOR_SECRET);
    const result = await adapter.verify2FA('usr-legacy', publicVectorCode);

    expect(result.success).toBe(false);
    const stored = readUsers().find(u => u.id === 'usr-legacy');
    expect(stored?.twoFactorSecret).toBeUndefined();
    expect(stored?.backupCodes).toBeUndefined();
    // SEC-16: twoFactorEnabled must be reset to false so legacy accounts are not permanently locked out
    expect(stored?.profile.twoFactorEnabled).toBe(false);

    // The legacy user must be able to log in normally and configure 2FA afresh
    const loginResult = await adapter.login('legacy@example.com', 'secret-pass');
    expect(loginResult.success).toBe(true);
    expect(loginResult.requires2FA).toBeUndefined();
    expect(loginResult.user?.id).toBe('usr-legacy');
  });

  it('handles invalid non-array JSON in users storage gracefully', async () => {
    localStorage.setItem(USERS_DB_KEY, JSON.stringify({ invalid: 'shape' }));
    const result = await adapter.login('anyone@example.com', 'pass');
    expect(result.success).toBe(false);
  });

  it('consumes a used backup code so it cannot be reused', async () => {
    seedUser({
      id: 'usr-backup',
      email: 'backup@example.com',
      twoFactorSecret: TEST_SECRET,
      backupCodes: ['12AB34CD', '56EF78GH']
    });

    const first = await adapter.verify2FA('usr-backup', '12AB34CD');
    expect(first.success).toBe(true);
    expect(first.user?.id).toBe('usr-backup');

    const stored = readUsers().find(u => u.id === 'usr-backup');
    expect(stored?.backupCodes).toEqual(['56EF78GH']);

    const reuse = await adapter.verify2FA('usr-backup', '12AB34CD');
    expect(reuse.success).toBe(false);
  });

  it('rejects 2FA for an unknown user', async () => {
    const result = await adapter.verify2FA('usr-missing', '000000');
    expect(result.success).toBe(false);
    expect(result.message).toMatch(/nie odnaleziono/i);
  });

  it('does not seed the demo account with a public 2FA secret', async () => {
    // Logging in as the demo user forces the adapter to create its default record.
    const loginResult = await adapter.login('demo@xtb.pl', 'demo123');
    expect(loginResult.success).toBe(true);
    expect(loginResult.requires2FA).toBeFalsy();

    const demo = readUsers().find(u => u.id === 'usr-demo-1');
    expect(demo).toBeDefined();
    expect(demo?.twoFactorSecret).toBeUndefined();
    expect(demo?.profile.twoFactorEnabled).toBe(false);
  });
});

describe('LocalAuthAdapter - account and session lifecycle', () => {
  let adapter: LocalAuthAdapter;

  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    adapter = new LocalAuthAdapter();
  });

  it('returns an unauthenticated state when no session exists', async () => {
    const state = await adapter.getAuthState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
  });

  it('registers a new user and rejects duplicates', async () => {
    const created = await adapter.register('Jan Kowalski', 'Jan@Example.com', 'pass-123');
    expect(created.success).toBe(true);
    expect(created.user?.email).toBe('jan@example.com');

    const duplicate = await adapter.register('Jan Kowalski', 'jan@example.com', 'pass-123');
    expect(duplicate.success).toBe(false);
    expect(duplicate.message).toMatch(/już istnieje/i);
  });

  it('rejects registration when required fields are missing', async () => {
    const result = await adapter.register('', 'user@example.com', 'pass-123');
    expect(result.success).toBe(false);
    expect(result.message).toMatch(/wszystkie pola/i);
  });

  it('registers with 2FA requested and requires verification', async () => {
    const result = await adapter.register('Anna', 'anna@example.com', 'pass-123', true);
    expect(result.success).toBe(true);
    expect(result.requires2FA).toBe(true);
    expect(result.tempUserId).toBeDefined();
  });

  it('logs in with valid credentials and rejects invalid ones', async () => {
    await adapter.register('Piotr', 'piotr@example.com', 'pass-123');

    const wrongPassword = await adapter.login('piotr@example.com', 'bad-pass');
    expect(wrongPassword.success).toBe(false);

    const unknownUser = await adapter.login('nobody@example.com', 'pass-123');
    expect(unknownUser.success).toBe(false);

    const ok = await adapter.login('Piotr@Example.com', 'pass-123');
    expect(ok.success).toBe(true);
    expect(ok.user?.email).toBe('piotr@example.com');
  });

  it('persists the session for remembered logins and clears it on logout', async () => {
    await adapter.register('Ewa', 'ewa@example.com', 'pass-123');
    await adapter.login('ewa@example.com', 'pass-123', true);

    expect(localStorage.getItem(SESSION_KEY)).not.toBeNull();
    expect(sessionStorage.getItem(SESSION_KEY)).toBeNull();

    const state = await adapter.getAuthState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.user?.email).toBe('ewa@example.com');

    await adapter.logout();
    expect(localStorage.getItem(SESSION_KEY)).toBeNull();
    expect(sessionStorage.getItem(SESSION_KEY)).toBeNull();

    const afterLogout = await adapter.getAuthState();
    expect(afterLogout.isAuthenticated).toBe(false);
  });

  it('stores non-remembered sessions in sessionStorage', async () => {
    await adapter.register('Ola', 'ola@example.com', 'pass-123');
    await adapter.login('ola@example.com', 'pass-123', false);

    expect(sessionStorage.getItem(SESSION_KEY)).not.toBeNull();
    expect(localStorage.getItem(SESSION_KEY)).toBeNull();
  });

  it('drops an expired persisted session', async () => {
    localStorage.setItem(SESSION_KEY, JSON.stringify({
      isAuthenticated: true,
      user: { id: 'usr-expired' },
      expiresAt: Date.now() - 1000
    }));

    const state = await adapter.getAuthState();
    expect(state.isAuthenticated).toBe(false);
    expect(localStorage.getItem(SESSION_KEY)).toBeNull();
  });

  it('recovers from corrupted session JSON', async () => {
    sessionStorage.setItem(SESSION_KEY, 'not-json');
    const state = await adapter.getAuthState();
    expect(state.isAuthenticated).toBe(false);
  });

  it('sets up, confirms and disables 2FA', async () => {
    const registered = await adapter.register('Tomasz', 'tomasz@example.com', 'pass-123');
    const userId = registered.user!.id;

    const setup = await adapter.setup2FA(userId, 'tomasz@example.com');
    expect(setup.secret).toHaveLength(16);
    expect(setup.otpAuthUrl).toContain('otpauth://totp/');
    expect(setup.backupCodes).toHaveLength(8);

    const code = await generateTOTP(setup.secret);
    const confirmed = await adapter.confirm2FA(userId, setup.secret, code, setup.backupCodes);
    expect(confirmed).toBe(true);

    const stored = readUsers().find(u => u.id === userId);
    expect(stored?.twoFactorSecret).toBe(setup.secret);
    expect(stored?.profile.twoFactorEnabled).toBe(true);

    expect(await adapter.disable2FA(userId)).toBe(true);
    const afterDisable = readUsers().find(u => u.id === userId);
    expect(afterDisable?.twoFactorSecret).toBeUndefined();
    expect(afterDisable?.profile.twoFactorEnabled).toBe(false);
  });

  it('rejects confirming 2FA with an invalid code or unknown user', async () => {
    const registered = await adapter.register('Marta', 'marta@example.com', 'pass-123');
    const userId = registered.user!.id;

    expect(await adapter.confirm2FA(userId, PUBLIC_VECTOR_SECRET, '000000', [])).toBe(false);
    expect(await adapter.confirm2FA('usr-unknown', PUBLIC_VECTOR_SECRET, '000000', [])).toBe(false);
  });

  it('login requires 2FA once it is enabled', async () => {
    const registered = await adapter.register('Kuba', 'kuba@example.com', 'pass-123');
    const userId = registered.user!.id;
    const setup = await adapter.setup2FA(userId, 'kuba@example.com');
    const code = await generateTOTP(setup.secret);
    await adapter.confirm2FA(userId, setup.secret, code, setup.backupCodes);

    const login = await adapter.login('kuba@example.com', 'pass-123');
    expect(login.success).toBe(true);
    expect(login.requires2FA).toBe(true);
    expect(login.tempUserId).toBe(userId);
  });

  it('toggles 2FA and deletes the account with its isolated storage', async () => {
    const registered = await adapter.register('Adam', 'adam@example.com', 'pass-123');
    const userId = registered.user!.id;

    expect(await adapter.toggle2FA(true)).toBe(true);
    expect(await adapter.toggle2FA(false)).toBe(true);

    localStorage.setItem(`inv_dashboard_portfolios_user_${userId}`, '[]');
    localStorage.setItem(`inv_dashboard_transactions_user_${userId}`, '[]');

    expect(await adapter.deleteAccount(userId)).toBe(true);
    expect(readUsers().some(u => u.id === userId)).toBe(false);
    expect(localStorage.getItem(`inv_dashboard_portfolios_user_${userId}`)).toBeNull();
    expect(localStorage.getItem(`inv_dashboard_transactions_user_${userId}`)).toBeNull();
  });

  it('returns false when disabling 2FA without a resolvable user', async () => {
    expect(await adapter.disable2FA('usr-missing')).toBe(false);
    // No session and no user id -> nothing to delete.
    expect(await adapter.deleteAccount()).toBe(false);
  });
});
