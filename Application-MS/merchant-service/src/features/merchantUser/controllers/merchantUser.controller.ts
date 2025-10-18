import { Request, Response, NextFunction } from 'express';
import { ErrorHandler } from '../../../utils/errors/errorHandler.util';
import {
  getInternalMerchantWithLocationRepo,
  getMerchantDetailsRepo,
  getMerchantDetailsWithLocationsRepo,
  getMerchantWithAllLocationsDetailsRepo,
  getMerchantWithLocationDetailsRepo,
  updateMerchantDetailsRepo,
} from '../repository/merchant.repository';

export const getMerchantDetails = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const merchantUserId = req.headers['x-merchant-user-id'] as string;

    if (!merchantUserId) {
      return next(new ErrorHandler(400, 'Merchant User ID is required'));
    }

    const result = await getMerchantDetailsRepo(merchantUserId);

    if (!result) {
      return next(new ErrorHandler(401, 'Merchant not found'));
    }

    res.status(200).json({
      success: true,
      response: result,
    });
  } catch (error) {
    next(error);
  }
};

export const updateMerchantDetails = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const merchantUserId = req.headers['x-merchant-user-id'] as string;
    const updateData = req.body;

    if (!merchantUserId) {
      return next(new ErrorHandler(400, 'Merchant User ID is required'));
    }

    if (!updateData || Object.keys(updateData).length === 0) {
      return next(new ErrorHandler(400, 'No data provided to update'));
    }

    const result = await updateMerchantDetailsRepo(merchantUserId, updateData);

    if (!result) {
      return next(new ErrorHandler(401, 'Merchant not found'));
    }

    res.status(200).json({
      success: true,
      message: 'Merchant details updated successfully',
      response: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getMerchantWithLocationDetails = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const merchantUserId = req.headers['x-merchant-user-id'] as string;
    if (!merchantUserId) {
      return next(new ErrorHandler(400, 'Merchant User ID is required'));
    }
    const { locationId } = req.query;

    if (!locationId || typeof locationId !== 'string') {
      return next(new ErrorHandler(400, 'Location ID is required'));
    }

    const result = await getMerchantWithLocationDetailsRepo(locationId);

    if (!result) {
      return next(new ErrorHandler(404, 'No Active location found for this merchant'));
    }
    // check if the result merchantUserId matches the one in the request header

    if (result.merchantUserId !== merchantUserId) {
      return next(new ErrorHandler(403, 'location does not belong to this merchant'));
    }

    res.status(200).json({
      success: true,
      response: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getMerchantWithAllLocationsDetails = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const merchantUserId = req.headers['x-merchant-user-id'] as string;
    if (!merchantUserId) {
      return next(new ErrorHandler(400, 'Merchant User ID is required'));
    }

    const result = await getMerchantWithAllLocationsDetailsRepo(merchantUserId);

    if (!result) {
      return next(new ErrorHandler(401, 'No merchant found with given ID'));
    }

    res.status(200).json({
      success: true,
      response: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getMerchantDetailsWithLocations = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { merchantUserId } = req.params;

    if (!merchantUserId) {
      return next(new ErrorHandler(401, 'Merchant User ID not found in request'));
    }

    const result = await getMerchantDetailsWithLocationsRepo(merchantUserId);

    if (!result) {
      return next(new ErrorHandler(401, 'Merchant not found'));
    }

    res.status(200).json({
      success: true,
      response: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getInternalMerchantWithLocation = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { merchantUserId, locationId } = req.params;

    // console.log('merchantUserId', merchantUserId);
    // console.log('locationId', locationId);
    if (!merchantUserId || !locationId) {
      return next(new ErrorHandler(400, 'Merchant User ID and Location ID are required'));
    }

    const result = await getInternalMerchantWithLocationRepo(locationId);

    if (!result) {
      return next(new ErrorHandler(404, 'No Active location found for this merchant'));
    }
    // console.log('Internal Merchant with Location Result:', result);

    // check if the result merchantUserId matches the one in the request header
    if (result._id.toString() !== merchantUserId.toString()) {
      return next(new ErrorHandler(403, 'location does not belong to this merchant'));
    }

    res.status(200).json({
      success: true,
      response: result,
    });
  } catch (error) {
    next(error);
  }
};
