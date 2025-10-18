import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);

interface ValidationResult {
  isValid: boolean;
  message?: string;
}

const normalizeMidnight = (time: string) => (time === '12:00 AM' ? '11:59 PM' : time);

export const validateIntervalTypes = (
  intervals: any[],
  dayStartTime: string,
  dayEndTime: string,
): ValidationResult => {
  const startOfDay = dayjs(dayStartTime, 'hh:mm A');
  const endOfDay = dayjs(normalizeMidnight(dayEndTime), 'hh:mm A');

  if (!startOfDay.isBefore(endOfDay)) {
    return {
      isValid: false,
      message: `Facility start time ${dayStartTime} must be before end time ${dayEndTime}.`,
    };
  }

  // Parse, normalize, and sort intervals
  const parsedIntervals = intervals
    .map((interval) => ({
      start: dayjs(interval.startTime, 'hh:mm A'),
      end: dayjs(normalizeMidnight(interval.endTime), 'hh:mm A'),
      label: `${interval.startTime} - ${interval.endTime}`,
    }))
    .sort((a, b) => a.start.diff(b.start));

  for (let i = 0; i < parsedIntervals.length; i++) {
    const current: any = parsedIntervals[i];

    // Validation: start < end
    if (!current.start.isBefore(current.end)) {
      return {
        isValid: false,
        message: `Interval ${current.label} has invalid time range (start must be before end).`,
      };
    }

    // Validation: must be within facility time
    if (current.start.isBefore(startOfDay) || current.end.isAfter(endOfDay)) {
      return {
        isValid: false,
        message: `Interval ${current.label} is outside facility operating hours (${dayStartTime} - ${dayEndTime}).`,
      };
    }

    // Overlap check with previous
    if (i > 0) {
      const prev: any = parsedIntervals[i - 1];
      if (current.start.isBefore(prev.end)) {
        return {
          isValid: false,
          message: `Interval ${current.label} overlaps with another interval (${prev.label}).`,
        };
      }
    }
  }

  return { isValid: true };
};
