import { Request, Response, NextFunction } from 'express';
import { ErrorHandler } from '../../../utils/errors/errorHandler.util';
import { validateBookingInput } from '../service/validateBooking';
import { getUserDetails } from '../../../connectivity/user/user';
import { getBookingDetails } from '../../../connectivity/facility/facility';
import { generateBookingObject } from '../service/generateBookingDoc';
import { createNewBookingRepo } from '../repository/booking.repository';

export const createNewBooking = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.headers['x-user-id'] as string;

    if (!userId) {
      return next(new ErrorHandler(400, 'User ID is required'));
    }
    // Validate body data
    validateBookingInput(req.body);

    const {
      facilityAvailabilityId,
      slots,
      promoCode,
      discount,
      subTotalAmount,
      taxes,
      totalAmount,
    } = req.body;

    // we need to get the LocationId and merchantId and FacilityId
    // Also pass slots
    const bookingData = await getBookingDetails(facilityAvailabilityId, slots);
    if (!bookingData) {
      return next(new ErrorHandler(404, 'Booking details not found'));
    }
    // console.log('Facility Data:', facilityData);
    const { facilityAvailability, facility, merchantWithLocation } = bookingData;
    if (!facilityAvailability || !facility || !merchantWithLocation) {
      return next(new ErrorHandler(404, 'Required booking data not found'));
    }
    console.log('facilityAvailability', facilityAvailability);
    console.log('facility', facility);
    console.log('merchantWithLocation', merchantWithLocation);

    // Get User Details-- Connect to User service
    const userData = await getUserDetails(userId);
    if (!userData) {
      return next(new ErrorHandler(404, 'User not found'));
    }
    console.log('userData', userData);

    // Create booking object
    const bookingObject = generateBookingObject({
      userId,
      userData,
      facilityAvailability,
      facility,
      merchantWithLocation,
      slots,
      subTotalAmount,
      taxes,
      totalAmount,
      promoCode,
      discount,
    });
    if (!bookingObject) {
      return next(
        new ErrorHandler(400, 'Unable to create booking document. please try in some time...'),
      );
    }

    // ##NEED TO IMPLEMENT THE PAYMENT VALIDATION FOR AMOUNTS, DISCOUNTS, PROMOCODES, ETC.##s

    const booking: any = await createNewBookingRepo(bookingObject);
    if (!booking) {
      return next(new ErrorHandler(400, 'Unable to create booking. please try in some time...'));
    }

    res.status(200).json({
      success: true,
      message: 'Booking created successfully',
      response: booking,
    });
  } catch (err) {
    return next(err);
  }
};
