import mongoose from 'mongoose';
import { ErrorHandler } from '../../../utils/errors/errorHandler.util';
import MerchantSessionModel from '../models/merchantSession.schema';
import dayjs from 'dayjs';

export const createNewSessionRepo = async (newUser: any, ipAddress: any, userAgent: any) => {
  try {
    // const merchantUserId = newUser._id;
    // // Step 1: Invalidate existing active sessions
    // await MerchantSessionModel.updateMany(
    //   { merchantUserId, isActive: true },
    //   { $set: { isActive: false, updatedAt: dayjs().unix() } }
    // );

    await MerchantSessionModel.create({
      merchantUserId: newUser._id,
      userAgent: userAgent || '',
      ipAddress: ipAddress || '',
      expiresAt: dayjs().add(1, 'hour').toDate(),
    });
  } catch (error: any) {
    if (error instanceof mongoose.Error || error instanceof ErrorHandler) {
      throw error;
    } else {
      throw new ErrorHandler(500, 'something went wrong while creating merchant user session');
    }
  }
};
