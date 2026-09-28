import { Router } from 'express';
import { searchTutors } from '../controllers/tutor';

const router = Router();

// Public route to search for tutors
router.get('/search', searchTutors);

export default router;
