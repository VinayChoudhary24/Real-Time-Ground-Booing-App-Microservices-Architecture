import { Types } from 'mongoose';
import { errorLogger } from '../../../utils/logs/logger.util';
import FacilitySchemaModel from '../../facility/models/facility.schema';
import FacilityAvailabilityModel from '../../facilityAvailability/models/facilityAvailability.schema';

interface FacilityDiscountData {
  _id: Types.ObjectId;
  facilityId: Types.ObjectId;
  merchantUserId: Types.ObjectId;
  locationId: Types.ObjectId;
  name: string;
}

export const applyDiscountToFacility = async (discount: FacilityDiscountData) => {
  const { _id: discountId, facilityId, merchantUserId, locationId, name } = discount;

  try {
    await FacilitySchemaModel.updateOne(
      {
        _id: facilityId,
        merchantUserId: merchantUserId,
        locationId: locationId,
      },
      {
        $set: { discountId: discountId },
      },
    );
    // console.log('result', result);
  } catch (err) {
    errorLogger.error(`[Discount:${name}] Failed to apply discount to facilities:`, err);
    throw err;
  }
};

interface AvailabilityDiscountData {
  _id: Types.ObjectId;
  applicableDatesAndSlots: {
    facilityAvailabilityId: Types.ObjectId;
    slotIds?: Types.ObjectId[]; // Optional: apply discount to specific slots
  }[];
}

export const applyDiscountToAvailability = async (discount: AvailabilityDiscountData) => {
  const { _id: discountId, applicableDatesAndSlots = [] } = discount;

  try {
    const bulkOps = await Promise.all(
      applicableDatesAndSlots.map(async ({ facilityAvailabilityId, slotIds = [] }) => {
        const availabilityDoc = await FacilityAvailabilityModel.findById(facilityAvailabilityId);

        if (!availabilityDoc) return null;

        // Apply discountId to document-level field
        const update: any = {
          discountId: discountId,
        };

        // Apply slot-level discounts if slotIds are provided
        if (Array.isArray(slotIds) && slotIds.length > 0) {
          const slotIdSet = new Set(slotIds.map((id) => id.toString()));

          const updatedSlots = availabilityDoc.slots.map((slot: any) => {
            const slotIdStr = slot._id.toString();
            if (slotIdSet.has(slotIdStr)) {
              const discountSet = new Set(
                (slot.applicableDiscountIds || []).map((id: any) => id.toString()),
              );
              if (!discountSet.has(discountId.toString())) {
                return {
                  ...slot.toObject(),
                  applicableDiscountIds: [...discountSet, discountId],
                };
              }
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

    // Filter out any nulls (invalid facilityAvailabilityIds)
    const filteredOps = bulkOps.filter((op) => op !== null);

    if (filteredOps.length > 0) {
      const result = await FacilityAvailabilityModel.bulkWrite(filteredOps, { ordered: false });
      // console.log('result-DISCOUNT', result);
    }
  } catch (err) {
    errorLogger.error(`[Discount:${discountId}] Failed to apply to facility availability:`, err);
    throw err;
  }
};
