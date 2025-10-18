import mongoose from 'mongoose';
import { ErrorHandler } from '../../../utils/errors/errorHandler.util';
import BookingSchemaModel from '../models/booking.schema';

export const createNewBookingRepo = async (bookingObject: any) => {
  try {
    const newBooking = new BookingSchemaModel(bookingObject);
    await newBooking.save();
    return newBooking;
  } catch (error: any) {
    if (error instanceof mongoose.Error || error instanceof ErrorHandler) {
      throw error;
    } else {
      throw new ErrorHandler(500, 'something went wrong while creating new booking');
    }
  }
};
