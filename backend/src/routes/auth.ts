import { Router } from 'express';
import { register, login, googleAuth, getProfile } from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/google', googleAuth);

// Protected routes
router.get('/profile', authenticateToken, getProfile);

export default router; 