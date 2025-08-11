import { OAuth2Client } from 'google-auth-library';
import { config } from '../config/env';
import { db } from '../utils/database';
import { generateToken, verifyToken, sanitizeUser } from '../utils/auth';
import { CreateUserData, User } from '../models/User';

const client = new OAuth2Client(config.googleClientId);

export interface GoogleUserInfo {
  sub: string; // Google user ID
  email: string;
  name: string;
  picture?: string;
  email_verified: boolean;
}

export class GoogleAuthService {
  static async verifyIdToken(idToken: string): Promise<GoogleUserInfo> {
    try {
      const ticket = await client.verifyIdToken({
        idToken,
        audience: config.googleClientId,
      });

      const payload = ticket.getPayload();
      if (!payload) {
        throw new Error('Invalid token payload');
      }

      return {
        sub: payload.sub,
        email: payload.email!,
        name: payload.name!,
        picture: payload.picture,
        email_verified: payload.email_verified!,
      };
    } catch (error) {
      console.error('Google token verification failed:', error);
      throw new Error('Invalid Google token');
    }
  }

  static async authenticateWithGoogle(idToken: string): Promise<{
    user: any;
    token: string;
    isNewUser: boolean;
  }> {
    try {
      // Verify the Google ID token
      const googleUser = await this.verifyIdToken(idToken);

      if (!googleUser.email_verified) {
        throw new Error('Email not verified with Google');
      }

      // Check if user exists by Google ID
      let user = await db.findUserByGoogleId(googleUser.sub);

      if (!user) {
        // Check if user exists by email
        user = await db.findUserByEmail(googleUser.email);

        if (user) {
          // Update existing user with Google ID
          user = await db.updateUserGoogleId(user.id, googleUser.sub, googleUser.picture);
        } else {
          // Create new user
          const userData: CreateUserData = {
            email: googleUser.email,
            name: googleUser.name,
            googleId: googleUser.sub,
            avatar: googleUser.picture,
          };

          user = await db.createUser(userData);
        }
      }

      // Generate JWT token
      const token = generateToken(user.id, user.email);

      return {
        user: sanitizeUser(user),
        token,
        isNewUser: !user.createdAt || new Date().getTime() - user.createdAt.getTime() < 60000, // Within 1 minute
      };
    } catch (error) {
      console.error('Google authentication error:', error);
      throw error;
    }
  }

  static async getUserByToken(token: string): Promise<any> {
    try {
      const decoded = verifyToken(token);
      if (!decoded) {
        throw new Error('Invalid token');
      }

      const user = await db.findUserById(decoded.userId);
      if (!user) {
        throw new Error('User not found');
      }

      return sanitizeUser(user);
    } catch (error) {
      console.error('Get user by token error:', error);
      throw error;
    }
  }
} 