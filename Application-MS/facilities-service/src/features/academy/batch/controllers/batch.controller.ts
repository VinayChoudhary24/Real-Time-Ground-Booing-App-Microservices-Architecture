import { Request, Response, NextFunction } from 'express';
import { ErrorHandler } from '../../../../utils/errors/errorHandler.util';
import {
  createNewBatchRepo,
  deleteBatchRepo,
  getAllBatchCountRepo,
  getAllBatchRepo,
  getBatchRepo,
  updateBatchRepo,
} from '../repository/batch.repository';

export const createNewBatch = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const merchantUserId = req.headers['x-merchant-user-id'] as string;

    const {
      name,
      sport,
      ageGroup,
      startDate,
      endDate,
      days,
      sessionsPerDay,
      fees,
      locationId,
      facilityId,
    } = req.body;
    if (
      !name ||
      !sport ||
      !ageGroup ||
      !startDate ||
      !endDate ||
      !days ||
      !sessionsPerDay ||
      !fees ||
      !merchantUserId ||
      !locationId ||
      !facilityId
    ) {
      return next(new ErrorHandler(400, 'please provide all required fields'));
    }

    const result: any = await createNewBatchRepo(req.body, merchantUserId);
    if (!result) {
      return next(new ErrorHandler(400, 'Unable to create batchh. please try in some time...'));
    }
    res.status(200).json({
      success: true,
      message: 'Batch created successfully',
    });
  } catch (err) {
    return next(err);
  }
};

export const getBatch = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const merchantUserId = req.headers['x-merchant-user-id'] as string;
    const { batchId } = req.params;

    if (!merchantUserId || !batchId) {
      return next(new ErrorHandler(400, 'Merchant ID and Batch ID are required'));
    }

    const locationId = (req.query?.locationId as string) || '';

    if (!locationId) {
      return next(new ErrorHandler(400, 'Location ID is required'));
    }

    const result = await getBatchRepo(merchantUserId, locationId, batchId);

    if (!result) {
      return next(new ErrorHandler(404, 'Batch not found or inactive'));
    }

    res.status(200).json({
      success: true,
      response: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllBatch = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const merchantUserId = req.headers['x-merchant-user-id'] as string;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = parseInt(req.query.offset as string) || 0;
    const search = (req.query.search as string)?.trim() || '';
    const status = parseInt(req.query.status as string) || 1;
    const locationId = (req.query?.locationId as string) || '';

    if (!merchantUserId) {
      return next(new ErrorHandler(400, 'Merchant ID is required'));
    }

    const result = await getAllBatchRepo({
      merchantUserId,
      locationId,
      limit,
      offset,
      search,
      status,
    });

    const count = await getAllBatchCountRepo({ merchantUserId, locationId, status });

    if (!result || !count) {
      return next(new ErrorHandler(404, 'Batch not found or inactive'));
    }

    res.status(200).json({
      success: true,
      total: count,
      response: result,
    });
  } catch (error) {
    next(error);
  }
};

export const updateBatch = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const merchantUserId = req.headers['x-merchant-user-id'] as string;
    const { batchId } = req.params;
    const updateData = req.body;

    if (!merchantUserId || !batchId) {
      return next(new ErrorHandler(400, 'Merchant ID and Batch ID are required'));
    }
    if (!updateData || Object.keys(updateData).length === 0) {
      return next(new ErrorHandler(400, 'No data provided to update'));
    }

    const result = await updateBatchRepo(merchantUserId, batchId, updateData);

    if (!result) {
      return next(new ErrorHandler(404, 'batch not found'));
    }

    res.status(200).json({
      success: true,
      message: 'Batch updated successfully',
      response: result,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteBatch = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const merchantUserId = req.headers['x-merchant-user-id'] as string;
    const { batchId } = req.params;

    if (!merchantUserId || !batchId) {
      return next(new ErrorHandler(400, 'Merchant ID and Batch ID are required'));
    }

    const locationId = (req.query?.locationId as string) || '';

    if (!locationId) {
      return next(new ErrorHandler(400, 'Location ID is required'));
    }

    const result = await deleteBatchRepo(merchantUserId, locationId, batchId);

    if (!result) {
      return next(new ErrorHandler(404, 'Batch not found'));
    }

    res.status(200).json({
      success: true,
      message: 'Batch deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
