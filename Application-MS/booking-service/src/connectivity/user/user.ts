import userApi from '../../services/user-api/user.api';
import { ErrorHandler } from '../../utils/errors/errorHandler.util';

export const getUserDetails = async (userId: string) => {
  try {
    const response = await userApi.get(`/internal/user/${userId}`);
    return response.data?.response || null;
  } catch (error: any) {
    throw new ErrorHandler(400, error?.response?.data?.message || 'Failed to fetch user data');
  }
};
