import { Request, Response } from 'express';
import { db } from '../utils/database';
import { hashPassword, comparePassword, generateToken, verifyToken, sanitizeUser } from '../utils/auth';
import { CreateUserData, LoginData, GoogleAuthData } from '../models/User';
import { GoogleAuthService } from '../services/googleAuthService';
import { AuthenticatedRequest } from '../middleware/auth';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, name, password }: CreateUserData = req.body;

    // Validate input
    if (!email || !name || !password) {
      res.status(400).json({ 
        success: false,
        error: 'Email, name, and password are required' 
      });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ 
        success: false,
        error: 'Password must be at least 6 characters long' 
      });
      return;
    }

    // Check if user already exists
    const existingUser = await db.findUserByEmail(email);
    if (existingUser) {
      res.status(409).json({ 
        success: false,
        error: 'User with this email already exists' 
      });
      return;
    }

    // Hash password and create user
    const hashedPassword = await hashPassword(password);
    const user = await db.createUser({
      email,
      name,
      password: hashedPassword,
    });

    // Generate token
    const token = generateToken(user.id, user.email);

    // Return user data (without password) and token
    const userResponse = sanitizeUser(user);
    res.status(201).json({
      success: true,
      data: {
        message: 'User registered successfully',
        user: userResponse,
        token,
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password }: LoginData = req.body;

    // Validate input
    if (!email || !password) {
      res.status(400).json({ 
        success: false,
        error: 'Email and password are required' 
      });
      return;
    }

    // Find user by email
    const user = await db.findUserByEmail(email);
    if (!user) {
      res.status(401).json({ 
        success: false,
        error: 'Invalid email or password' 
      });
      return;
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ 
        success: false,
        error: 'Invalid email or password' 
      });
      return;
    }

    // Generate token
    const token = generateToken(user.id, user.email);

    // Return user data (without password) and token
    const userResponse = sanitizeUser(user);
    res.status(200).json({
      success: true,
      data: {
        message: 'Login successful',
        user: userResponse,
        token,
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    });
  }
};

export const googleAuth = async (req: Request, res: Response): Promise<void> => {
  try {
    const { idToken }: GoogleAuthData = req.body;

    if (!idToken) {
      res.status(400).json({ error: 'Google ID token is required' });
      return;
    }

    const result = await GoogleAuthService.authenticateWithGoogle(idToken);

    res.json({
      success: true,
      data: {
        message: result.isNewUser ? 'User registered successfully with Google' : 'Login successful with Google',
        user: result.user,
        token: result.token,
        isNewUser: result.isNewUser,
      }
    });
  } catch (error) {
    console.error('Google authentication error:', error);
    
    if (error instanceof Error) {
      if (error.message === 'Invalid Google token') {
        res.status(401).json({ 
          success: false,
          error: 'Invalid Google token' 
        });
      } else if (error.message === 'Email not verified with Google') {
        res.status(400).json({ 
          success: false,
          error: 'Email not verified with Google' 
        });
      } else {
        res.status(500).json({ 
          success: false,
          error: 'Google authentication failed' 
        });
      }
    } else {
      res.status(500).json({ 
        success: false,
        error: 'Internal server error' 
      });
    }
  }
};

export const getProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const userEmail = req.userEmail;

    if (!userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    // Handle mock token for development
    if (userId === 'test-user-id') {
      const mockUser = {
        id: 'test-user-id',
        email: 'test@example.com',
        name: 'Test User',
        avatar: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      res.json({ 
        success: true,
        user: mockUser 
      });
      return;
    }

    const user = await db.findUserById(userId);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Return sanitized user data (no password)
    const sanitizedUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    res.json({ 
      success: true,
      user: sanitizedUser 
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}; 