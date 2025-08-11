import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import { User, UserResponse } from '../models/User';

export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
};

export const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};

export const generateToken = (userId: string, email: string): string => {
  return jwt.sign({ userId, email }, config.jwtSecret as any, {
    expiresIn: config.jwtExpiresIn,
  } as any);
};

export const verifyToken = (token: string): { userId: string; email: string } | null => {
  try {
    const decoded = jwt.verify(token, config.jwtSecret) as { userId: string; email: string };
    return decoded;
  } catch (error) {
    return null;
  }
};

export const sanitizeUser = (user: User): UserResponse => {
  const { password, ...sanitizedUser } = user;
  return sanitizedUser;
}; 