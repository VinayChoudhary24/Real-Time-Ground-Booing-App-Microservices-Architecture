import express from 'express';
import {
  createNewDiscount,
  deleteDiscount,
  getAllDiscounts,
  getDiscount,
  updateDiscount,
} from '../controllers/discount.controller';

const router = express.Router();

// POST Routes
// Creates Discount
router.route('/api/discount').post(createNewDiscount);

// GET Routes
// Get a discount
router.route('/api/discount/:discountId').get(getDiscount);
// Get All Discount
router.route('/api/discount').get(getAllDiscounts);

// PUT Routes
// Update Discount
router.route('/api/discount/:discountId').put(updateDiscount);

// DELETE Routes
// (Soft Delete)
router.route('/api/discount/:discountId').delete(deleteDiscount);

export default router;
