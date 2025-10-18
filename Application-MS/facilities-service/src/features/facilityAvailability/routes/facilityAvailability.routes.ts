import express from 'express';
import { verifyInternalRequest } from '../../../middleware/internalMiddleware/bookingService/booking.middleware';
import {
  createFacilityAvailability,
  deleteFacilityAvailability,
  getFacilityAvailability,
  getInternalFacilityDetails,
  updateFacilityAvailability,
} from '../controllers/facilityAvailability.controller';

const router = express.Router();

// POST Routes
// Creates a facility availability slot
// ## NEED TO VERIFY/UPDATE THE CREATE LOGIC
router.route('/api/facilityAvailability').post(createFacilityAvailability);

// GET Routes
// Get schedule for facility
router.route('/api/facilityAvailability/:facilityId').get(getFacilityAvailability);

// PUT Routes
// Update facility schedule
router.route('/api/facilityAvailability/:facilityAvailabilityId').put(updateFacilityAvailability);

// DELETE Routes
// (Soft Delete)
router
  .route('/api/facilityAvailability/:facilityAvailabilityId')
  .delete(deleteFacilityAvailability);

// #INTERNAL SERVICES CALLS
// GET: Fetch facility details
router
  .route('/internal/facility/:facilityAvailabilityId')
  .get(verifyInternalRequest, getInternalFacilityDetails);

export default router;
