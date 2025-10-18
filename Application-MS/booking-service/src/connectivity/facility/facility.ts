import facilityApi from '../../services/facility-api/facility.api';
import { ErrorHandler } from '../../utils/errors/errorHandler.util';

export const getBookingDetails = async (facilityAvailabilityId: string, slots: any) => {
  try {
    // add slots to the request query if needed
    const queryParams = slots ? { slots: JSON.stringify(slots) } : {};
    const response = await facilityApi.get(`/internal/facility/${facilityAvailabilityId}`, {
      params: queryParams,
    });
    return response.data?.response || null;
  } catch (error: any) {
    throw new ErrorHandler(400, error?.response?.data?.message || 'Failed to fetch facility data');
  }
};
