import { Router } from 'express';
import MerchantRoutes from './merchant/merchant';
import FacilitiesRoutes from './facilities/facilities';

const router = Router();

router.use(MerchantRoutes);
router.use(FacilitiesRoutes);

export default router;
