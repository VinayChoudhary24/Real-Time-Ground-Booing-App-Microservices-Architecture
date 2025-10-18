import mongoose from 'mongoose';
import { ErrorHandler } from '../../../../utils/errors/errorHandler.util';
import AcademyBatchSchemaModel from '../models/batch.schema';

export const createNewBatchRepo = async (batchData: any, merchantUserId: string) => {
  try {
    const { name, locationId } = batchData;

    // Check for duplicate batch name under the same merchant Location
    const existingBatch = await AcademyBatchSchemaModel.findOne({
      name: name,
      locationId: locationId,
    }).select('_id name');

    if (existingBatch) {
      throw new ErrorHandler(400, `A batch with the name ${name} already exists.`);
    }

    const newBatch = await AcademyBatchSchemaModel.create(batchData);

    return newBatch;
  } catch (error) {
    if (error instanceof mongoose.Error || error instanceof ErrorHandler) {
      throw error;
    } else {
      throw new ErrorHandler(500, 'something went wrong while creating batch.');
    }
  }
};

export const getBatchRepo = async (merchantUserId: string, locationId: string, batchId: string) => {
  try {
    const result = await AcademyBatchSchemaModel.findOne({
      _id: batchId,
      merchantUserId,
      locationId,
      status: 1,
    }).lean();

    return result;
  } catch (error) {
    if (error instanceof mongoose.Error || error instanceof ErrorHandler) {
      throw error;
    } else {
      throw new ErrorHandler(500, 'Error fetching batch details.');
    }
  }
};

interface GetBatchOptions {
  merchantUserId: string;
  locationId: string;
  limit: number;
  offset: number;
  search?: string;
  status?: number;
}

export const getAllBatchRepo = async ({
  merchantUserId,
  locationId,
  limit,
  offset,
  search,
  status,
}: GetBatchOptions) => {
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

    return await AcademyBatchSchemaModel.find(filter)
      .select('-__v')
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .lean();
  } catch (error) {
    if (error instanceof mongoose.Error || error instanceof ErrorHandler) {
      throw error;
    } else {
      throw new ErrorHandler(500, 'Error fetching all batches');
    }
  }
};

interface CountBatchOptions {
  merchantUserId: string;
  locationId: string;
  status?: number;
}

export const getAllBatchCountRepo = async ({
  merchantUserId,
  locationId,
  status,
}: CountBatchOptions) => {
  try {
    const filter: any = {
      merchantUserId: new mongoose.Types.ObjectId(merchantUserId),
      locationId: new mongoose.Types.ObjectId(locationId),
      status: status,
    };

    return await AcademyBatchSchemaModel.countDocuments(filter);
  } catch (error) {
    if (error instanceof mongoose.Error || error instanceof ErrorHandler) {
      throw error;
    } else {
      throw new ErrorHandler(500, 'Error counting all batches');
    }
  }
};

export const updateBatchRepo = async (merchantUserId: string, batchId: string, updateData: any) => {
  try {
    // Check for duplicate Batch name under the same merchant Location
    const existingBatch = await AcademyBatchSchemaModel.findOne({
      name: updateData.name,
      locationId: updateData.locationId,
      _id: { $ne: batchId }, // Exclude current batch
    }).select('_id name');

    if (existingBatch) {
      throw new ErrorHandler(400, `A batch with the name ${updateData.name} already exists.`);
    }

    const updated = await AcademyBatchSchemaModel.findOneAndUpdate(
      {
        _id: batchId,
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
      throw new ErrorHandler(400, 'Batch not found or inactive');
    }

    return updated;
  } catch (error) {
    if (error instanceof mongoose.Error || error instanceof ErrorHandler) {
      throw error;
    } else {
      throw new ErrorHandler(500, 'Error updating batch');
    }
  }
};

export const deleteBatchRepo = async (
  merchantUserId: string,
  locationId: string,
  batchId: string,
) => {
  try {
    const deleted = await AcademyBatchSchemaModel.findOneAndUpdate(
      {
        _id: batchId,
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
      throw new ErrorHandler(400, 'Batch not found or already inactive');
    }

    return deleted;
  } catch (error) {
    if (error instanceof mongoose.Error || error instanceof ErrorHandler) {
      throw error;
    } else {
      throw new ErrorHandler(500, 'Error deleting batch');
    }
  }
};
