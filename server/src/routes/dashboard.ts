import { Router } from 'express';
import { protect } from '../middleware/auth';
import { getDashboard } from '../controllers/dashboardController';

const router = Router();
router.get('/', protect, getDashboard);

export default router;
