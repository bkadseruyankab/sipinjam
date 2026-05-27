/**
 * Simple auth utilities for E-Pakar borrowing application.
 * Uses base64 encoding for password hashing (demo purposes only).
 */

/**
 * Hash a password using base64 encoding with a salt prefix.
 * This is for demo purposes only — use bcrypt/argon2 in production.
 */
export function hashPassword(password: string): string {
  const salted = `epakar_${password}_2024`;
  return Buffer.from(salted).toString('base64');
}

/**
 * Verify a password against a hashed version.
 */
export function verifyPassword(password: string, hashed: string): boolean {
  return hashPassword(password) === hashed;
}

/**
 * Generate a simple token from user data.
 * Format: base64(userId:email:timestamp)
 */
export function generateToken(userId: string, email: string): string {
  const payload = `${userId}:${email}:${Date.now()}`;
  return Buffer.from(payload).toString('base64');
}

/**
 * Decode a token and extract user info.
 */
export function decodeToken(token: string): { userId: string; email: string; timestamp: number } | null {
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const [userId, email, timestamp] = decoded.split(':');
    if (!userId || !email) return null;
    return { userId, email, timestamp: Number(timestamp) };
  } catch {
    return null;
  }
}

/**
 * Strip password from user object for safe response.
 */
export function sanitizeUser(user: Record<string, unknown>) {
  const { password, ...safeUser } = user;
  return safeUser;
}
