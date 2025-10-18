import { Request, Response, NextFunction } from 'express';
import { ErrorHandler } from '../../../utils/errors/errorHandler.util';
import {
  createLocationFacilityRepo,
  deleteLocationFacilityRepo,
  getAllLocationFacilitiesCountRepo,
  getAllLocationFacilitiesRepo,
  getLocationFacilityRepo,
  updateLocationFacilityRepo,
} from '../repository/facility.repository';
import { getMerchantDetailsWithLocations } from '../../../connectivity/merchant/merchant';

export const createNewLocationFacility = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const merchantUserId = req.headers['x-merchant-user-id'] as string;

    const { name, type, sport, locationId, dayStartTime, dayEndTime, hoursPerSession } = req.body;
    if (
      !name ||
      !type ||
      !sport ||
      !merchantUserId ||
      !locationId ||
      !dayStartTime ||
      !dayEndTime ||
      !hoursPerSession
    ) {
      return next(new ErrorHandler(400, 'please provide all required fields'));
    }

    //## 1. Call the merchant Service
    const merchantData = await getMerchantDetailsWithLocations(merchantUserId);
    console.log('merchantData', merchantData);
    if (!merchantData) {
      return next(new ErrorHandler(400, 'Failed to fetch merchant data'));
    }
    //## 2. Check if the LocationId Coming in body belongs to the merchant or Not
    const locationExists = merchantData.locations?.some(
      (loc: any) => loc._id.toString() === locationId.toString() && loc.status === 1,
    );

    if (!locationExists) {
      return next(new ErrorHandler(400, 'location Inactive or does not belong to merchant'));
    }

    const merchantFacility: any = await createLocationFacilityRepo(req.body, merchantUserId);
    if (!merchantFacility) {
      return next(new ErrorHandler(400, 'Unable to create facility. please try in some time...'));
    }
    res.status(200).json({
      success: true,
      message: 'Facility created successfully',
    });
  } catch (err) {
    return next(err);
  }
};

export const getLocationFacility = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const merchantUserId = req.headers['x-merchant-user-id'] as string;
    const { facilityId } = req.params;

    if (!merchantUserId || !facilityId) {
      return next(new ErrorHandler(400, 'Merchant ID and Facility ID are required'));
    }

    const locationId = (req.query?.locationId as string) || '';

    if (!locationId) {
      return next(new ErrorHandler(400, 'Location ID is required'));
    }

    const result = await getLocationFacilityRepo(merchantUserId, locationId, facilityId);

    if (!result) {
      return next(new ErrorHandler(404, 'Facility not found or inactive'));
    }

    res.status(200).json({
      success: true,
      response: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllLocationFacilities = async (req: Request, res: Response, next: NextFunction) => {
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

    const result = await getAllLocationFacilitiesRepo({
      merchantUserId,
      locationId,
      limit,
      offset,
      search,
      status,
    });

    const count = await getAllLocationFacilitiesCountRepo({ merchantUserId, locationId, status });

    if (!result || !count) {
      return next(new ErrorHandler(404, 'Facility not found or inactive'));
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

export const updateLocationFacility = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const merchantUserId = req.headers['x-merchant-user-id'] as string;
    const { facilityId } = req.params;
    const updateData = req.body;

    if (!merchantUserId || !facilityId) {
      return next(new ErrorHandler(400, 'Merchant ID and Facility ID are required'));
    }
    if (!updateData || Object.keys(updateData).length === 0) {
      return next(new ErrorHandler(400, 'No data provided to update'));
    }

    const result = await updateLocationFacilityRepo(merchantUserId, facilityId, updateData);

    if (!result) {
      return next(new ErrorHandler(404, 'Facility not found'));
    }

    res.status(200).json({
      success: true,
      message: 'Facility updated successfully',
      response: result,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteLocationFacility = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const merchantUserId = req.headers['x-merchant-user-id'] as string;
    const { facilityId } = req.params;

    if (!merchantUserId || !facilityId) {
      return next(new ErrorHandler(400, 'Merchant ID and Facility ID are required'));
    }

    const locationId = (req.query?.locationId as string) || '';

    if (!locationId) {
      return next(new ErrorHandler(400, 'Location ID is required'));
    }

    const result = await deleteLocationFacilityRepo(merchantUserId, locationId, facilityId);

    if (!result) {
      return next(new ErrorHandler(404, 'Facility not found'));
    }

    res.status(200).json({
      success: true,
      message: 'Facility deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// export const getInternalFacilityDetails = async (
//   req: Request,
//   res: Response,
//   next: NextFunction,
// ) => {
//   try {
//     const { facilityId } = req.params;
//     if (!facilityId) {
//       return next(new ErrorHandler(400, 'Facility ID is required'));
//     }

//     const result: any = await getInternalFacilityDetailsRepo(facilityId);

//     if (!result) {
//       return next(new ErrorHandler(404, 'Facility not found or inactive'));
//     }

//     // get merchant and location details
//     const merchantData = await getInternalMerchantWithLocation(
//       result.merchantUserId,
//       result.locationId,
//     );
//     if (!merchantData) {
//       return next(new ErrorHandler(404, 'Merchant or Location not found'));
//     }
//     let response = {
//       facility: result,
//       merchantWithLocation: merchantData,
//     };

//     res.status(200).json({
//       success: true,
//       response: response,
//     });
//   } catch (error) {
//     next(error);
//   }
// };
