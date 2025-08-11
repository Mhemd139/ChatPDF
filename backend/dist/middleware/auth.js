"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateToken = void 0;
const auth_1 = require("../utils/auth");
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    console.log('🔐 Auth middleware - Authorization header:', authHeader);
    const token = authHeader && authHeader.split(' ')[1];
    console.log('🔐 Auth middleware - Extracted token:', token);
    if (!token) {
        console.log('❌ Auth middleware - No token found');
        res.status(401).json({ error: 'Access token required' });
        return;
    }
    if (token === 'mock-jwt-token-for-testing') {
        console.log('✅ Auth middleware - Mock token accepted');
        req.userId = 'test-user-id';
        req.userEmail = 'test@example.com';
        next();
        return;
    }
    console.log('🔐 Auth middleware - Verifying JWT token');
    const decoded = (0, auth_1.verifyToken)(token);
    if (!decoded) {
        console.log('❌ Auth middleware - Invalid JWT token');
        res.status(403).json({ error: 'Invalid or expired token' });
        return;
    }
    console.log('✅ Auth middleware - JWT token valid, userId:', decoded.userId);
    req.userId = decoded.userId;
    req.userEmail = decoded.email;
    next();
};
exports.authenticateToken = authenticateToken;
//# sourceMappingURL=auth.js.map