import { CorsOptions } from 'cors';

// //options for cors midddleware
// const corsOptions: CorsOptions = {
//   allowedHeaders: [
//     'Origin',
//     'X-Requested-With',
//     'Content-Type',
//     'Accept',
//     'Authorization',
//     'X-Access-Token',
//     'X-API-Key',
//     'Cache-Control',
//     'X-Forwarded-For',
//     'X-Real-IP',
//     'X-Client-IP',
//     'CF-Connecting-IP',
//     'True-Client-IP', 
//     'X-Forwarded-Proto',
//     'X-Forwarded-Host',
//     'User-Agent',
//     'Referer',
//     'x-app-ip', 
//     'x-app-location',
//   ],
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
//   credentials: true,
//   origin: ['http://localhost:6069', 'http://localhost:8001'],
//   preflightContinue: false,
//   optionsSuccessStatus: 200
// }
const corsOptions: CorsOptions = {
  origin: '*', // Allow all origins
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'], // Allow all HTTP methods
  allowedHeaders: ['*'], // Allow all headers
  exposedHeaders: ['*'], // Optional: expose all headers
  credentials: false, // Allow credentials (cookies, auth headers)
  preflightContinue: false,
  optionsSuccessStatus: 204, // Return 204 for preflight
};

export { corsOptions };