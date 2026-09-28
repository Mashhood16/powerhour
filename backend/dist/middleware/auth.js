"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorizeRole = exports.authenticate = void 0;
const jwt_1 = require("../utils/jwt");
/**
 * Middleware to authenticate user using JWT token from Authorization header.
 */
const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = (0, jwt_1.verifyToken)(token);
        req.user = decoded;
        next();
    }
    catch (error) {
        return res.status(401).json({ message: 'Unauthorized: Invalid token' });
    }
};
exports.authenticate = authenticate;
/**
 * Middleware to restrict access to specific roles.
 */
const authorizeRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Forbidden: Insufficient privileges' });
        }
        next();
    };
};
exports.authorizeRole = authorizeRole;
