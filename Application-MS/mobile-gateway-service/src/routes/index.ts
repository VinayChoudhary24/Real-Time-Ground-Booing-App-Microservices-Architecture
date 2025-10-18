import { Router } from 'express';
import UserRoutes from './user/user';
import BookingRoutes from './booking/booking';

const router = Router();

router.use(UserRoutes);
router.use(BookingRoutes);

export default router;
