import mongoose from 'mongoose';
import FacilityAvailabilityModel from '../models/facilityAvailability.schema';
import { ErrorHandler } from '../../../utils/errors/errorHandler.util';

interface Slot {
  startTime: string;
  endTime: string;
  price?: number;
  isAvailable?: boolean;
  type: number;
  // applicableDiscountIds?: string[];
}

interface AvailabilityInput {
  facilityId: string;
  merchantUserId: string;
  locationId: string;
  date: number;
  day: string;
  isActive: boolean;
  pricePerHour?: number;
  // discountId?: string;
  slots: Slot[];
}

export const createFacilityAvailabilityRepo = async (data: AvailabilityInput) => {
  try {
    const {
      facilityId,
      merchantUserId,
      locationId,
      date,
      day,
      isActive,
      pricePerHour = 0,
      slots = [],
    } = data;

    const availability = await FacilityAvailabilityModel.create({
      facilityId,
      merchantUserId,
      locationId,
      date,
      day,
      isActive,
      pricePerHour,
      slots,
    });

    return availability;
  } catch (error: any) {
    if (error instanceof mongoose.Error || error instanceof ErrorHandler) {
      throw error;
    }
    throw new ErrorHandler(500, 'Failed to create facility availability.');
  }
};

export const getFacilityAvailabilityRepo = async (
  facilityId: string,
  merchantUserId: string,
  locationId: string,
  startDate: number,
  endDate: number,
) => {
  try {
    const result = await FacilityAvailabilityModel.find({
      facilityId,
      merchantUserId,
      locationId,
      date: {
        $gte: startDate,
        $lte: endDate,
      },
    })
      .sort({ date: 1 }) // Sort ascending by date
      .lean();

    return result;
  } catch (error) {
    if (error instanceof mongoose.Error || error instanceof ErrorHandler) {
      throw error;
    } else {
      throw new ErrorHandler(500, 'Failed to fetch facility availability.');
    }
  }
};

export const updateFacilityAvailabilityRepo = async (
  facilityAvailabilityId: string,
  facilityId: string,
  merchantUserId: string,
  updateData: any,
) => {
  try {
    const updatedDoc = await FacilityAvailabilityModel.findOneAndUpdate(
      {
        _id: facilityAvailabilityId,
        facilityId,
        merchantUserId,
        locationId: updateData.locationId,
      },
      { $set: updateData },
      {
        new: true,
        runValidators: true,
        lean: true,
      },
    );

    if (!updatedDoc) {
      throw new ErrorHandler(404, 'Schedule not found');
    }

    return updatedDoc;
  } catch (error) {
    if (error instanceof mongoose.Error || error instanceof ErrorHandler) {
      throw error;
    } else {
      throw new ErrorHandler(500, 'Failed to update facility schedule.');
    }
  }
};
// export const updateFacilityAvailabilityRepo = async (
//   facilityAvailabilityId: string,
//   facilityId: string,
//   merchantUserId: string,
//   updateData: any,
// ) => {
//   try {
//     const updateQuery: any = { $set: {} };
//     // const updateFields = { ...updateData }; // destructure updateData for processing

//     const topLevelFields = ['pricePerHour', 'isActive'];

//     for (const key of topLevelFields) {
//       if (updateData[key] !== undefined) {
//         updateQuery[`$set`] = updateQuery[`$set`] || {};
//         updateQuery[`$set`][key] = updateData[key];
//       }
//     }

//     if (Array.isArray(updateData.slots) && updateData.slots.length > 0) {
//       const updatedSlot = updateData.slots[0];
//       const slotId = updatedSlot._id;

//       if (!slotId || !mongoose.Types.ObjectId.isValid(slotId)) {
//         throw new ErrorHandler(400, 'Invalid or missing slot _id');
//       }

//       // Dynamically build dot notation path for the slot to update
//       for (const field in updatedSlot) {
//         if (field !== '_id') {
//           updateQuery['$set'] = updateQuery['$set'] || {};
//           updateQuery['$set'][`slots.$[elem].${field}`] = updatedSlot[field];
//         }
//       }

//       // Add array filter to match the slot by _id
//       updateQuery['arrayFilters'] = [{ 'elem._id': new mongoose.Types.ObjectId(slotId) }];
//     }

//     // Always update updatedAt
//     updateQuery['$set'] = updateQuery['$set'] || {};
//     // updateQuery['$set'].updatedAt = dayjs().unix();

//     const result = await FacilityAvailabilityModel.findOneAndUpdate(
//       {
//         _id: facilityAvailabilityId,
//         facilityId,
//         merchantUserId,
//         locationId: updateData.locationId,
//       },
//       updateQuery,
//       {
//         new: true,
//         runValidators: true,
//         arrayFilters: updateQuery.arrayFilters || [],
//         lean: true,
//       },
//     );

//     if (!result) {
//       throw new ErrorHandler(404, 'Schedule not found');
//     }

//     return result;
//   } catch (error) {
//     if (error instanceof mongoose.Error || error instanceof ErrorHandler) {
//       throw error;
//     } else {
//       throw new ErrorHandler(500, 'Failed to update facility schedule.');
//     }
//   }
// };

