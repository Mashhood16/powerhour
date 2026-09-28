"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../controllers/auth");
const auth_2 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Public routes
router.post('/register', auth_1.register);
router.post('/verify-otp', auth_1.verifyOtp);
router.post('/login', auth_1.login);
// Protected route example
router.get('/me', auth_2.authenticate, (req, res) => {
    res.json({ message: 'User profile data', user: req.user });
});
// Admin only route example
router.get('/admin', auth_2.authenticate, (0, auth_2.authorizeRole)(['ADMIN']), (req, res) => {
    res.json({ message: 'Admin dashboard data' });
});
exports.default = router;
