import { Router } from 'express';
import { searchTutors, getTutorAvailability } from '../controllers/tutor';

const router = Router();

// Public route to search for tutors
router.get('/search', searchTutors);
router.get('/:id/availability', getTutorAvailability);

export default router;
