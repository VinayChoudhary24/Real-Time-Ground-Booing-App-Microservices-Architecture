import mongoose from 'mongoose';
import dayjs from 'dayjs';
import UserSessionModel from '../models/userSession.schema';
import { ErrorHandler } from '../../../utils/errors/errorHandler.util';

export const createNewSessionRepo = async (newUser: any, ipAddress: any, userAgent: any) => {
  try {
    // const userId = newUser._id;
    // // Step 1: Invalidate existing active sessions
    // await UserSessionModel.updateMany(
    //   { userId, isActive: true },
    //   { $set: { isActive: false, updatedAt: dayjs().unix() } }
    // );

    await UserSessionModel.create({
      merchantUserId: newUser._id,
      userAgent: userAgent || '',
      ipAddress: ipAddress || '',
      expiresAt: dayjs().add(1, 'hour').toDate(),
    });
  } catch (error: any) {
    if (error instanceof mongoose.Error || error instanceof ErrorHandler) {
      throw error;
    } else {
      throw new ErrorHandler(500, 'something went wrong while creating user session');
    }
  }
};
