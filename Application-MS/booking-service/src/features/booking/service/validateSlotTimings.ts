import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
dayjs.extend(customParseFormat);

interface ValidationResult {
  isValid: boolean;
  message?: string;
}

const normalizeMidnight = (time: string) => (time === '12:00 AM' ? '11:59 PM' : time);

export const validateSlotTimings = (
  slots: any,
  dayStartTime: string,
  dayEndTime: string,
): ValidationResult => {
  const startOfDay = dayjs(dayStartTime, 'hh:mm A');
  // const endOfDay = dayjs(dayEndTime, 'hh:mm A');
  const endOfDay = dayjs(normalizeMidnight(dayEndTime), 'hh:mm A');

  if (!startOfDay.isBefore(endOfDay)) {
    return {
      isValid: false,
      message: `Facility start time ${dayStartTime} must be before end time ${dayEndTime}.`,
    };
  }

  for (const slot of slots) {
    const slotStart = dayjs(slot.startTime, 'hh:mm A');
    // const slotEnd = dayjs(slot.endTime, 'hh:mm A');
    const slotEnd = dayjs(normalizeMidnight(slot.endTime), 'hh:mm A');

    if (!slotStart.isBefore(slotEnd)) {
      return {
        isValid: false,
        message: `Slot start time ${slot.startTime} must be before end time ${slot.endTime}.`,
      };
    }

    // Check if slot is within the day boundary
    if (slotStart.isBefore(startOfDay) || slotEnd.isAfter(endOfDay)) {
      return {
        isValid: false,
        message: `Slot from ${slot.startTime} to ${slot.endTime} is outside facility hours (${dayStartTime} - ${dayEndTime}).`,
      };
    }
  }

  return { isValid: true };
};
