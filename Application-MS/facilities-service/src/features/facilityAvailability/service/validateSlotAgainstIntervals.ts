import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
dayjs.extend(customParseFormat);

interface ValidationResult {
  isValid: boolean;
  message?: string;
}

const normalizeMidnight = (time: string) => (time === '12:00 AM' ? '11:59 PM' : time);

export const validateSlotAgainstIntervals = (
  slots: any[],
  intervalTypes: any[] = [],
): ValidationResult => {
  const parsedIntervals = intervalTypes.map((interval) => ({
    start: dayjs(interval.startTime, 'hh:mm A'),
    end: dayjs(normalizeMidnight(interval.endTime), 'hh:mm A'),
    label: `${interval.startTime} - ${interval.endTime}`,
    isBookable: interval.isBookable,
  }));

  const parsedSlots = slots.map((slot) => ({
    start: dayjs(slot.startTime, 'hh:mm A'),
    end: dayjs(normalizeMidnight(slot.endTime), 'hh:mm A'),
    label: `${slot.startTime} - ${slot.endTime}`,
  }));

  for (const newSlot of parsedSlots) {
    // STEP 1: Check against non-bookable
    for (const interval of parsedIntervals) {
      if (!interval.isBookable) {
        const overlapsNonBookable =
          newSlot.start.isBefore(interval.end) && newSlot.end.isAfter(interval.start);
        if (overlapsNonBookable) {
          return {
            isValid: false,
            message: `Slot ${newSlot.label} is non-bookable.`,
          };
        }
      }
    }

    // STEP 2: Must be inside a bookable interval
    const isInsideBookable = parsedIntervals.some(
      (interval) =>
        interval.isBookable &&
        !newSlot.start.isBefore(interval.start) &&
        !newSlot.end.isAfter(interval.end),
    );

    if (!isInsideBookable) {
      return {
        isValid: false,
        message: `Slot ${newSlot.label} is not within any bookable timings.`,
      };
    }
  }

  return { isValid: true };
};
