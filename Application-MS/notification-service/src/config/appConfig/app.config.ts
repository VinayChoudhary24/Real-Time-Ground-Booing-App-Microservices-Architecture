// Load the environment variables
import dotenv from 'dotenv';
// Load environment variables from .env
dotenv.config();

const name = process.env.NAME || 'notification-service';
const port = process.env.PORT || 8003;
const host = process.env.HOST || 'localhost';
const mongoURI = process.env.mongoURI;
const merchantService = process.env.MERCHANT_URI || 'http://localhost:8001';
// const dashboardBaseURL = process.env.DASHBOARD_BASE_URL || 'http://localhost:3000';

const appConfig = {
  name: name,
  port: port,
  host: host,
  mongoURI: mongoURI,
  //   dashboardBaseURL: dashboardBaseURL,
  services: {
    // Other Micro-services
    merchant: merchantService,
  },
};

export { appConfig };
