import axios from 'axios';
import { appConfig } from '../../config/appConfig/app.config';

// Create Axios instance with default config
const merchantApi = axios.create({
  baseURL: appConfig.services.merchant,
  timeout: 5000, // 5s timeout
  headers: {
    'Content-Type': 'application/json',
    'x-internal-token': appConfig.facilityMerchantSecret || process.env.FACILITY_MERCHANT_SECRET,
  },
});

// Optional: Response interceptor for centralized logging/error handling
merchantApi.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('[MerchantService Error]', {
      url: error.config?.url,
      message: error.message,
      data: error.response?.data,
    });
    return Promise.reject(error);
  },
);

export default merchantApi;
