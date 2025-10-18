import mongoose from 'mongoose';
import DiscountSchemaModel from '../models/discount.schema';
import { ErrorHandler } from '../../../utils/errors/errorHandler.util';
import dayjs from 'dayjs';

export const createNewDiscountRepo = async (discount: any, merchantUserId: string) => {
  try {
    const { facilityId, locationId, startDate, endDate } = discount;

    // Check if any facility already has an active, unexpired discount
    const now = dayjs().unix();

    const existingActiveDiscount = await DiscountSchemaModel.findOne({
      merchantUserId,
      locationId,
      facilityId, // overlaps with incoming discount's facility
      isActive: true,
      endDate: { $gte: now }, // discount not yet expired
    }).select('_id name facilityIds startDate endDate');

    if (existingActiveDiscount) {
      throw new ErrorHandler(
        400,
        `An active discount is already running on the selected facilities.`,
      );
    }

    const newDiscount = await DiscountSchemaModel.create({
      merchantUserId,
      ...discount,
    });

    return newDiscount;
  } catch (error) {
    if (error instanceof mongoose.Error || error instanceof ErrorHandler) {
      throw error;
    } else {
      throw new ErrorHandler(500, 'something went wrong while creating discount.');
    }
  }
};

export const getDiscountRepo = async (
  merchantUserId: string,
  locationId: string,
  discountId: string,
) => {
  try {
    const result = await DiscountSchemaModel.findOne({
      _id: discountId,
      merchantUserId,
      locationId,
      status: 1,
    }).lean();

    return result;
  } catch (error) {
    if (error instanceof mongoose.Error || error instanceof ErrorHandler) {
      throw error;
    } else {
      throw new ErrorHandler(500, 'Error fetching discount details.');
    }
  }
};

interface GetDiscountOptions {
  merchantUserId: string;
  locationId: string;
  limit: number;
  offset: number;
  search?: string;
  status?: number;
}

export const getAllDiscountsRepo = async ({
  merchantUserId,
  locationId,
  limit,
  offset,
  search,
  status,
}: GetDiscountOptions) => {
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

    return await DiscountSchemaModel.find(filter)
      .select('-__v')
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .lean();
  } catch (error) {
    if (error instanceof mongoose.Error || error instanceof ErrorHandler) {
      throw error;
    } else {
      throw new ErrorHandler(500, 'Error fetching discounts');
    }
  }
};

interface CountDiscountOptions {
  merchantUserId: string;
  locationId: string;
  status?: number;
}

export const getAllDiscountsCountRepo = async ({
  merchantUserId,
  locationId,
  status,
}: CountDiscountOptions) => {
  try {
    const filter: any = {
      merchantUserId: new mongoose.Types.ObjectId(merchantUserId),
      locationId: new mongoose.Types.ObjectId(locationId),
      status: status,
    };

    return await DiscountSchemaModel.countDocuments(filter);
  } catch (error) {
    if (error instanceof mongoose.Error || error instanceof ErrorHandler) {
      throw error;
    } else {
      throw new ErrorHandler(500, 'Error counting discounts');
    }
  }
};

export const updateDiscountRepo = async (
  merchantUserId: string,
  discountId: string,
  updateData: any,
) => {
  try {
    const { facilityId, locationId, endDate } = updateData;

    const now = dayjs().unix();

    // Validate: Check for overlapping active discounts (excluding current one)
    const overlappingDiscount = await DiscountSchemaModel.findOne({
      _id: { $ne: discountId }, // exclude current discount
      merchantUserId,
      locationId,
      facilityId,
      isActive: true,
      endDate: { $gte: now },
    }).select('_id name facilityIds startDate endDate');

    if (overlappingDiscount) {
      throw new ErrorHandler(
        400,
        `Another active discount already exists for the selected facilities.`,
      );
    }

    const updated = await DiscountSchemaModel.findOneAndUpdate(
      {
        _id: discountId,
        merchantUserId,
        locationId: locationId,
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
      throw new ErrorHandler(400, 'Discount not found or inactive');
    }

    return updated;
  } catch (error) {
    if (error instanceof mongoose.Error || error instanceof ErrorHandler) {
      throw error;
    } else {
      throw new ErrorHandler(500, 'Error updating Discount');
    }
  }
};

export const deleteDiscountRepo = async (
  merchantUserId: string,
  locationId: string,
  discountId: string,
) => {
  try {
    const deleted = await DiscountSchemaModel.findOneAndUpdate(
      {
        _id: discountId,
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
      throw new ErrorHandler(400, 'Discount not found or already inactive');
    }

    return deleted;
  } catch (error) {
    if (error instanceof mongoose.Error || error instanceof ErrorHandler) {
      throw error;
    } else {
      throw new ErrorHandler(500, 'Error deleting discount');
    }
  }
};
