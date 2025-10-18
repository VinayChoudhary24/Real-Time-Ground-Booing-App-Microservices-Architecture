import axios from 'axios';
import { appConfig } from '../../config/appConfig';

// Create Axios instance with default config
const facilityApi = axios.create({
  baseURL: appConfig.services.facility,
  timeout: 5000, // 5s timeout
  headers: {
    'Content-Type': 'application/json',
    'x-internal-token': appConfig.bookingFacilitySecret || process.env.BOOKING_FACILITY_SECRET,
  },
});

// Optional: Response interceptor for centralized logging/error handling
facilityApi.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('[FacilityService Error]', {
      url: error.config?.url,
      message: error.message,
      data: error.response?.data,
    });
    return Promise.reject(error);
  },
);

export default facilityApi;
