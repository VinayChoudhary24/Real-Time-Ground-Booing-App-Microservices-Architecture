import { Request, Response, NextFunction } from 'express';
import { ErrorHandler } from '../../../utils/errors/errorHandler.util';
import {
  createNewDiscountRepo,
  deleteDiscountRepo,
  getAllDiscountsCountRepo,
  getAllDiscountsRepo,
  getDiscountRepo,
  updateDiscountRepo,
} from '../repository/discount.repository';
import EventEmitter from 'events';
import { errorLogger } from '../../../utils/logs/logger.util';
import { applyDiscountToAvailability, applyDiscountToFacility } from '../service/applyDiscount';
import {
  removeDiscountFromAvailability,
  removeDiscountFromFacility,
} from '../service/removeDiscount';

// Create event emitter instance
const discountEventEmitter = new EventEmitter();

// Event handlers for background processing
discountEventEmitter.on('discount.created', async (data) => {
  try {
    const discount = {
      _id: data.discount._id,
      facilityId: data.discount.facilityId,
      merchantUserId: data.discount.merchantUserId,
      locationId: data.discount.locationId,
      name: data.discount.name,
    };
    // console.log('ADDING-FACILITY-DISCOUNT', discount);
    await applyDiscountToFacility(discount);
  } catch (discounterror) {
    errorLogger.error('Failed to apply discount on facility:', discounterror);
  }

  // try {
  //   const discount = {
  //     _id: data.discount._id,
  //     facilityId: data.discount.facilityId,
  //     merchantUserId: data.discount.merchantUserId,
  //     locationId: data.discount.locationId,
  //     name: data.discount.name,
  //     applicableDatesAndSlots: data.discount.applicableIntervals || [],
  //   };
  //   // console.log('ADDING-FACILITY-DISCOUNT', discount);
  //   await applyDiscountToFacilityIntervalsTypes(discount);
  // } catch (discounterror) {
  //   errorLogger.error('Failed to apply discount on facility Intervals:', discounterror);
  // }

  try {
    const discount = {
      _id: data.discount._id,
      applicableDatesAndSlots: data.discount.applicableDatesAndSlots || [],
    };
    // console.log('ADDING-AVAILABILITY-DISCOUNT');
    await applyDiscountToAvailability(discount);
  } catch (discounterror) {
    errorLogger.error('Failed to apply discount on facility availability:', discounterror);
  }
});
discountEventEmitter.on('discount.deleted', async (data) => {
  const { _id: discountId, facilityId, applicableDatesAndSlots } = data;

  try {
    await removeDiscountFromFacility(discountId, facilityId);
  } catch (err) {
    errorLogger.error(`[Discount:${discountId}] Error removing from facility:`, err);
  }

  try {
    await removeDiscountFromAvailability(discountId, applicableDatesAndSlots);
  } catch (err) {
    errorLogger.error(`[Discount:${discountId}] Error removing from availability:`, err);
  }
});

export const createNewDiscount = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const merchantUserId = req.headers['x-merchant-user-id'] as string;

    const {
      name,
      locationId,
      facilityId,
      discountType,
      discountValue,
      discountScope,
      startDate,
      endDate,
    } = req.body;
    if (
      !name ||
      !locationId ||
      !facilityId ||
      !merchantUserId ||
      !locationId ||
      !discountType ||
      !discountValue ||
      !discountScope ||
      !startDate ||
      !endDate
    ) {
      return next(new ErrorHandler(400, 'please provide all required fields'));
    }

    const discount: any = await createNewDiscountRepo(req.body, merchantUserId);
    // console.log('DISCOUNT', discount);
    if (!discount) {
      return next(new ErrorHandler(400, 'Unable to create discount. please try in some time...'));
    }
    res.status(200).json({
      success: true,
      message: 'Discount created successfully',
    });

    // ## IMPLEMENT DISCOUNT ON INTERVAL LEVEL ALSO IF NEEDED
    setImmediate(() => {
      // Emit events for background processing
      discountEventEmitter.emit('discount.created', {
        discount: discount,
      });
    });
  } catch (err) {
    return next(err);
  }
};

export const getDiscount = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const merchantUserId = req.headers['x-merchant-user-id'] as string;
    const { discountId } = req.params;
    const locationId = (req.query?.locationId as string) || '';

    if (!merchantUserId || !discountId) {
      return next(new ErrorHandler(400, 'Merchant ID and Discount ID are required'));
    }
    if (!locationId) {
      return next(new ErrorHandler(400, 'Location ID is required'));
    }

    const result = await getDiscountRepo(merchantUserId, locationId, discountId);

    if (!result) {
      return next(new ErrorHandler(404, 'Discount not found or inactive'));
    }

    res.status(200).json({
      success: true,
      response: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllDiscounts = async (req: Request, res: Response, next: NextFunction) => {
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

    const result = await getAllDiscountsRepo({
      merchantUserId,
      locationId,
      limit,
      offset,
      search,
      status,
    });

    const count = await getAllDiscountsCountRepo({ merchantUserId, locationId, status });

    if (!result || !count) {
      return next(new ErrorHandler(404, 'Discount not found or inactive'));
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

export const updateDiscount = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const merchantUserId = req.headers['x-merchant-user-id'] as string;
    const { discountId } = req.params;
    const updateData = req.body;

    if (!merchantUserId || !discountId) {
      return next(new ErrorHandler(400, 'Merchant ID and discount ID are required'));
    }
    if (!updateData || Object.keys(updateData).length === 0) {
      return next(new ErrorHandler(400, 'No data provided to update'));
    }

    const result = await updateDiscountRepo(merchantUserId, discountId, updateData);

    if (!result) {
      return next(new ErrorHandler(404, 'Discount not found'));
    }

    res.status(200).json({
      success: true,
      message: 'Discount updated successfully',
      response: result,
    });

    if (updateData?.status && updateData?.status === 0) {
      setImmediate(() => {
        discountEventEmitter.emit('discount.deleted', {
          _id: discountId,
          facilityId: result.facilityId,
          applicableDatesAndSlots: result.applicableDatesAndSlots || [],
        });
      });
    }
    if (updateData?.status && updateData?.status === 1) {
      setImmediate(() => {
        discountEventEmitter.emit('discount.created', {
          discount: result,
        });
      });
    }
  } catch (error) {
    next(error);
  }
};

export const deleteDiscount = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const merchantUserId = req.headers['x-merchant-user-id'] as string;
    const { discountId } = req.params;

    if (!merchantUserId || !discountId) {
      return next(new ErrorHandler(400, 'Merchant ID and Discount ID are required'));
    }

    const locationId = (req.query?.locationId as string) || '';

    if (!locationId) {
      return next(new ErrorHandler(400, 'Location ID is required'));
    }

    const result: any = await deleteDiscountRepo(merchantUserId, locationId, discountId);
    // console.log('result-DISCOUNT', result);

    if (!result) {
      return next(new ErrorHandler(404, 'Discount not found'));
    }

    res.status(200).json({
      success: true,
      message: 'Discount deleted successfully',
    });

    setImmediate(() => {
      discountEventEmitter.emit('discount.deleted', {
        _id: discountId,
        facilityId: result.facilityId,
        applicableDatesAndSlots: result.applicableDatesAndSlots || [],
      });
    });
  } catch (error) {
    next(error);
  }
};
