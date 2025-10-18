// import merchantApi from '../../services/merchant-api/merchant.api';
// import { ErrorHandler } from '../../utils/errors/errorHandler.util';

// export const getMerchantDetailsWithLocations = async (merchantUserId: string) => {
//   try {
//     const response = await merchantApi.get(`/internal/merchant/${merchantUserId}`);
//     return response.data?.response || null;
//   } catch (error: any) {
//     throw new ErrorHandler(400, error?.response?.data?.message || 'Failed to fetch merchant data');
//   }
// };
