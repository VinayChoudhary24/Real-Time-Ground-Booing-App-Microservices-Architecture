import mongoose from 'mongoose';
import { ErrorHandler } from '../../../utils/errors/errorHandler.util';
import MerchantUserModel from '../../merchantUser/models/merchantUser.schema';
import MerchantLocationModel from '../../location/models/location.schema';

export const createNewUserRepo = async (user: any, session?: mongoose.ClientSession) => {
  try {
    const { email, phone } = user;
    // Prepare query operators
    const locationConflictQuery = {
      $or: [{ email: { $eq: email } }, { phone: { $eq: phone } }],
    };
    // Check for conflict in Location collection
    const existingLocation = await MerchantLocationModel.findOne(locationConflictQuery)
      .session(session ?? null)
      .lean();
    console.log('existingLocation', existingLocation);
    if (existingLocation) {
      let conflictFields: string[] = [];
      if (existingLocation.email === email) conflictFields.push('email');
      if (existingLocation.phone === phone) conflictFields.push('phone');
      throw new ErrorHandler(
        400,
        `${conflictFields.join(' and ')} already in use by another location`,
      );
    }

    return await new MerchantUserModel(user).save({ session: session ?? null });
  } catch (error: any) {
    // console.log('error', error.message, error?.statusCode);
    if (error instanceof mongoose.Error || error instanceof ErrorHandler) {
      throw error;
    } else {
      if (error.code === 11000) {
        const duplicatedField = Object.keys(error.keyPattern || {})[0];
        const message = `${duplicatedField} already in use by another merchant`;
        throw new ErrorHandler(400, message);
      }
      throw new ErrorHandler(500, 'something went wrong while creating new merchant user');
    }
  }
};

export const createNewUserOAuthRepo = async (user: any) => {
  try {
    const { email } = user;
    // Prepare query operators
    const locationConflictQuery = {
      $or: [{ email: { $eq: email } }],
    };
    // Check for conflict in Location collection
    const existingLocation = await MerchantLocationModel.findOne(locationConflictQuery).lean();
    console.log('existingLocation', existingLocation);
    if (existingLocation) {
      let conflictFields: string[] = [];
      if (existingLocation.email === email) conflictFields.push('email');
      // if (existingLocation.phone === phone) conflictFields.push('phone');
      throw new ErrorHandler(
        400,
        `${conflictFields.join(' and ')} already in use by another location`,
      );
    }

    return await new MerchantUserModel(user).save();
  } catch (error: any) {
    // console.log('error', error.message, error?.statusCode);
    if (error instanceof mongoose.Error || error instanceof ErrorHandler) {
      throw error;
    } else {
      if (error.code === 11000) {
        const duplicatedField = Object.keys(error.keyPattern || {})[0];
        const message = `${duplicatedField} already in use by another merchant`;
        throw new ErrorHandler(400, message);
      }
      throw new ErrorHandler(500, 'something went wrong while creating new merchant user');
    }
  }
};

export const findMerchantUserRepo = async (factor: any, withPassword = false) => {
  try {
    if (withPassword) return await MerchantUserModel.findOne(factor).select('+password');
    else return await MerchantUserModel.findOne(factor);
  } catch (error) {
    if (error instanceof mongoose.Error || error instanceof ErrorHandler) {
      throw error;
    } else {
      throw new ErrorHandler(500, 'something went wrong while finding merchant.');
    }
  }
};

export const findMerchantForPasswordResetRepo = async (hashtoken: any) => {
  try {
    return await MerchantUserModel.findOne({
      resetPasswordToken: hashtoken,
      resetPasswordExpire: { $gt: Date.now() },
    });
  } catch (error) {
    if (error instanceof mongoose.Error || error instanceof ErrorHandler) {
      throw error;
    } else {
      throw new ErrorHandler(
        500,
        'something went wrong while finding merchant for password reset.',
      );
    }
  }
};
