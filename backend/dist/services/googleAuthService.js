"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoogleAuthService = void 0;
const google_auth_library_1 = require("google-auth-library");
const env_1 = require("../config/env");
const database_1 = require("../utils/database");
const auth_1 = require("../utils/auth");
const client = new google_auth_library_1.OAuth2Client(env_1.config.googleClientId);
class GoogleAuthService {
    static async verifyIdToken(idToken) {
        try {
            const ticket = await client.verifyIdToken({
                idToken,
                audience: env_1.config.googleClientId,
            });
            const payload = ticket.getPayload();
            if (!payload) {
                throw new Error('Invalid token payload');
            }
            return {
                sub: payload.sub,
                email: payload.email,
                name: payload.name,
                picture: payload.picture,
                email_verified: payload.email_verified,
            };
        }
        catch (error) {
            console.error('Google token verification failed:', error);
            throw new Error('Invalid Google token');
        }
    }
    static async authenticateWithGoogle(idToken) {
        try {
            const googleUser = await this.verifyIdToken(idToken);
            if (!googleUser.email_verified) {
                throw new Error('Email not verified with Google');
            }
            let user = await database_1.db.findUserByGoogleId(googleUser.sub);
            if (!user) {
                user = await database_1.db.findUserByEmail(googleUser.email);
                if (user) {
                    user = await database_1.db.updateUserGoogleId(user.id, googleUser.sub, googleUser.picture);
                }
                else {
                    const userData = {
                        email: googleUser.email,
                        name: googleUser.name,
                        googleId: googleUser.sub,
                        avatar: googleUser.picture,
                    };
                    user = await database_1.db.createUser(userData);
                }
            }
            const token = (0, auth_1.generateToken)(user.id, user.email);
            return {
                user: (0, auth_1.sanitizeUser)(user),
                token,
                isNewUser: !user.createdAt || new Date().getTime() - user.createdAt.getTime() < 60000,
            };
        }
        catch (error) {
            console.error('Google authentication error:', error);
            throw error;
        }
    }
    static async getUserByToken(token) {
        try {
            const decoded = (0, auth_1.verifyToken)(token);
            if (!decoded) {
                throw new Error('Invalid token');
            }
            const user = await database_1.db.findUserById(decoded.userId);
            if (!user) {
                throw new Error('User not found');
            }
            return (0, auth_1.sanitizeUser)(user);
        }
        catch (error) {
            console.error('Get user by token error:', error);
            throw error;
        }
    }
}
exports.GoogleAuthService = GoogleAuthService;
//# sourceMappingURL=googleAuthService.js.map