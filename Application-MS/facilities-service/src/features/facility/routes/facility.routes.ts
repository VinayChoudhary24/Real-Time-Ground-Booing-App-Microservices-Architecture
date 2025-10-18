import express from 'express';
import {
  createNewLocationFacility,
  deleteLocationFacility,
  getAllLocationFacilities,
  getLocationFacility,
  updateLocationFacility,
} from '../controllers/facility.controller';

const router = express.Router();

// POST Routes
// Creates Lcation Facility
router.route('/api/facility').post(createNewLocationFacility);

// GET Routes
// Get a facility
router.route('/api/facility/:facilityId').get(getLocationFacility);
// Get All Location facilities
router.route('/api/facility').get(getAllLocationFacilities);

// PUT Routes
// Update Location Facility
router.route('/api/facility/:facilityId').put(updateLocationFacility);

// DELETE Routes
// (Soft Delete)
router.route('/api/facility/:facilityId').delete(deleteLocationFacility);

// #INTERNAL SERVICES CALLS
// GET: Fetch facility details
// router
//   .route('/internal/facility/:facilityId')
//   .get(verifyInternalRequest, getInternalFacilityDetails);

export default router;
