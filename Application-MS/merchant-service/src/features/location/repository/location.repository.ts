import mongoose from 'mongoose';
import MerchantLocationModel from '../models/location.schema';
import { ErrorHandler } from '../../../utils/errors/errorHandler.util';
import MerchantUserModel from '../../merchantUser/models/merchantUser.schema';
import { validatePhoneEmailConflicts } from '../service/validation/conflictChecker';

export const createNewLocationRepo = async (
  newMerchantUser: any,
  location: any,
  session?: mongoose.ClientSession,
) => {
  try {
    const newLocation = new MerchantLocationModel({
      ...location,
      merchantUserId: newMerchantUser._id,
      phone: newMerchantUser.phone,
      email: newMerchantUser.email,
    });
    await newLocation.save({ session: session ?? null });
    return newLocation;
    // console.log('LOCATION-CREATEED', Location);
  } catch (error: any) {
    if (error instanceof mongoose.Error || error instanceof ErrorHandler) {
      throw error;
    } else {
      throw new ErrorHandler(500, 'something went wrong while creating new merchant location');
    }
  }
};

export const createMerchantLocationRepo = async (merchantUserId: any, location: any) => {
  try {
    // Check for duplicate location name under the same merchant
    const existingLocation = await MerchantLocationModel.findOne({
      name: location.name.trim(),
      merchantUserId,
    }).select('_id name');

    if (existingLocation) {
      throw new ErrorHandler(400, `A location with the name ${location.name} already exists.`);
    }

    // Validate phone/email conflicts before creation
    await validatePhoneEmailConflicts({
      merchantUserId,
      phone: location.phone,
      email: location.email,
    });

    const newLocation = new MerchantLocationModel({
      ...location,
      merchantUserId,
    });
    await newLocation.save();
    return newLocation;
    // console.log('LOCATION-CREATEED', Location);
  } catch (error: any) {
    if (error instanceof mongoose.Error || error instanceof ErrorHandler) {
      throw error;
    } else {
      throw new ErrorHandler(500, 'something went wrong while creating new merchant location');
    }
  }
};

export const getMerchantLocationRepo = async (locationId: string) => {
  try {
    const objectId = new mongoose.Types.ObjectId(locationId);
    return await MerchantLocationModel.findById(objectId).lean();
  } catch (error: any) {
    if (error instanceof mongoose.Error || error instanceof ErrorHandler) {
      throw error;
    } else {
      throw new ErrorHandler(500, 'Error fetching location details');
    }
  }
};

interface GetAllLocationsOptions {
  merchantUserId: string;
  limit: number;
  offset: number;
  search?: string;
  status?: number;
}
export const getAllMerchantLocationsRepo = async ({
  merchantUserId,
  limit,
  offset,
  search,
  status,
}: GetAllLocationsOptions) => {
  try {
    const objectId = new mongoose.Types.ObjectId(merchantUserId);

    const filter: any = {
      merchantUserId: objectId,
      status: status,
    };

    if (search && search != '') {
      const escapedSearchTerm = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const locationName = escapedSearchTerm
        .split(/\s+/)
        .map((word) => `(?=.*${word})`)
        .join('');
      const regex = new RegExp(locationName, 'i');
      filter.name = { $regex: regex };
    }
    // console.log('filter', filter);

    return await MerchantLocationModel.find(filter)
      .select('-__v')
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .lean();
  } catch (error: any) {
    if (error instanceof mongoose.Error || error instanceof ErrorHandler) {
      throw error;
    } else {
      throw new ErrorHandler(500, 'Error fetching all merchant locations');
    }
  }
};

interface CountOptions {
  merchantUserId: string;
  status?: number;
}

export const getAllMerchantLocationsCountRepo = async ({
  merchantUserId,
  status,
}: CountOptions) => {
  try {
    const objectId = new mongoose.Types.ObjectId(merchantUserId);
    const filter: any = {
      merchantUserId: objectId,
      status: status,
    };
    return await MerchantLocationModel.countDocuments(filter);
  } catch (error: any) {
    if (error instanceof mongoose.Error || error instanceof ErrorHandler) {
      throw error;
    } else {
      throw new ErrorHandler(500, 'Error counting merchant locations');
    }
  }
};

export const updateLocationDetailsRepo = async (
  merchantUserId: string,
  locationId: string,
  updateData: any,
) => {
  try {
    const locationObjectId = new mongoose.Types.ObjectId(locationId);
    const merchantObjectId = new mongoose.Types.ObjectId(merchantUserId);

    // Check for duplicate location name under the same merchant
    const existingLocation = await MerchantLocationModel.findOne({
      name: updateData.name.trim(),
      merchantUserId: merchantObjectId,
      _id: { $ne: locationObjectId }, // Exclude current location
    }).select('_id name');

    if (existingLocation) {
      throw new ErrorHandler(400, `A location with the name ${updateData.name} already exists.`);
    }

    // Validate phone/email conflicts before creation
    await validatePhoneEmailConflicts({
      merchantUserId,
      phone: updateData.phone,
      email: updateData.email,
    });

    const updatedLocation = await MerchantLocationModel.findOneAndUpdate(
      {
        _id: locationObjectId,
        merchantUserId: merchantObjectId,
      },
      { $set: updateData },
      {
        new: true,
        runValidators: true,
        lean: true,
      },
    );

    if (!updatedLocation) {
      throw new ErrorHandler(400, 'Location not found or does not belong to this merchant');
    }

    return updatedLocation;
  } catch (error: any) {
    if (error instanceof mongoose.Error || error instanceof ErrorHandler) {
      throw error;
    } else {
      throw new ErrorHandler(500, 'Error updating location details');
    }
  }
};

export const deleteLocationDetailsRepo = async (merchantUserId: string, locationId: string) => {
  try {
    const locationObjectId = new mongoose.Types.ObjectId(locationId);
    const merchantObjectId = new mongoose.Types.ObjectId(merchantUserId);

    const updatedLocation = await MerchantLocationModel.findOneAndUpdate(
      {
        _id: locationObjectId,
        merchantUserId: merchantObjectId,
        status: 1, // only delete if currently active
      },
      {
        $set: { status: 0 },
      },
      {
        new: true,
        runValidators: false,
        lean: true,
      },
    );

    if (!updatedLocation) {
      throw new ErrorHandler(400, 'Location either not found or already inactive');
    }

    return updatedLocation;
  } catch (error: any) {
    if (error instanceof mongoose.Error || error instanceof ErrorHandler) {
      throw error;
    } else {
      throw new ErrorHandler(500, 'Error deleting location');
    }
  }
};
