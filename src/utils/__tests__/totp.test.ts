import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  DEMO_2FA_CODE,
  generateSecret,
  generateTOTP,
  isDemo2FACodeEnabled,
  verifyTOTP,
  getOtpAuthUrl,
  generateBackupCodes
} from '../totp';

describe('TOTP Utils (RFC 6238)', () => {
  const BASE32_REGEX = /^[A-Z2-7]+$/;
  const FIXED_SECRET = 'JBSWY3DPEHPK3PXP'; // Standard Base32 test secret

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('generateSecret', () => {
    it('generates a 16-character Base32 secret by default', () => {
      const secret = generateSecret();
      expect(secret).toHaveLength(16);
      expect(secret).toMatch(BASE32_REGEX);
    });

    it('generates a custom length Base32 secret when requested', () => {
      const secret = generateSecret(32);
      expect(secret).toHaveLength(32);
      expect(secret).toMatch(BASE32_REGEX);
    });

    it('generates different secrets across subsequent calls', () => {
      const secret1 = generateSecret();
      const secret2 = generateSecret();
      expect(secret1).not.toBe(secret2);
    });
  });

  describe('generateTOTP', () => {
    it('generates a 6-digit numeric string', async () => {
      vi.setSystemTime(new Date('2026-01-01T12:00:00Z'));
      const code = await generateTOTP(FIXED_SECRET);

      expect(code).toHaveLength(6);
      expect(/^\d{6}$/.test(code)).toBe(true);
    });

    it('produces deterministic output for the same timestamp and secret', async () => {
      vi.setSystemTime(new Date('2026-01-01T12:00:00Z'));
      const code1 = await generateTOTP(FIXED_SECRET);

      vi.setSystemTime(new Date('2026-01-01T12:00:15Z')); // Within same 30s window
      const code2 = await generateTOTP(FIXED_SECRET);

      expect(code1).toBe(code2);
    });

    it('produces different codes across different 30-second time windows', async () => {
      vi.setSystemTime(new Date('2026-01-01T12:00:00Z'));
      const code1 = await generateTOTP(FIXED_SECRET);

      vi.setSystemTime(new Date('2026-01-01T12:00:35Z')); // Next window
      const code2 = await generateTOTP(FIXED_SECRET);

      expect(code1).not.toBe(code2);
    });

    it('handles timeStepOffset correctly', async () => {
      vi.setSystemTime(new Date('2026-01-01T12:00:00Z'));
      const currentCode = await generateTOTP(FIXED_SECRET, 0);
      const nextCode = await generateTOTP(FIXED_SECRET, 1);

      vi.setSystemTime(new Date('2026-01-01T12:00:30Z'));
      const codeAtNextWindow = await generateTOTP(FIXED_SECRET, 0);

      expect(nextCode).toBe(codeAtNextWindow);
      expect(currentCode).not.toBe(nextCode);
    });
  });

  describe('verifyTOTP', () => {
    it('verifies a valid code generated at the current timestamp', async () => {
      vi.setSystemTime(new Date('2026-01-01T12:00:00Z'));
      const code = await generateTOTP(FIXED_SECRET);

      const result = await verifyTOTP(code, FIXED_SECRET);
      expect(result.valid).toBe(true);
    });

    it('accepts code with whitespace or hyphens', async () => {
      vi.setSystemTime(new Date('2026-01-01T12:00:00Z'));
      const code = await generateTOTP(FIXED_SECRET);
      const formattedCode = `${code.slice(0, 3)} - ${code.slice(3)}`;

      const result = await verifyTOTP(formattedCode, FIXED_SECRET);
      expect(result.valid).toBe(true);
    });

    it('accepts valid code within -1 time step window (30s drift tolerance)', async () => {
      vi.setSystemTime(new Date('2026-01-01T12:00:00Z'));
      const pastCode = await generateTOTP(FIXED_SECRET);

      // Advance time by 35 seconds (1 window forward)
      vi.setSystemTime(new Date('2026-01-01T12:00:35Z'));

      const result = await verifyTOTP(pastCode, FIXED_SECRET);
      expect(result.valid).toBe(true);
    });

    it('accepts valid code within +1 time step window (future 30s drift tolerance)', async () => {
      vi.setSystemTime(new Date('2026-01-01T12:00:35Z'));
      const futureCode = await generateTOTP(FIXED_SECRET);

      // Step back to earlier window
      vi.setSystemTime(new Date('2026-01-01T12:00:00Z'));

      const result = await verifyTOTP(futureCode, FIXED_SECRET);
      expect(result.valid).toBe(true);
    });

    it('rejects expired code older than 60 seconds (offset <= -2)', async () => {
      vi.setSystemTime(new Date('2026-01-01T12:00:00Z'));
      const oldCode = await generateTOTP(FIXED_SECRET);

      // Advance time by 90 seconds (3 windows forward)
      vi.setSystemTime(new Date('2026-01-01T12:01:30Z'));

      const result = await verifyTOTP(oldCode, FIXED_SECRET);
      expect(result.valid).toBe(false);
    });

    it('rejects invalid code', async () => {
      vi.setSystemTime(new Date('2026-01-01T12:00:00Z'));
      const currentCode = await generateTOTP(FIXED_SECRET);
      const invalidCode = currentCode === '987654' ? '876543' : '987654';
      const result = await verifyTOTP(invalidCode, FIXED_SECRET);
      expect(result.valid).toBe(false);
    });

    it('accepts demo code in development builds only', async () => {
      vi.stubEnv('DEV', true);
      try {
        expect(isDemo2FACodeEnabled()).toBe(true);
        const result = await verifyTOTP(DEMO_2FA_CODE, FIXED_SECRET);
        expect(result.valid).toBe(true);
      } finally {
        vi.unstubAllEnvs();
      }
    });

    it('accepts demo code with spaces in development builds', async () => {
      vi.stubEnv('DEV', true);
      try {
        const result = await verifyTOTP('123 456', FIXED_SECRET);
        expect(result.valid).toBe(true);
      } finally {
        vi.unstubAllEnvs();
      }
    });

    it('rejects demo code outside development builds', async () => {
      vi.stubEnv('DEV', false);
      try {
        expect(isDemo2FACodeEnabled()).toBe(false);
        const result = await verifyTOTP(DEMO_2FA_CODE, FIXED_SECRET);
        expect(result.valid).toBe(false);
        expect(result.usedBackupCode).toBeUndefined();
      } finally {
        vi.unstubAllEnvs();
      }
    });

    it('validates and returns matched emergency backup code', async () => {
      const backupCodes = ['12AB-34CD', '56EF-78GH'];
      const result = await verifyTOTP('12AB-34CD', FIXED_SECRET, backupCodes);

      expect(result.valid).toBe(true);
      expect(result.usedBackupCode).toBe('12AB-34CD');
    });

    it('validates emergency backup code ignoring hyphens and whitespace', async () => {
      const backupCodes = ['12AB-34CD', '56EF-78GH'];
      const result = await verifyTOTP('12AB34CD', FIXED_SECRET, backupCodes);

      expect(result.valid).toBe(true);
      expect(result.usedBackupCode).toBe('12AB-34CD');
    });
  });

  describe('getOtpAuthUrl', () => {
    it('creates properly encoded otpauth URL', () => {
      const url = getOtpAuthUrl('user@example.com', FIXED_SECRET, 'My Dashboard');
      expect(url).toContain('otpauth://totp/');
      expect(url).toContain('My%20Dashboard:user%40example.com');
      expect(url).toContain(`secret=${FIXED_SECRET}`);
      expect(url).toContain('issuer=My%20Dashboard');
      expect(url).toContain('algorithm=SHA1');
      expect(url).toContain('digits=6');
      expect(url).toContain('period=30');
    });

    it('uses default issuer if not provided', () => {
      const url = getOtpAuthUrl('test@test.pl', FIXED_SECRET);
      expect(url).toContain('Investment%20Dashboard');
    });
  });

  describe('generateBackupCodes', () => {
    it('generates 8 backup codes by default', () => {
      const codes = generateBackupCodes();
      expect(codes).toHaveLength(8);
      codes.forEach(c => {
        expect(/^[0-9A-F]{4}-[0-9A-F]{4}$/.test(c)).toBe(true);
      });
    });

    it('generates custom number of backup codes when requested', () => {
      const codes = generateBackupCodes(4);
      expect(codes).toHaveLength(4);
    });
  });
});
