// Load the environment variables
import dotenv from 'dotenv';
// Load environment variables from .env
dotenv.config();

const name = process.env.NAME || 'facilities-service';
const port = process.env.PORT || 8002;
const host = process.env.HOST || 'localhost';
const mongoURI = process.env.mongoURI;
const merchantService = process.env.MERCHANT_URI || 'http://localhost:8001';

const facilityMerchantSecret = process.env.FACILITY_MERCHANT_SECRET;
const bookingFacilitySecret = process.env.BOOKING_FACILITY_SECRET;
// const dashboardBaseURL = process.env.DASHBOARD_BASE_URL || 'http://localhost:3000';

const appConfig = {
  name: name,
  port: port,
  host: host,
  mongoURI: mongoURI,
  facilityMerchantSecret: facilityMerchantSecret,
  bookingFacilitySecret: bookingFacilitySecret,
  //   dashboardBaseURL: dashboardBaseURL,
  services: {
    // Other Micro-services
    merchant: merchantService,
  },
};

export { appConfig };
