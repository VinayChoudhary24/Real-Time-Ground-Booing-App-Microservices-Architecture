// Load the environment variables
import dotenv from 'dotenv';
// Load environment variables from .env
dotenv.config();

const name = process.env.NAME || 'mobileapi-gateway';
const port = process.env.PORT || 6088;
const host = process.env.HOST || 'localhost';
const userService = process.env.USER_URI || 'http://localhost:8004';
const merchantService = process.env.MERCHANT_URI || 'http://localhost:8001';
const facilitiesService = process.env.FACILITIES_URI || 'http://localhost:8002';
const bookingService = process.env.BOOKING_URI || 'http://localhost:8005';
const dashboardBaseURL = process.env.DASHBOARD_BASE_URL || 'http://localhost:3000';
const jwt_secret =
  process.env.JWT_Secret ||
  'mK&nWKX*Zy8=PePf2AC8jA5Y9HYf2xgJj!@kOPc8mdVru!V3GJAK9tMc!8e!NPHwpWzzr6y^Pzqv&R$37kuVh^Mc@JudrwW&-QT@=GSvfwQEArRfN&%hm+-5RHsx2^csar!%UwWBNygXezrWn8CbY4XNvX8!D6e6_W&CeBWF@==TMT_MsP#AsQb!KGG8tkbNAVVS!f_MG@mT4CRBEw+**bnu&Rzw7z!ba-CD=V7uMQ5$T6EJrPUV&HQY?rSP5YYH$';

const appConfig = {
  name: name,
  port: port,
  host: host,
  jwt_secret: jwt_secret,
  dashboardBaseURL: dashboardBaseURL,
  services: {
    user: userService,
    merchant: merchantService,
    facilities: facilitiesService,
    booking: bookingService,
  },
};

export { appConfig };
