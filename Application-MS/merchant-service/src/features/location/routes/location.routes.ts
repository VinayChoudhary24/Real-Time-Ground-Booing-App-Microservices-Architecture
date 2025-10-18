import express from 'express';
import {
  createMerchantLocation,
  deleteLocationDetails,
  getAllMerchantLocations,
  getMerchantLocation,
  updateLocationDetails,
} from '../controllers/location.controller';

const router = express.Router();

// POST:
// Create Location
router.route('/api/location').post(createMerchantLocation);

// GET:
// Fetch location details
router.route('/api/location/:locationId').get(getMerchantLocation);
// GET: Fetch all locations for merchant
router.route('/api/location').get(getAllMerchantLocations);

// PUT:
// Update location details
router.route('/api/location/:locationId').put(updateLocationDetails);

// DELETE
// Soft Delete and change the status to 0
router.route('/api/location/:locationId').delete(deleteLocationDetails);

export default router;
