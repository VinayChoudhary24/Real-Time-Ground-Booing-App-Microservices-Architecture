// Load the environment variables
import dotenv from 'dotenv';
// Load environment variables from .env
dotenv.config();

const name = process.env.NAME || 'merchant-service';
const port = process.env.PORT || 8001;
const host = process.env.HOST || 'localhost';
const mongoURI = process.env.mongoURI;
const jwt_secret =
  process.env.JWT_Secret ||
  'mK&nWKX*Zy8=PePf2AC8jA5Y9HYf2xgJj!@kLac8mdVru!V3GJAK9tMa!8e!NPHwpWzzr6y^Pzqv&R$37kuVh^Mc@JudrwW&-QT@=GSvfwQEArRfN&%hm+-5RHsx2^csar!%UwWBNygXezrWn8CbY4XNvX9!D6e6_W&CeBWF@==TPT_MsP#AsQb!KqG8tkbNFVVS!f_MG@mM4CRB3w+*ebnu&Rzf7z!bttCD=V7uMQ5$T6EJrPUV&HQW?rSP5HH$';
const cookieExpiresIN = process.env.COOKIE_EXPIRES_IN || 2;
const smtp_service = process.env.SMPT_SERVICE || 'fix SMTP Service';
const defi_smtp_mail = process.env.DEFI_SMPT_MAIL || 'fix DEFI SMTP Mail';
const defi_smtp_mail_pass = process.env.DEFI_SMPT_MAIL_PASSWORD || 'fix DEFI SMTP mail password';
// const merchantService = process.env.MERCHANT_URI || 'http://localhost:8001';
const dashboardBaseURL = process.env.DASHBOARD_BASE_URL || 'http://localhost:5173';
const facilityMerchantSecret = process.env.FACILITY_MERCHANT_SECRET;

// GOOGLE LOGIN CRED
const googleClientId = process.env.GOOGLE_CLIENT_ID || 'fix-google-client-id';
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET || 'fix-google-client-secret';
const googleRedirectUri = process.env.GOOGLE_REDIRECT_URI || 'fix-redirect-uri';

// SMS CRED
const fast2SmsApiKey = process.env.FAST2SMS_API_KEY || 'fix fast2SMS api key';
const fast2SmsUrl = process.env.FAST2SMS_URL || 'fix fast2SMS url';

const appConfig = {
  name: name,
  port: port,
  host: host,
  mongoURI: mongoURI,
  jwt_secret: jwt_secret,
  cookieExpiresIN: cookieExpiresIN,
  smtp_service: smtp_service,
  defi_smtp_mail: defi_smtp_mail,
  defi_smtp_mail_pass: defi_smtp_mail_pass,
  facilityMerchantSecret: facilityMerchantSecret,
  dashboardBaseURL: dashboardBaseURL,
  //   services: {
  //    // Other Micro-services
  //   }
  googleClientId,
  googleClientSecret,
  googleRedirectUri,
  fast2SmsApiKey,
  fast2SmsUrl,
};

export { appConfig };
