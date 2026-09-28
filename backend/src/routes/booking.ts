import express from 'express';
import { requestBooking } from '../controllers/booking';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// Apply auth middleware to all booking routes
router.use(authenticate);

// Student requests a booking
router.post('/request', requestBooking);

export default router;
