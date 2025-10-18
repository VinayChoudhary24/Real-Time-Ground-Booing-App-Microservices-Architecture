import mongoose from 'mongoose';
import AcademyCoachSchemaModel from '../models/coach.schema';
import { ErrorHandler } from '../../../../utils/errors/errorHandler.util';

export const createNewCoachRepo = async (coachData: any, merchantUserId: string) => {
  try {
    const newCoach = await AcademyCoachSchemaModel.create(coachData);

    return newCoach;
  } catch (error) {
    if (error instanceof mongoose.Error || error instanceof ErrorHandler) {
      throw error;
    } else {
      throw new ErrorHandler(500, 'something went wrong while creating coach.');
    }
  }
};

export const getCoachRepo = async (merchantUserId: string, locationId: string, coachId: string) => {
  try {
    const result = await AcademyCoachSchemaModel.findOne({
      _id: coachId,
      merchantUserId,
      locationId,
      status: 1,
    }).lean();

    return result;
  } catch (error) {
    if (error instanceof mongoose.Error || error instanceof ErrorHandler) {
      throw error;
    } else {
      throw new ErrorHandler(500, 'Error fetching coach details.');
    }
  }
};

interface GetCoachOptions {
  merchantUserId: string;
  locationId: string;
  limit: number;
  offset: number;
  search?: string;
  status?: number;
}

export const getAllCoachRepo = async ({
  merchantUserId,
  locationId,
  limit,
  offset,
  search,
  status,
}: GetCoachOptions) => {
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

    return await AcademyCoachSchemaModel.find(filter)
      .select('-__v')
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .lean();
  } catch (error) {
    if (error instanceof mongoose.Error || error instanceof ErrorHandler) {
      throw error;
    } else {
      throw new ErrorHandler(500, 'Error fetching all coach');
    }
  }
};

interface CountCoachOptions {
  merchantUserId: string;
  locationId: string;
  status?: number;
}

export const getAllCoachCountRepo = async ({
  merchantUserId,
  locationId,
  status,
}: CountCoachOptions) => {
  try {
    const filter: any = {
      merchantUserId: new mongoose.Types.ObjectId(merchantUserId),
      locationId: new mongoose.Types.ObjectId(locationId),
      status: status,
    };

    return await AcademyCoachSchemaModel.countDocuments(filter);
  } catch (error) {
    if (error instanceof mongoose.Error || error instanceof ErrorHandler) {
      throw error;
    } else {
      throw new ErrorHandler(500, 'Error counting all coach');
    }
  }
};

export const updateCoachRepo = async (merchantUserId: string, coachId: string, updateData: any) => {
  try {
    const updated = await AcademyCoachSchemaModel.findOneAndUpdate(
      {
        _id: coachId,
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
      throw new ErrorHandler(400, 'Coach not found or inactive');
    }

    return updated;
  } catch (error) {
    if (error instanceof mongoose.Error || error instanceof ErrorHandler) {
      throw error;
    } else {
      throw new ErrorHandler(500, 'Error updating coach');
    }
  }
};

export const deleteCoachRepo = async (
  merchantUserId: string,
  locationId: string,
  coachId: string,
) => {
  try {
    const deleted = await AcademyCoachSchemaModel.findOneAndUpdate(
      {
        _id: coachId,
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
      throw new ErrorHandler(400, 'Coach not found or already inactive');
    }

    return deleted;
  } catch (error) {
    if (error instanceof mongoose.Error || error instanceof ErrorHandler) {
      throw error;
    } else {
      throw new ErrorHandler(500, 'Error deleting coach');
    }
  }
};
