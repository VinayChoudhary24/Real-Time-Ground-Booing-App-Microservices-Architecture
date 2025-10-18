import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat.js';
import weekday from 'dayjs/plugin/weekday.js';
import FacilityAvailabilityModel from '../../features/facilityAvailability/models/facilityAvailability.schema';

dayjs.extend(customParseFormat);
dayjs.extend(weekday);

interface Slot {
  startTime: string;
  endTime: string;
  price: number;
  isAvailable: boolean;
  type: number; // 1 for SLOT, 2 for MAINTENANCE
}

interface GenerateAvailabilityInput {
  facilityId: any;
  merchantUserId: string;
  locationId: string;
  baseSlots: Slot[];
  pricePerHour: Number;
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export async function generate45DayAvailability({
  facilityId,
  merchantUserId,
  locationId,
  baseSlots = [],
  pricePerHour = 0,
}: GenerateAvailabilityInput) {
  const today = dayjs();
  const availabilityData = [];

  // console.log('GENERATING-SCHEDULE');
  for (let i = 0; i < 45; i++) {
    const date = today.add(i, 'day');
    const weekday = DAYS[date.day()];

    // Deep copy to avoid reference issues across days
    const slotsForDay = baseSlots.map((slot) => {
      if (slot.type === 2 || slot.type === 3) {
        // Maintenance slot
        return {
          startTime: slot.startTime,
          endTime: slot.endTime,
          price: 0,
          isAvailable: false,
          type: slot.type,
        };
      } else {
        // Regular slot
        return {
          startTime: slot.startTime,
          endTime: slot.endTime,
          price: slot.price,
          isAvailable: slot.isAvailable ?? true,
          type: 1,
        };
      }
    });

    availabilityData.push({
      facilityId,
      merchantUserId: merchantUserId,
      locationId: locationId,
      date: date.unix(),
      day: weekday,
      pricePerHour: pricePerHour,
      slots: slotsForDay,
    });
  }

  await FacilityAvailabilityModel.insertMany(availabilityData);
  // return data;
}
