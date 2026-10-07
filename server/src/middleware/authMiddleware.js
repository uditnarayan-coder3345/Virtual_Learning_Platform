import { prisma } from '../config/database.js';
import { verifyAuthToken } from '../utils/auth.js';

const publicUserFields = {
  id: true,
  name: true,
  email: true,
  role: true,
  status: true,
  phone: true,
  createdAt: true,
};

export async function authenticateToken(req, res, next) {
  const authorization = req.get('authorization') || '';
  const match = authorization.match(/^Bearer\s+(.+)$/i);
  if (!match) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }

  let payload;
  try {
    payload = verifyAuthToken(match[1]);
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }

  if (!payload || typeof payload !== 'object' || typeof payload.userId !== 'string') {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: publicUserFields,
    });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }
    if (user.status !== 'APPROVED') {
      const message = user.role === 'INSTRUCTOR' && user.status === 'PENDING'
        ? 'Your instructor account is pending admin approval.'
        : user.role === 'INSTRUCTOR' && user.status === 'REJECTED'
          ? 'Your instructor account request was rejected.'
          : user.status === 'BLOCKED'
            ? 'Your account has been blocked.'
            : 'This account is not approved for access';
      return res.status(403).json({ success: false, message });
    }

    req.user = { ...user, userId: user.id };
    return next();
  } catch {
    return res.status(500).json({ success: false, message: 'Unable to authenticate request' });
  }
}

export function authorizeRoles(...roles) {
  const allowedRoles = new Set(roles.flat());

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }
    if (!allowedRoles.has(req.user.role)) {
      return res.status(403).json({ success: false, message: 'You do not have permission to access this resource' });
    }
    return next();
  };
}
