import express from 'express';
import {
  getInternalMerchantWithLocation,
  getMerchantDetails,
  getMerchantDetailsWithLocations,
  getMerchantWithAllLocationsDetails,
  getMerchantWithLocationDetails,
  updateMerchantDetails,
} from '../controllers/merchantUser.controller';
import { verifyInternalRequest } from '../../../middleware/internalMiddleware/facilitiesService/facilities.middleware';

const router = express.Router();

// GET:
// Fetch merchant details only (without locations)
router.route('/api/merchant').get(getMerchantDetails);
// Fetch merchant with Specific location details
router.route('/api/merchant/location').get(getMerchantWithLocationDetails);
// Fetch merchant with All location details
router.route('/api/merchant/allLocation').get(getMerchantWithAllLocationsDetails);

// PUT:
// Update merchant details
router.route('/api/merchant').put(updateMerchantDetails);

// #INTERNAL SERVICES CALLS
// GET: Fetch merchant with associated locations
router
  .route('/internal/merchant/:merchantUserId')
  .get(verifyInternalRequest, getMerchantDetailsWithLocations);

// GET: Fetch merchant with a specific location
router
  .route('/internal/merchant/:merchantUserId/location/:locationId')
  .get(verifyInternalRequest, getInternalMerchantWithLocation);

export default router;
