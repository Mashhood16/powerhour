import argon2 from 'argon2';

/**
 * Hash a password using Argon2 (adaptive hashing algorithm).
 */
export const hashPassword = async (password: string): Promise<string> => {
  return await argon2.hash(password, {
    type: argon2.argon2id, // recommended variant
    memoryCost: 2 ** 16, // 64 MB
    timeCost: 3, // iterations
    parallelism: 1, // threads
  });
};

/**
 * Verify a password against a hash using Argon2.
 */
export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  try {
    return await argon2.verify(hash, password);
  } catch (err) {
    return false;
  }
};
