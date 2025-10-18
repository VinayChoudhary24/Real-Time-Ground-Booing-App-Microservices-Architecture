import { Types } from 'mongoose';
import { errorLogger } from '../../../utils/logs/logger.util';
import FacilitySchemaModel from '../../facility/models/facility.schema';
import FacilityAvailabilityModel from '../../facilityAvailability/models/facilityAvailability.schema';

export const removeDiscountFromFacility = async (
  discountId: Types.ObjectId,
  facilityId: Types.ObjectId,
) => {
  try {
    await FacilitySchemaModel.updateOne(
      {
        _id: facilityId,
        discountId: discountId,
      },
      {
        $unset: { discountId: '' },
      },
    );
  } catch (err) {
    errorLogger.error(`[Discount:${discountId}] Failed to remove discount from facility:`, err);
    throw err;
  }
};

export const removeDiscountFromAvailability = async (
  discountId: Types.ObjectId,
  applicableDatesAndSlots: {
    facilityAvailabilityId: Types.ObjectId;
    slotIds?: Types.ObjectId[];
  }[],
) => {
  try {
    const bulkOps = await Promise.all(
      applicableDatesAndSlots.map(async ({ facilityAvailabilityId, slotIds = [] }) => {
        const availabilityDoc = await FacilityAvailabilityModel.findById(facilityAvailabilityId);
        if (!availabilityDoc) return null;

        const update: any = {};

        // Remove from global discount field if it matches
        if (availabilityDoc.discountId?.toString() === discountId.toString()) {
          update.discountId = null;
        }

        // Remove from slot-specific discounts
        if (Array.isArray(slotIds) && slotIds.length > 0) {
          const slotIdSet = new Set(slotIds.map((id) => id.toString()));
          const updatedSlots = availabilityDoc.slots.map((slot: any) => {
            const slotIdStr = slot._id.toString();
            if (slotIdSet.has(slotIdStr)) {
              const filteredDiscounts = (slot.applicableDiscountIds || []).filter(
                (id: any) => id.toString() !== discountId.toString(),
              );
              return {
                ...slot.toObject(),
                applicableDiscountIds: filteredDiscounts,
              };
            }
            return slot;
          });

          update.slots = updatedSlots;
        }

        return {
          updateOne: {
            filter: { _id: facilityAvailabilityId },
            update: { $set: update },
          },
        };
      }),
    );

    const filteredOps = bulkOps.filter((op) => op !== null);
    if (filteredOps.length > 0) {
      const result = await FacilityAvailabilityModel.bulkWrite(filteredOps, { ordered: false });
      // console.log('REMOVE result', result);
    }
  } catch (err) {
    errorLogger.error(`[Discount:${discountId}] Failed to remove from facility availability:`, err);
    throw err;
  }
};
