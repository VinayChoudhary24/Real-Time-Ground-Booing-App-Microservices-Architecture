import mongoose from 'mongoose';
import AcademySchemaModel from '../models/academy.schema';
import { ErrorHandler } from '../../../utils/errors/errorHandler.util';

export const createNewAcademyRepo = async (academyData: any, merchantUserId: string) => {
  try {
    const { name, locationId } = academyData;

    // Check for duplicate academy name under the same merchant Location
    const existingAcademy = await AcademySchemaModel.findOne({
      name: name,
      locationId: locationId,
    }).select('_id name');

    if (existingAcademy) {
      throw new ErrorHandler(400, `A academy with the name ${name} already exists.`);
    }

    // 1. Create academy with default settings
    const newAcademy = await AcademySchemaModel.create(academyData);

    return newAcademy;
  } catch (error) {
    if (error instanceof mongoose.Error || error instanceof ErrorHandler) {
      throw error;
    } else {
      throw new ErrorHandler(500, 'something went wrong while creating academy.');
    }
  }
};

export const getAcademyRepo = async (
  merchantUserId: string,
  locationId: string,
  academyId: string,
) => {
  try {
    const result = await AcademySchemaModel.findOne({
      _id: academyId,
      merchantUserId,
      locationId,
      status: 1,
    }).lean();

    return result;
  } catch (error) {
    if (error instanceof mongoose.Error || error instanceof ErrorHandler) {
      throw error;
    } else {
      throw new ErrorHandler(500, 'Error fetching academy details.');
    }
  }
};

interface GetAcademyOptions {
  merchantUserId: string;
  locationId: string;
  limit: number;
  offset: number;
  search?: string;
  status?: number;
}

export const getAllAcademyRepo = async ({
  merchantUserId,
  locationId,
  limit,
  offset,
  search,
  status,
}: GetAcademyOptions) => {
  try {
    const filter: any = {
      merchantUserId: new mongoose.Types.ObjectId(merchantUserId),
      locationId: new mongoose.Types.ObjectId(locationId),
      status: status,
    };

    if (search && search !== '') {
      const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regexPattern = escapedSearch
        .split(/\s+/)
        .map((word) => `(?=.*${word})`)
        .join('');
      filter.name = { $regex: new RegExp(regexPattern, 'i') };
    }

    return await AcademySchemaModel.find(filter)
      .select('-__v')
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .lean();
  } catch (error) {
    if (error instanceof mongoose.Error || error instanceof ErrorHandler) {
      throw error;
    } else {
      throw new ErrorHandler(500, 'Error fetching all academy');
    }
  }
};

interface CountAcademyOptions {
  merchantUserId: string;
  locationId: string;
  status?: number;
}

export const getAllAcademyCountRepo = async ({
  merchantUserId,
  locationId,
  status,
}: CountAcademyOptions) => {
  try {
    const filter: any = {
      merchantUserId: new mongoose.Types.ObjectId(merchantUserId),
      locationId: new mongoose.Types.ObjectId(locationId),
      status: status,
    };

    return await AcademySchemaModel.countDocuments(filter);
  } catch (error) {
    if (error instanceof mongoose.Error || error instanceof ErrorHandler) {
      throw error;
    } else {
      throw new ErrorHandler(500, 'Error counting all academy');
    }
  }
};

export const updateAcademyRepo = async (
  merchantUserId: string,
  academyId: string,
  updateData: any,
) => {
  try {
    // Check for duplicate Academy name under the same merchant Location
    const existingAcademy = await AcademySchemaModel.findOne({
      name: updateData.name,
      locationId: updateData.locationId,
      _id: { $ne: academyId }, // Exclude current facility
    }).select('_id name');

    if (existingAcademy) {
      throw new ErrorHandler(400, `A academy with the name ${updateData.name} already exists.`);
    }

    const updated = await AcademySchemaModel.findOneAndUpdate(
      {
        _id: academyId,
        merchantUserId,
        locationId: updateData.locationId,
        status: 1,
      },
      { $set: updateData },
      {
        new: true,
        runValidators: true,
        lean: true,
      },
    );

    if (!updated) {
      throw new ErrorHandler(400, 'Academy not found or inactive');
    }

    return updated;
  } catch (error) {
    if (error instanceof mongoose.Error || error instanceof ErrorHandler) {
      throw error;
    } else {
      throw new ErrorHandler(500, 'Error updating academy');
    }
  }
};

export const deleteAcademyRepo = async (
  merchantUserId: string,
  locationId: string,
  academyId: string,
) => {
  try {
    const deleted = await AcademySchemaModel.findOneAndUpdate(
      {
        _id: academyId,
        merchantUserId,
        locationId,
        status: 1,
      },
      { $set: { status: 0 } },
      {
        new: true,
        runValidators: false,
        lean: true,
      },
    );

    if (!deleted) {
      throw new ErrorHandler(400, 'Academy not found or already inactive');
    }

    return deleted;
  } catch (error) {
    if (error instanceof mongoose.Error || error instanceof ErrorHandler) {
      throw error;
    } else {
      throw new ErrorHandler(500, 'Error deleting academy');
    }
  }
};
