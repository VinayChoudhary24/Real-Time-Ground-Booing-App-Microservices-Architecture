import axios from 'axios';
import { appConfig } from '../../config/appConfig';

// Create Axios instance with default config
const userApi = axios.create({
  baseURL: appConfig.services.user,
  timeout: 5000, // 5s timeout
  headers: {
    'Content-Type': 'application/json',
    'x-internal-token': appConfig.bookingUserSecret || process.env.BOOKING_USER_SECRET,
  },
});

// Optional: Response interceptor for centralized logging/error handling
userApi.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('[UserService Error]', {
      url: error.config?.url,
      message: error.message,
      data: error.response?.data,
    });
    return Promise.reject(error);
  },
);

export default userApi;
