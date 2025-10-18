import { Request, Response, NextFunction } from 'express';
import { ErrorHandler } from '../../../utils/errors/errorHandler.util';
import {
  createFacilityAvailabilityRepo,
  createInternalFacilityAvailabilityRepo,
  deleteFacilityAvailabilityRepo,
  getFacilityAvailabilityDetailsRepo,
  getFacilityAvailabilityRepo,
  getInternalFacilityAvailabilityDetailsRepo,
  updateFacilityAvailabilityRepo,
  updateInternalFacilityAvailabilityRepo,
} from '../repository/facilityAvailability.repository';
import {
  getFacilityHoursDetailsRepo,
  getInternalFacilityDetailsRepo,
} from '../../facility/repository/facility.repository';
import { getInternalMerchantWithLocation } from '../../../connectivity/merchant/merchant';
import { validateSlotTimings } from '../service/validateSlotTimings';
import dayjs from 'dayjs';
import { validateSlotAgainstAvailability } from '../service/validateSlotAgainstAvailability';
import { validateSlotAgainstIntervals } from '../service/validateSlotAgainstIntervals';

export const createFacilityAvailability = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const merchantUserId = req.headers['x-merchant-user-id'] as string;

    const { facilityId, locationId, date, day, slots, isActive, pricePerHour } = req.body;

    if (
      !facilityId ||
      !merchantUserId ||
      !locationId ||
      !date ||
      !day ||
      !isActive ||
      !Array.isArray(slots)
    ) {
      return next(new ErrorHandler(400, 'please provide all required fields'));
    }

    const availability = await createFacilityAvailabilityRepo({
      facilityId,
      merchantUserId,
      locationId,
      date,
      day,
      isActive,
      slots,
      pricePerHour,
    });

    res.status(201).json({
      success: true,
      message: 'Facility availability created successfully',
      response: availability,
    });
  } catch (err) {
    return next(err);
  }
};

export const getFacilityAvailability = async (req: Request, res: Response, next: NextFunction) => {
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

    const queryStart = req.query?.startDate;
    const queryEnd = req.query?.endDate;

    let startDate: number;
    let endDate: number;

    if (queryStart && queryEnd) {
      const parsedStart = Number(queryStart);
      const parsedEnd = Number(queryEnd);

      if (isNaN(parsedStart) || isNaN(parsedEnd)) {
        return next(new ErrorHandler(400, 'startDate and endDate are not valid'));
      }

      startDate = parsedStart;
      endDate = parsedEnd;
    } else {
      // Default to next 7 days
      startDate = dayjs().startOf('day').unix();
      endDate = dayjs().add(6, 'day').endOf('day').unix();
    }

    const availability = await getFacilityAvailabilityRepo(
      facilityId,
      merchantUserId,
      locationId,
      startDate,
      endDate,
    );

    res.status(200).json({
      success: true,
      response: availability,
    });
  } catch (err) {
    return next(err);
  }
};

export const updateFacilityAvailability = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const merchantUserId = req.headers['x-merchant-user-id'] as string;
    const { facilityAvailabilityId } = req.params;
    if (!merchantUserId || !facilityAvailabilityId) {
      return next(new ErrorHandler(400, 'Merchant ID and Facility Availability ID are required'));
    }

    const updateData = req.body;

    if (!updateData || Object.keys(updateData).length === 0) {
      return next(new ErrorHandler(400, 'No data provided to update'));
    }

    const facilityAvailability: any =
      await getFacilityAvailabilityDetailsRepo(facilityAvailabilityId);

    if (!facilityAvailability) {
      return next(new ErrorHandler(404, 'Facility availability not found'));
    }

    const { facilityId } = facilityAvailability;
    const facility: any = await getFacilityHoursDetailsRepo(facilityId);

    if (!facility) {
      return next(new ErrorHandler(404, 'Facility not found or inactive'));
    }

    const { dayStartTime, dayEndTime } = facility;

    if (!dayStartTime || !dayEndTime) {
      return next(new ErrorHandler(404, 'Facility timings not found'));
    }
    const updatedSlot = updateData.slots[0] || {};
    const existingSlots = facilityAvailability.slots || [];

    const { isValid, message } = validateSlotAgainstAvailability(
      updatedSlot,
      existingSlots,
      dayStartTime,
      dayEndTime,
    );
    if (!isValid) {
      let errorMessage: string = message || 'slot timings are not valid';
      return next(new ErrorHandler(400, errorMessage));
    }

    const updatedSlots = existingSlots.map((slot: any) => {
      if (slot._id.toString() === updatedSlot._id.toString()) {
        return {
          ...slot,
          ...updatedSlot,
        };
      }
      return slot;
    });
    // Replace the slots field in updateData with full updated list
    updateData.slots = updatedSlots;

    const updatedAvailability = await updateFacilityAvailabilityRepo(
      facilityAvailabilityId,
      facilityId,
      merchantUserId,
      updateData,
    );

    res.status(200).json({
      success: true,
      message: 'Facility schedule updated successfully',
      response: updatedAvailability,
    });
  } catch (err) {
    return next(err);
  }
};

