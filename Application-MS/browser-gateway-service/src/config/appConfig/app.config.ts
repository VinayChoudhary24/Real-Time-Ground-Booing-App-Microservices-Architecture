// Load the environment variables
import dotenv from 'dotenv';
// Load environment variables from .env
dotenv.config();

const name = process.env.NAME || 'browserapi-gateway';
const port = process.env.PORT || 6069;
const host = process.env.HOST || 'localhost';
const merchantService = process.env.MERCHANT_URI || 'http://localhost:8001';
const facilitiesService = process.env.FACILITIES_URI || 'http://localhost:8002';

const dashboardBaseURL = process.env.DASHBOARD_BASE_URL || 'http://localhost:3000';
const jwt_secret =
  process.env.JWT_Secret ||
  'mK&nWKX*Zy8=PePf2AC8jA5Y9HYf2xgJj!@kLac8mdVru!V3GJAK9tMa!8e!NPHwpWzzr6y^Pzqv&R$37kuVh^Mc@JudrwW&-QT@=GSvfwQEArRfN&%hm+-5RHsx2^csar!%UwWBNygXezrWn8CbY4XNvX9!D6e6_W&CeBWF@==TPT_MsP#AsQb!KqG8tkbNFVVS!f_MG@mM4CRB3w+*ebnu&Rzf7z!bttCD=V7uMQ5$T6EJrPUV&HQW?rSP5HH$';

const appConfig = {
  name: name,
  port: port,
  host: host,
  jwt_secret: jwt_secret,
  dashboardBaseURL: dashboardBaseURL,
  services: {
    merchant: merchantService,
    facilities: facilitiesService,
  },
};

export { appConfig };
