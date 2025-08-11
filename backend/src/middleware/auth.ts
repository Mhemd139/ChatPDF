import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/auth';

export interface AuthenticatedRequest extends Request {
  userId?: string;
  userEmail?: string;
}

export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  console.log('🔐 Auth middleware - Authorization header:', authHeader);
  
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
  console.log('🔐 Auth middleware - Extracted token:', token);

  if (!token) {
    console.log('❌ Auth middleware - No token found');
    res.status(401).json({ error: 'Access token required' });
    return;
  }

  // For development/testing, accept mock token
  if (token === 'mock-jwt-token-for-testing') {
    console.log('✅ Auth middleware - Mock token accepted');
    // Use the Google OAuth user ID that has PDFs in the database
    req.userId = 'kxa1popuq';
    req.userEmail = 'mhemd.masa@gmail.com';
    next();
    return;
  }

  console.log('🔐 Auth middleware - Verifying JWT token');
  const decoded = verifyToken(token);
  if (!decoded) {
    console.log('❌ Auth middleware - Invalid JWT token');
    res.status(403).json({ error: 'Invalid or expired token' });
    return;
  }

  console.log('✅ Auth middleware - JWT token valid, userId:', decoded.userId);
  req.userId = decoded.userId;
  req.userEmail = decoded.email; // Add email from JWT
  next();
}; 