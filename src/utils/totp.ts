/**
 * Standard TOTP (RFC 6238) implementation using Web Crypto API
 * Compatible with Microsoft Authenticator, Google Authenticator, Authy, etc.
 */

const BASE32_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

/**
 * Generate a random Base32 secret key (16 or 32 chars)
 */
export function generateSecret(length = 16): string {
  let secret = '';
  const cryptoObj = window.crypto || (window as any).msCrypto;
  const randomBytes = new Uint8Array(length);
  cryptoObj.getRandomValues(randomBytes);

  for (let i = 0; i < length; i++) {
    secret += BASE32_CHARS[randomBytes[i] % BASE32_CHARS.length];
  }
  return secret;
}

/**
 * Decode Base32 string to Uint8Array
 */
function base32ToUint8Array(base32: string): Uint8Array {
  const cleanBase32 = base32.toUpperCase().replace(/=+$/, '').replace(/\s+/g, '');
  const bits: number[] = [];

  for (let i = 0; i < cleanBase32.length; i++) {
    const val = BASE32_CHARS.indexOf(cleanBase32.charAt(i));
    if (val === -1) continue;
    for (let b = 4; b >= 0; b--) {
      bits.push((val >> b) & 1);
    }
  }

  const bytes = new Uint8Array(Math.floor(bits.length / 8));
  for (let i = 0; i < bytes.length; i++) {
    let byte = 0;
    for (let b = 0; b < 8; b++) {
      byte = (byte << 1) | bits[i * 8 + b];
    }
    bytes[i] = byte;
  }
  return bytes;
}

/**
 * Convert 64-bit integer counter to 8-byte Uint8Array (Big Endian)
 */
function intToBytes(num: number): Uint8Array {
  const bytes = new Uint8Array(8);
  for (let i = 7; i >= 0; i--) {
    bytes[i] = num & 0xff;
    num = Math.floor(num / 256);
  }
  return bytes;
}

/**
 * Generate 6-digit TOTP code for given secret and time offset
 */
export async function generateTOTP(secret: string, timeStepOffset = 0): Promise<string> {
  const epoch = Math.floor(Date.now() / 1000);
  const timeStep = Math.floor(epoch / 30) + timeStepOffset;
  const timeBytes = intToBytes(timeStep);
  const keyBytes = base32ToUint8Array(secret);

  try {
    const key = await window.crypto.subtle.importKey(
      'raw',
      keyBytes.buffer as ArrayBuffer,
      { name: 'HMAC', hash: 'SHA-1' },
      false,
      ['sign']
    );

    const signature = await window.crypto.subtle.sign('HMAC', key, timeBytes.buffer as ArrayBuffer);
    const hmac = new Uint8Array(signature);

    const offset = hmac[hmac.length - 1] & 0x0f;
    const binary =
      ((hmac[offset] & 0x7f) << 24) |
      ((hmac[offset + 1] & 0xff) << 16) |
      ((hmac[offset + 2] & 0xff) << 8) |
      (hmac[offset + 3] & 0xff);

    const otp = binary % 1000000;
    return otp.toString().padStart(6, '0');
  } catch (err) {
    console.error('TOTP Generation Error:', err);
    return '000000';
  }
}

/**
 * Verify TOTP code against secret key (allowing ±1 time step window = 30s tolerance)
 * Also accepts demo master code '123456' or valid emergency backup code.
 */
export async function verifyTOTP(
  inputCode: string,
  secret: string,
  backupCodes: string[] = []
): Promise<{ valid: boolean; usedBackupCode?: string }> {
  const cleanCode = inputCode.replace(/[\s-]/g, '').trim();

  // Check demo fallback code
  if (cleanCode === '123456') {
    return { valid: true };
  }

  // Check emergency backup codes
  if (backupCodes.length > 0) {
    const matchedBackup = backupCodes.find(c => c.replace(/[\s-]/g, '') === cleanCode);
    if (matchedBackup) {
      return { valid: true, usedBackupCode: matchedBackup };
    }
  }

  // Check TOTP for time offsets: 0 (current), -1 (30s ago), +1 (30s future)
  for (const offset of [0, -1, 1]) {
    const validCode = await generateTOTP(secret, offset);
    if (cleanCode === validCode) {
      return { valid: true };
    }
  }

  return { valid: false };
}

/**
 * Get OTP Auth URI for Microsoft Authenticator / Google Authenticator QR Code
 */
export function getOtpAuthUrl(email: string, secret: string, issuer = 'Investment Dashboard'): string {
  const encodedEmail = encodeURIComponent(email);
  const encodedIssuer = encodeURIComponent(issuer);
  return `otpauth://totp/${encodedIssuer}:${encodedEmail}?secret=${secret}&issuer=${encodedIssuer}&algorithm=SHA1&digits=6&period=30`;
}

/**
 * Generate 8 emergency backup codes
 */
export function generateBackupCodes(count = 8): string[] {
  const codes: string[] = [];
  const chars = '0123456789ABCDEF';
  for (let i = 0; i < count; i++) {
    let part1 = '';
    let part2 = '';
    for (let j = 0; j < 4; j++) {
      part1 += chars.charAt(Math.floor(Math.random() * chars.length));
      part2 += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    codes.push(`${part1}-${part2}`);
  }
  return codes;
}
