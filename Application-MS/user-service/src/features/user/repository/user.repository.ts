import mongoose from 'mongoose';
import { ErrorHandler } from '../../../utils/errors/errorHandler.util';
import UserModel from '../models/user.schema';

export const getUserDetailsRepo = async (userId: string) => {
  try {
    const objectId = new mongoose.Types.ObjectId(userId);
    return await UserModel.findById(objectId).lean();
  } catch (error: any) {
    if (error instanceof mongoose.Error || error instanceof ErrorHandler) {
      throw error;
    } else {
      throw new ErrorHandler(500, 'Error fetching user details');
    }
  }
};

export const updateUserDetailsRepo = async (userId: string, updateData: any) => {
  try {
    const objectId = new mongoose.Types.ObjectId(userId);
    const updatedUser = await UserModel.findByIdAndUpdate(
      objectId,
      { $set: updateData },
      {
        new: true,
        runValidators: true,
        lean: true,
      },
    );
    return updatedUser;
  } catch (error: any) {
    if (error instanceof mongoose.Error || error instanceof ErrorHandler) {
      throw error;
    } else {
      // console.log('error.code', error.code);
      if (error.code === 11000) {
        const duplicatedField = Object.keys(error.keyPattern || {})[0];
        const message = `${duplicatedField} already exists`;
        throw new ErrorHandler(400, message);
      }
      throw new ErrorHandler(500, 'Error updating user details');
    }
  }
};

export const getInternalUserDetailsRepo = async (userId: string) => {
  try {
    const objectId = new mongoose.Types.ObjectId(userId);
    return await UserModel.findById(objectId, {
      firstName: 1,
      lastName: 1,
      email: 1,
      phone: 1,
      phoneCode: 1,
      status: 1,
    }).lean();
  } catch (error: any) {
    if (error instanceof mongoose.Error || error instanceof ErrorHandler) {
      throw error;
    } else {
      throw new ErrorHandler(500, 'Error fetching internal user details');
    }
  }
};