export const deleteFacilityAvailability = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const merchantUserId = req.headers['x-merchant-user-id'] as string;
    const { facilityAvailabilityId } = req.params;

    if (!merchantUserId || !facilityAvailabilityId) {
      return next(new ErrorHandler(400, 'Merchant ID and Facility Availability ID are required'));
    }

    const locationId = (req.query?.locationId as string) || '';
    const facilityId = (req.query?.facilityId as string) || '';
    const slotId = (req.query?.slotId as string) || '';

    if (!locationId || !facilityId) {
      return next(new ErrorHandler(400, 'Location ID and Facility ID are required'));
    }

    const result = await deleteFacilityAvailabilityRepo(
      merchantUserId,
      locationId,
      facilityId,
      facilityAvailabilityId,
      slotId,
    );

    if (!result) {
      return next(new ErrorHandler(404, 'Facility Availability not found'));
    }

    res.status(200).json({
      success: true,
      message: 'Slot deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const getInternalFacilityDetails = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { facilityAvailabilityId } = req.params;
    if (!facilityAvailabilityId) {
      return next(new ErrorHandler(400, 'Facility Availability ID is required'));
    }

    const facilityAvailability: any =
      await getInternalFacilityAvailabilityDetailsRepo(facilityAvailabilityId);

    if (!facilityAvailability) {
      return next(new ErrorHandler(404, 'Facility availability not found'));
    }
    // check facility is active
    if (!facilityAvailability.isActive) {
      return next(new ErrorHandler(404, 'Facility is not available for booking on this date'));
    }

    const { facilityId } = facilityAvailability;
    if (!facilityId) {
      return next(new ErrorHandler(400, 'Facility ID with availability not found'));
    }

    const result: any = await getInternalFacilityDetailsRepo(facilityId);

    if (!result) {
      return next(new ErrorHandler(404, 'Facility not found or inactive'));
    }

    const slots = JSON.parse(req.query.slots as string);
    if (!slots) {
      return next(new ErrorHandler(404, 'Facility slots not found'));
    }

    const { dayStartTime, dayEndTime, isTimeFlexible, maintenance, academyTime } = result;

    if (!dayStartTime || !dayEndTime) {
      return next(new ErrorHandler(404, 'Facility timings not found'));
    }
    const hasIntervals = maintenance || academyTime;
    const facilitySlots = facilityAvailability.slots || [];

    let facilityAvailabilityData: any;

    if (isTimeFlexible) {
      // Ensure no _id is present in the incoming slots
      const hasInvalidSlot = slots.some((slot: any) => slot._id);
      if (hasInvalidSlot) {
        return next(
          new ErrorHandler(404, 'facility has flexible time, cannot update existing slots'),
        );
      }

      // CASE I- If isTimeFlexible is TRUE and any of the intervalTypes is TRUE
      if (hasIntervals) {
        const { intervalTypes } = result;
        if (!intervalTypes || !Array.isArray(intervalTypes) || intervalTypes.length === 0) {
          throw new ErrorHandler(
            400,
            'Intervals are required for a facility with maintenance or academy time',
          );
        }
        // Validate intervalTypes
        const { isValid, message } = validateSlotAgainstIntervals(slots, intervalTypes);
        if (!isValid) {
          let errorMessage: string =
            message || 'slot timings are not under facility bookable hours';
          return next(new ErrorHandler(400, errorMessage));
        }
      }

      // CASE II- If isTimeFlexible is TRUE and NO intervalTypes is present
      // Validate slot timings
      const { isValid, message } = validateSlotTimings(
        slots,
        dayStartTime,
        dayEndTime,
        facilitySlots,
      );
      if (!isValid) {
        let errorMessage: string = message || 'slot timings are not under facility operating hours';
        return next(new ErrorHandler(400, errorMessage));
      }
      // create new slot
      facilityAvailabilityData = await createInternalFacilityAvailabilityRepo({
        facilityAvailabilityId,
        slots,
      });
      // console.log('facilityAvailabilityData-CREATE', facilityAvailabilityData);
    } else {
      // Ensure all slots have _id
      const missingId = slots.some((slot: any) => !slot._id);
      if (missingId) {
        return next(new ErrorHandler(404, 'slot Id is required for update'));
      }

      // CASE III- If isTimeFlexible is FALSE
      const existingSlots = slots
        .map((inputSlot: any) => {
          const found = facilityAvailability.slots.find(
            (existingSlot: any) => existingSlot._id.toString() === inputSlot._id?.toString(),
          );
          return found || null;
        })
        .filter(Boolean);
      console.log('existingSlots', existingSlots);
      if (existingSlots.length === 0) {
        return next(new ErrorHandler(404, 'No matching slots found for update'));
      }
      if (!existingSlots.every((slot: any) => slot.isAvailable)) {
        return next(
          new ErrorHandler(404, 'this slot(s) not available, please select available slot(s)'),
        );
      }
      // update existing slot
      facilityAvailabilityData = await updateInternalFacilityAvailabilityRepo({
        facilityAvailabilityId,
        slots,
      });
      // console.log('facilityAvailabilityData-UPDATE', facilityAvailabilityData);
    }

    // get merchant and location details
    const merchantData = await getInternalMerchantWithLocation(
      result.merchantUserId,
      result.locationId,
    );
    if (!merchantData) {
      return next(new ErrorHandler(404, 'Merchant or Location not found'));
    }
    let response = {
      facilityAvailability: facilityAvailabilityData,
      facility: result,
      merchantWithLocation: merchantData,
    };

    res.status(200).json({
      success: true,
      response: response,
    });
  } catch (error) {
    next(error);
  }
};
