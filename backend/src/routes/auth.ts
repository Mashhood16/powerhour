import { Router } from 'express';
import { register, verifyOtp, login } from '../controllers/auth';
import { authenticate, authorizeRole } from '../middleware/auth';

const router = Router();

// Public routes
router.post('/register', register);
router.post('/verify-otp', verifyOtp);
router.post('/login', login);

// Protected route example
router.get('/me', authenticate, (req, res) => {
  res.json({ message: 'User profile data', user: req.user });
});

// Admin only route example
router.get('/admin', authenticate, authorizeRole(['ADMIN']), (req, res) => {
  res.json({ message: 'Admin dashboard data' });
});

export default router;
