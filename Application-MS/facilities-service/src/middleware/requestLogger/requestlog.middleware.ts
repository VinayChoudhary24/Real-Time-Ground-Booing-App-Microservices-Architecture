//TODO: If Logging of Request is Required we can Enable this Middleware to log Every Request that comes to Merchant-service
// import { requestLogger } from "../../utils/logs/logger.util";
// import { Request, Response, NextFunction } from "express";

// // Middleware to log requests
// export const requestLoggingMiddleware = (req: Request, res: Response, next: NextFunction) => {
//   const logMessage = `Request | Method: ${req.method} | URL: ${req.originalUrl} | IP: ${req.ip}`;
//   requestLogger.info(logMessage); // log to MongoDB
//   next();
// };
