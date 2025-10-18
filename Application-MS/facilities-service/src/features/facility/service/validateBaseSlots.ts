import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);

interface ValidationResult {
  isValid: boolean;
  message?: string;
}

const normalizeMidnight = (time: string) => (time === '12:00 AM' ? '11:59 PM' : time);

export const validateBaseSlots = (
  baseSlots: any[],
  dayStartTime: string,
  dayEndTime: string,
  existingSlots: any[] = [],
): ValidationResult => {
  const startOfDay = dayjs(dayStartTime, 'hh:mm A');
  const endOfDay = dayjs(normalizeMidnight(dayEndTime), 'hh:mm A');

  if (!startOfDay.isBefore(endOfDay)) {
    return {
      isValid: false,
      message: `Facility start time ${dayStartTime} must be before end time ${dayEndTime}.`,
    };
  }

  const parsedNewSlots = baseSlots
    .map((slot) => ({
      start: dayjs(slot.startTime, 'hh:mm A'),
      end: dayjs(normalizeMidnight(slot.endTime), 'hh:mm A'),
      label: `${slot.startTime} - ${slot.endTime}`,
    }))
    .sort((a, b) => a.start.diff(b.start));

  for (let i = 0; i < parsedNewSlots.length; i++) {
    const current: any = parsedNewSlots[i];

    // Ensure start < end
    if (!current.start.isBefore(current.end)) {
      return {
        isValid: false,
        message: `Slot ${current.label} has invalid time range (start must be before end).`,
      };
    }

    // Ensure within facility hours
    if (current.start.isBefore(startOfDay) || current.end.isAfter(endOfDay)) {
      return {
        isValid: false,
        message: `Slot ${current.label} is outside facility operating hours (${dayStartTime} - ${dayEndTime}).`,
      };
    }

    // Check overlap with previous new slot
    if (i > 0) {
      const prev: any = parsedNewSlots[i - 1];
      if (current.start.isBefore(prev.end)) {
        return {
          isValid: false,
          message: `Slot ${current.label} overlaps with another slot (${prev.label}).`,
        };
      }
    }
  }

  return { isValid: true };
};