export const deleteFacilityAvailabilityRepo = async (
  merchantUserId: string,
  locationId: string,
  facilityId: string,
  facilityAvailabilityId: string,
  slotId: string,
) => {
  try {
    const deleted = await FacilityAvailabilityModel.findOneAndUpdate(
      {
        _id: facilityAvailabilityId,
        facilityId,
        merchantUserId,
        locationId,
        'slots._id': slotId,
      },
      {
        $pull: {
          slots: { _id: slotId },
        },
      },
      {
        new: true,
        runValidators: false,
        lean: true,
      },
    );

    if (!deleted) {
      throw new ErrorHandler(400, 'Slot not found or already deleted');
    }

    return deleted;
  } catch (error) {
    if (error instanceof mongoose.Error || error instanceof ErrorHandler) {
      throw error;
    } else {
      throw new ErrorHandler(500, 'Error deleting facility slot');
    }
  }
};

export const getFacilityAvailabilityDetailsRepo = async (facilityAvailabilityId: string) => {
  try {
    const result = await FacilityAvailabilityModel.findById(facilityAvailabilityId).lean();
    return result;
  } catch (error) {
    if (error instanceof mongoose.Error || error instanceof ErrorHandler) {
      throw error;
    } else {
      throw new ErrorHandler(500, 'Error fetching facility availability details.');
    }
  }
};

export const getInternalFacilityAvailabilityDetailsRepo = async (
  facilityAvailabilityId: string,
) => {
  try {
    const result = await FacilityAvailabilityModel.findById(facilityAvailabilityId).lean();
    return result;
  } catch (error) {
    if (error instanceof mongoose.Error || error instanceof ErrorHandler) {
      throw error;
    } else {
      throw new ErrorHandler(500, 'Error fetching internal facility availability details.');
    }
  }
};

export const createInternalFacilityAvailabilityRepo = async ({
  facilityAvailabilityId,
  slots,
}: {
  facilityAvailabilityId: string;
  slots: any[];
}) => {
  try {
    const slotsWithIds = slots.map((slot) => ({
      ...slot,
      _id: new mongoose.Types.ObjectId(),
    }));

    const result = await FacilityAvailabilityModel.findByIdAndUpdate(
      facilityAvailabilityId,
      {
        $push: {
          slots: { $each: slotsWithIds },
        },
      },
      {
        new: true,
        runValidators: true,
        lean: true,
      },
    );

    if (!result) {
      throw new ErrorHandler(404, 'Facility availability not found');
    }

    return {
      ...result,
      slots: slotsWithIds,
    };
  } catch (error: any) {
    if (error instanceof mongoose.Error || error instanceof ErrorHandler) {
      throw error;
    }
    throw new ErrorHandler(500, 'Error creating internal facility availability.');
  }
};

export const updateInternalFacilityAvailabilityRepo = async ({
  facilityAvailabilityId,
  slots,
}: {
  facilityAvailabilityId: string;
  slots: any[];
}) => {
  try {
    if (!slots || slots.length === 0) {
      throw new ErrorHandler(400, 'Slots array is required and cannot be empty');
    }
    // Extract slot IDs for filtering (before validation to avoid processing if invalid)
    const updatedSlotIds = slots.map((slot) => {
      if (!slot._id) {
        throw new ErrorHandler(400, 'Slot _id is required for update');
      }
      return slot._id.toString();
    });

    const arrayFilters = slots.map((slot, index) => ({
      [`slot${index}._id`]: new mongoose.Types.ObjectId(slot._id),
    }));

    const updateQuery: any = { $set: {} };
    // Build dynamic update query for each slot
    slots.forEach((slot, index) => {
      // updateQuery.$set[`slots.$[slot${index}].startTime`] = slot.startTime;
      // updateQuery.$set[`slots.$[slot${index}].endTime`] = slot.endTime;
      updateQuery.$set[`slots.$[slot${index}].price`] = slot.price;
      updateQuery.$set[`slots.$[slot${index}].isAvailable`] = slot.isAvailable;
      // updateQuery.$set[`slots.$[slot${index}].updatedAt`] = new Date(); // Audit trail
    });
    // Single atomic operation - more efficient than bulkWrite for this use case
    const updatedDoc = await FacilityAvailabilityModel.findOneAndUpdate(
      { _id: facilityAvailabilityId },
      updateQuery,
      {
        new: true,
        runValidators: true,
        arrayFilters,
        lean: true, // Better performance when we don't need mongoose methods
      },
    );
    if (!updatedDoc) {
      throw new ErrorHandler(404, 'Facility availability document not found');
    }
    // console.log('Updated document:', updatedDoc);
    // Filter only the updated slots using the IDs we collected earlier
    const updatedSlots = updatedDoc.slots.filter((slot: any) =>
      updatedSlotIds.includes(slot._id.toString()),
    );
    // Verify all requested slots were found and updated
    if (updatedSlots.length !== slots.length) {
      throw new ErrorHandler(
        404,
        `Not all requested slots were found. Please check the provided slot IDs.`,
      );
    }
    return {
      ...updatedDoc,
      slots: updatedSlots,
    };
  } catch (error: any) {
    if (error instanceof mongoose.Error || error instanceof ErrorHandler) {
      throw error;
    }
    throw new ErrorHandler(500, 'Error updating internal facility availability.');
  }
};
