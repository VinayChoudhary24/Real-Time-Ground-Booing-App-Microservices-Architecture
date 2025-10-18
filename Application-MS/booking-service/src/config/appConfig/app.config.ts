// Load the environment variables
import dotenv from 'dotenv';
// Load environment variables from .env
dotenv.config();

const name = process.env.NAME || 'booking-service';
const port = process.env.PORT || 8005;
const host = process.env.HOST || 'localhost';
const mongoURI = process.env.mongoURI;
const bookingUserSecret = process.env.BOOKING_USER_SECRET;
const bookingFacilitySecret = process.env.BOOKING_FACILITY_SECRET;

const merchantService = process.env.MERCHANT_URI || 'http://localhost:8001';
const userService = process.env.USER_URI || 'http://localhost:8004';
const facilityService = process.env.FACILITY_URI || 'http://localhost:8002';
// const dashboardBaseURL = process.env.DASHBOARD_BASE_URL || 'http://localhost:3000';

const appConfig = {
  name: name,
  port: port,
  host: host,
  mongoURI: mongoURI,
  bookingUserSecret: bookingUserSecret,
  bookingFacilitySecret: bookingFacilitySecret,
  //   dashboardBaseURL: dashboardBaseURL,
  services: {
    // Other Micro-services
    merchant: merchantService,
    user: userService,
    facility: facilityService,
  },
};

export { appConfig };
