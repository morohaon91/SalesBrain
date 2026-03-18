import bcrypt from "bcryptjs";

/**
 * Number of salt rounds for bcrypt hashing
 * Higher number = more secure but slower
 * 10 is recommended balance between security and performance
 */
const SALT_ROUNDS = 10;

/**
 * Hash a password using bcrypt
 * @param password - Plain text password to hash
 * @returns Promise<string> - Hashed password
 * @throws Error if hashing fails
 */
export async function hashPassword(password: string): Promise<string> {
  try {
    return await bcrypt.hash(password, SALT_ROUNDS);
  } catch (error) {
    throw new Error(`Password hashing failed: ${error}`);
  }
}

/**
 * Verify a password against its hash
 * @param password - Plain text password to verify
 * @param hash - Hashed password from database
 * @returns Promise<boolean> - True if password matches, false otherwise
 * @throws Error if verification fails
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  try {
    return await bcrypt.compare(password, hash);
  } catch (error) {
    throw new Error(`Password verification failed: ${error}`);
  }
}
