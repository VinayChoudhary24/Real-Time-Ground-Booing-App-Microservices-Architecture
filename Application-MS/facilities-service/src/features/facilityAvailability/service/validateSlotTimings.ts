import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
dayjs.extend(customParseFormat);

interface ValidationResult {
  isValid: boolean;
  message?: string;
}

const normalizeMidnight = (time: string) => (time === '12:00 AM' ? '11:59 PM' : time);

export const validateSlotTimings = (
  slots: any[],
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

  // Normalize and sort new slots for internal overlap check
  const parsedNewSlots = slots
    .map((slot) => ({
      start: dayjs(slot.startTime, 'hh:mm A'),
      end: dayjs(normalizeMidnight(slot.endTime), 'hh:mm A'),
      label: `${slot.startTime} - ${slot.endTime}`,
    }))
    .sort((a, b) => a.start.diff(b.start));

  // Check new slots for internal validity and overlapping
  for (let i = 0; i < parsedNewSlots.length; i++) {
    const current: any = parsedNewSlots[i];

    if (!current.start.isBefore(current.end)) {
      return {
        isValid: false,
        message: `Slot start time ${current.label.split(' - ')[0]} must be before end time ${current.label.split(' - ')[1]}.`,
      };
    }

    if (current.start.isBefore(startOfDay) || current.end.isAfter(endOfDay)) {
      return {
        isValid: false,
        message: `Slot ${current.label} is outside facility hours (${dayStartTime} - ${dayEndTime}).`,
      };
    }

    // Check for overlap with previous new slot
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

  // Check each new slot against existing slots
  const parsedExistingSlots = (existingSlots || []).map((slot) => ({
    start: dayjs(slot.startTime, 'hh:mm A'),
    end: dayjs(normalizeMidnight(slot.endTime), 'hh:mm A'),
    label: `${slot.startTime} - ${slot.endTime}`,
  }));

  for (const newSlot of parsedNewSlots) {
    for (const existingSlot of parsedExistingSlots) {
      const isOverlap =
        newSlot.start.isBefore(existingSlot.end) && newSlot.end.isAfter(existingSlot.start);

      if (isOverlap) {
        return {
          isValid: false,
          message: `Slot ${newSlot.label} overlaps with existing slot ${existingSlot.label}.`,
        };
      }
    }
  }

  return { isValid: true };
};
