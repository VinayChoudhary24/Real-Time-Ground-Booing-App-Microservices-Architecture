import mongoose from 'mongoose';
import { ErrorHandler } from '../../../utils/errors/errorHandler.util';
import FacilitySchemaModel from '../models/facility.schema';
import { generate45DayAvailability } from '../../../utils/facilitySchedule/daysAvailability.util';
import { validateIntervalTypes } from '../service/validateIntervalTypes';
import { validateBaseSlots } from '../service/validateBaseSlots';

/**
 * Creates a new facility and its 45-day availability schedule.
 * @param payload - Facility input containing config for scheduling
 * @returns Newly created facility document
 */
export const createLocationFacilityRepo = async (facilityData: any, merchantUserId: string) => {
  try {
    const {
      name,
      type,
      sport,
      locationId,
      dayStartTime,
      dayEndTime,
      hoursPerSession,
      description,
      images,
      isTimeFlexible,
      maintenance,
      academyTime,
    } = facilityData;

    // Check for duplicate Facility name under the same merchant Location
    const existingFacility = await FacilitySchemaModel.findOne({
      name: name,
      locationId: locationId,
    }).select('_id name');

    if (existingFacility) {
      throw new ErrorHandler(400, `A facility with the name ${name} already exists.`);
    }

    const facilityToCreate: any = {
      name,
      type,
      sport,
      merchantUserId,
      locationId,
      dayStartTime,
      dayEndTime,
      hoursPerSession,
      description,
      images,
      isTimeFlexible,
      maintenance,
      academyTime,
    };

    const isFixedTime = !isTimeFlexible;
    const hasIntervals = maintenance || academyTime;
    if (isFixedTime) {
      // Fixed Time: baseSlots required
      const { baseSlots } = facilityData;
      if (!baseSlots || !Array.isArray(baseSlots) || baseSlots.length === 0) {
        throw new ErrorHandler(400, 'Base slots are required for a fixed time facility');
      }
      const { isValid, message } = validateBaseSlots(baseSlots, dayStartTime, dayEndTime);
      if (!isValid) {
        let errorMessage: string = message || 'slots timing are not under facility operating hours';
        throw new ErrorHandler(400, errorMessage);
      }
      facilityToCreate.baseSlots = baseSlots;
    } else {
      // Flexible Time: pricePerHour is always required
      const { pricePerHour } = facilityData;
      if (pricePerHour === undefined || pricePerHour === null || pricePerHour === 0) {
        throw new ErrorHandler(400, 'Price per hour is required for a flexible time facility');
      }
      facilityToCreate.pricePerHour = pricePerHour;
      if (hasIntervals) {
        // Flexible with maintenance/academy: intervalTypes required
        const { intervalTypes } = facilityData;
        if (!intervalTypes || !Array.isArray(intervalTypes) || intervalTypes.length === 0) {
          throw new ErrorHandler(
            400,
            'Intervals are required for a facility with maintenance or academy time',
          );
        }
        const { isValid, message } = validateIntervalTypes(intervalTypes, dayStartTime, dayEndTime);
        if (!isValid) {
          let errorMessage: string = message || 'intervals are not under facility operating hours';
          throw new ErrorHandler(400, errorMessage);
        }
        facilityToCreate.intervalTypes = intervalTypes;
      }
    }

    // 1. Create facility with default settings
    const newFacility = await FacilitySchemaModel.create(facilityToCreate);

    if (!isTimeFlexible) {
      await generate45DayAvailability({
        facilityId: newFacility._id,
        merchantUserId: merchantUserId,
        locationId: locationId,
        baseSlots: facilityData.baseSlots || [],
        pricePerHour: facilityData.pricePerHour || 0,
      });
    }

    return newFacility;
  } catch (error) {
    if (error instanceof mongoose.Error || error instanceof ErrorHandler) {
      throw error;
    } else {
      throw new ErrorHandler(500, 'something went wrong while creating a facility.');
    }
  }
};

export const getLocationFacilityRepo = async (
  merchantUserId: string,
  locationId: string,
  facilityId: string,
) => {
  try {
    const result = await FacilitySchemaModel.findOne({
      _id: facilityId,
      merchantUserId,
      locationId,
      status: 1,
    }).lean();

    return result;
  } catch (error) {
    if (error instanceof mongoose.Error || error instanceof ErrorHandler) {
      throw error;
    } else {
      throw new ErrorHandler(500, 'Error fetching facility details.');
    }
  }
};

