import { Request, Response, NextFunction } from 'express';
import { ErrorHandler } from '../../../utils/errors/errorHandler.util';
import {
  createMerchantLocationRepo,
  deleteLocationDetailsRepo,
  getAllMerchantLocationsCountRepo,
  getAllMerchantLocationsRepo,
  getMerchantLocationRepo,
  updateLocationDetailsRepo,
} from '../repository/location.repository';

export const createMerchantLocation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const merchantUserId = req.headers['x-merchant-user-id'] as string;

    if (!merchantUserId) {
      return next(new ErrorHandler(400, 'Merchant User ID is required'));
    }

    const { name, address, phone } = req.body;
    if (!name || !address || !phone) {
      return next(new ErrorHandler(400, 'Please provide all required fields'));
    }

    const result = await createMerchantLocationRepo(merchantUserId, req.body);

    if (!result) {
      return next(new ErrorHandler(400, 'Not able to create Location'));
    }

    res.status(200).json({
      success: true,
      message: 'Location created successfully',
      response: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getMerchantLocation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const merchantUserId = req.headers['x-merchant-user-id'] as string;
    if (!merchantUserId) {
      return next(new ErrorHandler(400, 'Merchant User ID is required'));
    }

    const { locationId } = req.params;

    // console.log('locationId', locationId);
    if (!locationId || typeof locationId !== 'string') {
      return next(new ErrorHandler(400, 'Location ID is required'));
    }

    const result = await getMerchantLocationRepo(locationId);

    console.log('result', result);
    if (!result) {
      return next(new ErrorHandler(404, 'Location not found'));
    }
    if (result.merchantUserId.toString() !== merchantUserId || result.status !== 1) {
      return next(new ErrorHandler(400, 'Location Inactive or does not belong to merchant'));
    }

    res.status(200).json({
      success: true,
      response: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllMerchantLocations = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const merchantUserId = req.headers['x-merchant-user-id'] as string;

    if (!merchantUserId) {
      return next(new ErrorHandler(400, 'Merchant User ID is required'));
    }

    const limit = parseInt(req.query.limit as string) || 10;
    const offset = parseInt(req.query.offset as string) || 0;
    const search = (req.query.search as string)?.trim() || '';
    const status = parseInt(req.query.status as string) || 1;

    const locations = await getAllMerchantLocationsRepo({
      merchantUserId,
      limit,
      offset,
      search,
      status,
    });

    const count = await getAllMerchantLocationsCountRepo({ merchantUserId, status });

    if (!locations || !count) {
      return next(new ErrorHandler(404, 'Location not found or inactive'));
    }

    res.status(200).json({
      success: true,
      total: count,
      response: locations,
    });
  } catch (error) {
    next(error);
  }
};

export const updateLocationDetails = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const merchantUserId = req.headers['x-merchant-user-id'] as string;
    const updateData = req.body;

    if (!merchantUserId) {
      return next(new ErrorHandler(400, 'Merchant User ID is required'));
    }

    if (!updateData || Object.keys(updateData).length === 0) {
      return next(new ErrorHandler(400, 'No data provided to update'));
    }

    const { locationId } = req.params;
    if (!locationId) {
      return next(new ErrorHandler(400, 'Location ID is required'));
    }

    const result = await updateLocationDetailsRepo(merchantUserId, locationId, updateData);

    if (!result) {
      return next(new ErrorHandler(404, 'Location not found'));
    }

    res.status(200).json({
      success: true,
      message: 'Location details updated successfully',
      response: result,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteLocationDetails = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const merchantUserId = req.headers['x-merchant-user-id'] as string;
    if (!merchantUserId) {
      return next(new ErrorHandler(400, 'Merchant User ID is required'));
    }
    const { locationId } = req.params;
    if (!locationId) {
      return next(new ErrorHandler(400, 'Location ID is required'));
    }

    const result = await deleteLocationDetailsRepo(merchantUserId, locationId);

    if (!result) {
      return next(new ErrorHandler(404, 'Location not found or already inactive'));
    }

    res.status(200).json({
      success: true,
      message: 'Location deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
