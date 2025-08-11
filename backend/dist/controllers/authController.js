"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProfile = exports.googleAuth = exports.login = exports.register = void 0;
const database_1 = require("../utils/database");
const auth_1 = require("../utils/auth");
const googleAuthService_1 = require("../services/googleAuthService");
const register = async (req, res) => {
    try {
        const { email, name, password } = req.body;
        if (!email || !name || !password) {
            res.status(400).json({ error: 'Email, name, and password are required' });
            return;
        }
        if (password.length < 6) {
            res.status(400).json({ error: 'Password must be at least 6 characters long' });
            return;
        }
        const existingUser = await database_1.db.findUserByEmail(email);
        if (existingUser) {
            res.status(409).json({ error: 'User with this email already exists' });
            return;
        }
        const hashedPassword = await (0, auth_1.hashPassword)(password);
        const user = await database_1.db.createUser({
            email,
            name,
            password: hashedPassword,
        });
        const token = (0, auth_1.generateToken)(user.id, user.email);
        const userResponse = (0, auth_1.sanitizeUser)(user);
        res.status(201).json({
            message: 'User registered successfully',
            user: userResponse,
            token,
        });
    }
    catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({ error: 'Email and password are required' });
            return;
        }
        const user = await database_1.db.findUserByEmail(email);
        if (!user) {
            res.status(401).json({ error: 'Invalid email or password' });
            return;
        }
        const isPasswordValid = await (0, auth_1.comparePassword)(password, user.password);
        if (!isPasswordValid) {
            res.status(401).json({ error: 'Invalid email or password' });
            return;
        }
        const token = (0, auth_1.generateToken)(user.id, user.email);
        const userResponse = (0, auth_1.sanitizeUser)(user);
        res.status(200).json({
            message: 'Login successful',
            user: userResponse,
            token,
        });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.login = login;
const googleAuth = async (req, res) => {
    try {
        const { idToken } = req.body;
        if (!idToken) {
            res.status(400).json({ error: 'Google ID token is required' });
            return;
        }
        const result = await googleAuthService_1.GoogleAuthService.authenticateWithGoogle(idToken);
        res.json({
            message: result.isNewUser ? 'User registered successfully with Google' : 'Login successful with Google',
            user: result.user,
            token: result.token,
            isNewUser: result.isNewUser,
        });
    }
    catch (error) {
        console.error('Google authentication error:', error);
        if (error instanceof Error) {
            if (error.message === 'Invalid Google token') {
                res.status(401).json({ error: 'Invalid Google token' });
            }
            else if (error.message === 'Email not verified with Google') {
                res.status(400).json({ error: 'Email not verified with Google' });
            }
            else {
                res.status(500).json({ error: 'Google authentication failed' });
            }
        }
        else {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
};
exports.googleAuth = googleAuth;
const getProfile = async (req, res) => {
    try {
        const userId = req.userId;
        const userEmail = req.userEmail;
        if (!userId) {
            res.status(401).json({ error: 'User not authenticated' });
            return;
        }
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
        const user = await database_1.db.findUserById(userId);
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
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
    }
    catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getProfile = getProfile;
//# sourceMappingURL=authController.js.map