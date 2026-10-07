import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const SALT_ROUNDS = 12;

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not configured');
  }

  return secret;
}

export function hashPassword(password) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export function comparePassword(password, hash) {
  return bcrypt.compare(password, hash);
}

export function createAuthToken(user) {
  return jwt.sign(
    { userId: user.id, role: user.role, email: user.email },
    getJwtSecret(),
    { expiresIn: process.env.JWT_EXPIRES_IN || '1d' },
  );
}

export function verifyAuthToken(token) {
  return jwt.verify(token, getJwtSecret());
}