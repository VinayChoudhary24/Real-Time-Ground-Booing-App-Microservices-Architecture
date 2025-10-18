import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);

export interface ValidationResult {
  isValid: boolean;
  message?: string;
}

const normalizeMidnight = (time: string) => (time === '12:00 AM' ? '11:59 PM' : time);

/**
 * Validates a slot against the facility's operational hours and existing slots.
 * - Ensures within facility hours
 * - Ensures no overlap with other slots (excluding itself)
 */
export const validateSlotAgainstAvailability = (
  slotToValidate: any,
  existingSlots: any[],
  dayStartTime: string,
  dayEndTime: string,
): ValidationResult => {
  const startOfDay = dayjs(dayStartTime, 'hh:mm A');
  const endOfDay = dayjs(normalizeMidnight(dayEndTime), 'hh:mm A');

  const slotStart = dayjs(slotToValidate.startTime, 'hh:mm A');
  const slotEnd = dayjs(normalizeMidnight(slotToValidate.endTime), 'hh:mm A');
  const label = `${slotToValidate.startTime} - ${slotToValidate.endTime}`;

  if (!slotStart.isBefore(slotEnd)) {
    return {
      isValid: false,
      message: `Slot start time must be before end time (${label}).`,
    };
  }

  if (slotStart.isBefore(startOfDay) || slotEnd.isAfter(endOfDay)) {
    return {
      isValid: false,
      message: `Slot ${label} is outside facility hours (${dayStartTime} - ${dayEndTime}).`,
    };
  }

  for (const other of existingSlots) {
    if (other._id && slotToValidate._id && other._id === slotToValidate._id) {
      continue; // skip self
    }

    const otherStart = dayjs(other.startTime, 'hh:mm A');
    const otherEnd = dayjs(normalizeMidnight(other.endTime), 'hh:mm A');

    const isOverlap = slotStart.isBefore(otherEnd) && slotEnd.isAfter(otherStart);

    if (isOverlap) {
      return {
        isValid: false,
        message: `Slot ${label} overlaps with existing slot (${other.startTime} - ${other.endTime}).`,
      };
    }
  }

  return { isValid: true };
};
