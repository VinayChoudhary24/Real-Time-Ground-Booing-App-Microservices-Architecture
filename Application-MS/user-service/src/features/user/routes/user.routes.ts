import express from 'express';
import {
  getInternalUserDetails,
  getUserDetails,
  updateUserDetails,
} from '../controllers/user.controller';
import { verifyInternalRequest } from '../../../middleware/internalMiddleware/bookingService/booking.middleware';

const router = express.Router();

// GET:
// Fetch user details only (without bookings)
router.route('/api/user').get(getUserDetails);
// Fetch user with Specific booking details
// router.route('/api/user/booking').get(getUserWithBookingDetails);
// Fetch User with All booking details
// router.route('/api/user/allbooking').get(getUserWithAllBookingDetails);

// PUT:
// Update user details
router.route('/api/user').put(updateUserDetails);

// #INTERNAL SERVICES CALLS
// GET: Fetch user details
router.route('/internal/user/:userId').get(verifyInternalRequest, getInternalUserDetails);

export default router;
