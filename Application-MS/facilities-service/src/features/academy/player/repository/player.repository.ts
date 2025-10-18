import mongoose from 'mongoose';
import AcademyPlayerSchemaModel from '../models/player.schema';
import { ErrorHandler } from '../../../../utils/errors/errorHandler.util';

export const createNewPlayerRepo = async (playerData: any, merchantUserId: string) => {
  try {
    const newAcademy = await AcademyPlayerSchemaModel.create(playerData);

    return newAcademy;
  } catch (error) {
    if (error instanceof mongoose.Error || error instanceof ErrorHandler) {
      throw error;
    } else {
      throw new ErrorHandler(500, 'something went wrong while creating player.');
    }
  }
};

export const getPlayerRepo = async (
  merchantUserId: string,
  locationId: string,
  playerId: string,
) => {
  try {
    const result = await AcademyPlayerSchemaModel.findOne({
      _id: playerId,
      merchantUserId,
      locationId,
      status: 1,
    }).lean();

    return result;
  } catch (error) {
    if (error instanceof mongoose.Error || error instanceof ErrorHandler) {
      throw error;
    } else {
      throw new ErrorHandler(500, 'Error fetching player details.');
    }
  }
};

interface GetPlayersOptions {
  merchantUserId: string;
  locationId: string;
  limit: number;
  offset: number;
  search?: string;
  status?: number;
}

export const getAllPlayerRepo = async ({
  merchantUserId,
  locationId,
  limit,
  offset,
  search,
  status,
}: GetPlayersOptions) => {
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

    return await AcademyPlayerSchemaModel.find(filter)
      .select('-__v')
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .lean();
  } catch (error) {
    if (error instanceof mongoose.Error || error instanceof ErrorHandler) {
      throw error;
    } else {
      throw new ErrorHandler(500, 'Error fetching all players');
    }
  }
};

interface CountPlayersOptions {
  merchantUserId: string;
  locationId: string;
  status?: number;
}

export const getAllPlayerCountRepo = async ({
  merchantUserId,
  locationId,
  status,
}: CountPlayersOptions) => {
  try {
    const filter: any = {
      merchantUserId: new mongoose.Types.ObjectId(merchantUserId),
      locationId: new mongoose.Types.ObjectId(locationId),
      status: status,
    };

    return await AcademyPlayerSchemaModel.countDocuments(filter);
  } catch (error) {
    if (error instanceof mongoose.Error || error instanceof ErrorHandler) {
      throw error;
    } else {
      throw new ErrorHandler(500, 'Error counting all players');
    }
  }
};

export const updatePlayerRepo = async (
  merchantUserId: string,
  playerId: string,
  updateData: any,
) => {
  try {
    const updated = await AcademyPlayerSchemaModel.findOneAndUpdate(
      {
        _id: playerId,
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
      throw new ErrorHandler(400, 'Player not found or inactive');
    }

    return updated;
  } catch (error) {
    if (error instanceof mongoose.Error || error instanceof ErrorHandler) {
      throw error;
    } else {
      throw new ErrorHandler(500, 'Error updating player');
    }
  }
};

export const deletePlayerRepo = async (
  merchantUserId: string,
  locationId: string,
  playerId: string,
) => {
  try {
    const deleted = await AcademyPlayerSchemaModel.findOneAndUpdate(
      {
        _id: playerId,
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
      throw new ErrorHandler(400, 'Player not found or already inactive');
    }

    return deleted;
  } catch (error) {
    if (error instanceof mongoose.Error || error instanceof ErrorHandler) {
      throw error;
    } else {
      throw new ErrorHandler(500, 'Error deleting player');
    }
  }
};