interface GetFacilitiesOptions {
  merchantUserId: string;
  locationId: string;
  limit: number;
  offset: number;
  search?: string;
  status?: number;
}

export const getAllLocationFacilitiesRepo = async ({
  merchantUserId,
  locationId,
  limit,
  offset,
  search,
  status,
}: GetFacilitiesOptions) => {
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

    return await FacilitySchemaModel.find(filter)
      .select('-__v')
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .lean();
  } catch (error) {
    if (error instanceof mongoose.Error || error instanceof ErrorHandler) {
      throw error;
    } else {
      throw new ErrorHandler(500, 'Error fetching facilities');
    }
  }
};

interface CountFacilitiesOptions {
  merchantUserId: string;
  locationId: string;
  status?: number;
}

export const getAllLocationFacilitiesCountRepo = async ({
  merchantUserId,
  locationId,
  status,
}: CountFacilitiesOptions) => {
  try {
    const filter: any = {
      merchantUserId: new mongoose.Types.ObjectId(merchantUserId),
      locationId: new mongoose.Types.ObjectId(locationId),
      status: status,
    };

    return await FacilitySchemaModel.countDocuments(filter);
  } catch (error) {
    if (error instanceof mongoose.Error || error instanceof ErrorHandler) {
      throw error;
    } else {
      throw new ErrorHandler(500, 'Error counting facilities');
    }
  }
};

export const updateLocationFacilityRepo = async (
  merchantUserId: string,
  facilityId: string,
  updateData: any,
) => {
  try {
    // Check for duplicate Facility name under the same merchant Location
    const existingFacility = await FacilitySchemaModel.findOne({
      name: updateData.name,
      locationId: updateData.locationId,
      _id: { $ne: facilityId }, // Exclude current facility
    }).select('_id name');

    if (existingFacility) {
      throw new ErrorHandler(400, `A facility with the name ${updateData.name} already exists.`);
    }

    const updated = await FacilitySchemaModel.findOneAndUpdate(
      {
        _id: facilityId,
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
      throw new ErrorHandler(400, 'Facility not found or inactive');
    }

    return updated;
  } catch (error) {
    if (error instanceof mongoose.Error || error instanceof ErrorHandler) {
      throw error;
    } else {
      throw new ErrorHandler(500, 'Error updating facility');
    }
  }
};

export const deleteLocationFacilityRepo = async (
  merchantUserId: string,
  locationId: string,
  facilityId: string,
) => {
  try {
    const deleted = await FacilitySchemaModel.findOneAndUpdate(
      {
        _id: facilityId,
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
      throw new ErrorHandler(400, 'Facility not found or already inactive');
    }

    return deleted;
  } catch (error) {
    if (error instanceof mongoose.Error || error instanceof ErrorHandler) {
      throw error;
    } else {
      throw new ErrorHandler(500, 'Error deleting facility');
    }
  }
};

export const getFacilityHoursDetailsRepo = async (facilityId: string) => {
  try {
    const result = await FacilitySchemaModel.findOne(
      {
        _id: facilityId,
        status: 1,
      },
      {
        dayStartTime: 1,
        dayEndTime: 1,
      },
    ).lean();

    return result;
  } catch (error) {
    if (error instanceof mongoose.Error || error instanceof ErrorHandler) {
      throw error;
    } else {
      throw new ErrorHandler(500, 'Error fetching facility hours details.');
    }
  }
};

export const getInternalFacilityDetailsRepo = async (facilityId: string) => {
  try {
    const result = await FacilitySchemaModel.findOne(
      {
        _id: facilityId,
        status: 1,
      },
      {
        name: 1,
        type: 1,
        sport: 1,
        isTimeFlexible: 1,
        maintenance: 1,
        academyTime: 1,
        merchantUserId: 1,
        locationId: 1,
        intervalTypes: 1,
        dayStartTime: 1,
        dayEndTime: 1,
        description: 1,
        images: 1,
      },
    ).lean();

    return result;
  } catch (error) {
    if (error instanceof mongoose.Error || error instanceof ErrorHandler) {
      throw error;
    } else {
      throw new ErrorHandler(500, 'Error fetching internal facility details.');
    }
  }
};
