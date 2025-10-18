import merchantApi from '../../services/merchant-api/merchant.api';
import { ErrorHandler } from '../../utils/errors/errorHandler.util';

// Fetch merchant details along with all locations
export const getMerchantDetailsWithLocations = async (merchantUserId: string) => {
  try {
    const response = await merchantApi.get(`/internal/merchant/${merchantUserId}`);
    return response.data?.response || null;
  } catch (error: any) {
    throw new ErrorHandler(400, error?.response?.data?.message || 'Failed to fetch merchant data');
  }
};

// Fetch merchant details with specific location details
export const getInternalMerchantWithLocation = async (
  merchantUserId: string,
  locationId: string,
) => {
  try {
    const response = await merchantApi.get(
      `/internal/merchant/${merchantUserId}/location/${locationId}`,
    );
    return response.data?.response || null;
  } catch (error: any) {
    throw new ErrorHandler(
      400,
      error?.response?.data?.message || 'Failed to fetch merchant location data',
    );
  }
};
