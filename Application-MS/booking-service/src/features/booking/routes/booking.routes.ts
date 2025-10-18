import express from 'express';
import { createNewBooking } from '../controllers/booking.controller';

const router = express.Router();

// POST Routes
// Creates Booking
router.route('/api/booking').post(createNewBooking);

// GET Routes
// Get a booking
// router.route('/api/booking/:bookingId').get(getLocationFacility);
// Get All Users bookings
// router.route('/api/booking/user').get(getAllLocationFacilities);
// Get All Merchants bookings
// router.route('/api/booking/merchant').get(getAllLocationFacilities);

// PUT Routes
// Update Booking
// router.route('/api/booking/:bookingId').put(updateLocationFacility);

export default router;
