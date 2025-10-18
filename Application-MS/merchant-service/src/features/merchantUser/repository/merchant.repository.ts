import mongoose from 'mongoose';
import MerchantUserModel from '../models/merchantUser.schema';
import { ErrorHandler } from '../../../utils/errors/errorHandler.util';

export const getMerchantDetailsRepo = async (merchantUserId: string) => {
  try {
    const objectId = new mongoose.Types.ObjectId(merchantUserId);
    return await MerchantUserModel.findById(objectId).lean();
  } catch (error: any) {
    if (error instanceof mongoose.Error || error instanceof ErrorHandler) {
      throw error;
    } else {
      throw new ErrorHandler(500, 'Error fetching merchant details');
    }
  }
};

export const updateMerchantDetailsRepo = async (merchantUserId: string, updateData: any) => {
  try {
    const objectId = new mongoose.Types.ObjectId(merchantUserId);
    const updatedMerchant = await MerchantUserModel.findByIdAndUpdate(
      objectId,
      { $set: updateData },
      {
        new: true,
        runValidators: true,
        lean: true,
      },
    );
    return updatedMerchant;
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
      throw new ErrorHandler(500, 'Error updating merchant details');
    }
  }
};

export const getMerchantWithLocationDetailsRepo = async (locationId: string) => {
  try {
    const objectId = new mongoose.Types.ObjectId(locationId);

    const result = await MerchantUserModel.aggregate([
      {
        $lookup: {
          from: 'merchantlocations',
          localField: '_id',
          foreignField: 'merchantUserId',
          as: 'locations',
          pipeline: [
            {
              $match: {
                _id: objectId,
                status: 1, // only active location
              },
            },
            {
              $project: {
                _id: 1,
                name: 1,
                address: 1,
                phoneCode: 1,
                phone: 1,
                email: 1,
                status: 1,
                createdAt: 1,
                updatedAt: 1,
              },
            },
          ],
        },
      },
      {
        $match: {
          'locations.0': { $exists: true }, // ensure at least one matched location exists
        },
      },
      {
        $project: {
          firstName: 1,
          lastName: 1,
          email: 1,
          phoneCode: 1,
          phone: 1,
          status: 1,
          createdAt: 1,
          updatedAt: 1,
          locations: 1,
        },
      },
    ]);

    return result[0]; // return the matched merchant with active location
  } catch (error: any) {
    if (error instanceof mongoose.Error || error instanceof ErrorHandler) {
      throw error;
    } else {
      throw new ErrorHandler(
        500,
        'something went wrong while fetching merchant details for locationId',
      );
    }
  }
};

export const getMerchantWithAllLocationsDetailsRepo = async (merchantUserId: string) => {
  try {
    const objectId = new mongoose.Types.ObjectId(merchantUserId);

    const result = await MerchantUserModel.aggregate([
      {
        $match: {
          _id: objectId,
        },
      },
      {
        $lookup: {
          from: 'merchantlocations',
          localField: '_id',
          foreignField: 'merchantUserId',
          as: 'locations',
          pipeline: [
            {
              $project: {
                _id: 1,
                name: 1,
                address: 1,
                phone: 1,
                email: 1,
                status: 1,
                createdAt: 1,
                updatedAt: 1,
              },
            },
          ],
        },
      },
      {
        $project: {
          firstName: 1,
          lastName: 1,
          email: 1,
          phone: 1,
          status: 1,
          createdAt: 1,
          updatedAt: 1,
          locations: 1,
        },
      },
    ]);

    return result[0]; // return single merchant with all locations
  } catch (error: any) {
    if (error instanceof mongoose.Error || error instanceof ErrorHandler) {
      throw error;
    } else {
      throw new ErrorHandler(500, 'Failed to fetch merchant with all locations');
    }
  }
};

export const getMerchantDetailsWithLocationsRepo = async (merchantUserId: string) => {
  try {
    const objectId = new mongoose.Types.ObjectId(merchantUserId);

    const result = await MerchantUserModel.aggregate([
      {
        $match: { _id: objectId },
      },
      {
        $lookup: {
          from: 'merchantlocations', // Collection name (auto-pluralized lowercase)
          localField: '_id',
          foreignField: 'merchantUserId',
          as: 'locations',
          pipeline: [
            {
              $match: { status: 1 }, // Filter only active locations
            },
            {
              $project: {
                status: 1,
              },
            },
          ],
        },
      },
      {
        $project: {
          status: 1,
          locations: 1, // locations are already filtered and projected in the pipeline
        },
      },
    ]);

    return result[0]; // Return single merchant profile with active locations only
  } catch (error: any) {
    if (error instanceof mongoose.Error || error instanceof ErrorHandler) {
      throw error;
    } else {
      throw new ErrorHandler(
        500,
        'something went wrong while fetching internal merchant detail with location',
      );
    }
  }
};

export const getInternalMerchantWithLocationRepo = async (locationId: string) => {
  try {
    const objectId = new mongoose.Types.ObjectId(locationId);

    const result = await MerchantUserModel.aggregate([
      {
        $lookup: {
          from: 'merchantlocations',
          localField: '_id',
          foreignField: 'merchantUserId',
          as: 'locations',
          pipeline: [
            {
              $match: {
                _id: objectId,
                status: 1, // only active location
              },
            },
            {
              $project: {
                _id: 1,
                name: 1,
                address: 1,
                phoneCode: 1,
                phone: 1,
                email: 1,
              },
            },
          ],
        },
      },
      {
        $match: {
          'locations.0': { $exists: true }, // ensure at least one matched location exists
        },
      },
      {
        $project: {
          _id: 1,
          email: 1,
          phoneCode: 1,
          phone: 1,
          status: 1,
          locations: 1,
        },
      },
    ]);

    return result[0]; // return the matched merchant with active location
  } catch (error: any) {
    if (error instanceof mongoose.Error || error instanceof ErrorHandler) {
      throw error;
    } else {
      throw new ErrorHandler(
        500,
        'something went wrong while fetching internal merchant details for locationId',
      );
    }
  }
};
