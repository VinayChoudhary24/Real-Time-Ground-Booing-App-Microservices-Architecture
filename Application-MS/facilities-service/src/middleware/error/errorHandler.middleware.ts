import mongoose from 'mongoose';
import { ErrorHandler } from '../../utils/errors/errorHandler.util';
import { errorLogger } from '../../utils/logs/logger.util';
import { Request, Response, NextFunction } from 'express';

export const errorHandlerMiddleware: any = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // if (!err) {
  //   return next();
  // }
  // console.error("Error-Middleware:req", req.method, req.originalUrl);
  const logMessage = `Error at ${req.method} - ${req.originalUrl} | Message: ${err.message}`;
  const merchantUserId = (req.headers['x-merchant-user-id'] as string) || 'unauthenticated';

  errorLogger.error(logMessage, {
    ...err,
    merchantUserId: merchantUserId,
  }); // Log to MongoDB
  // consoleLogger.error(logMessage.red.bold, err); // Log to console

  // Mongoose Validation Error
  if (err instanceof mongoose.Error.ValidationError) {
    // console.error("Mongoose-Validation Error11111:", err);
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  // Mongoose CastError (e.g., invalid ObjectId)
  if (err instanceof mongoose.Error.CastError) {
    // console.error("Mongoose-Cast Error:", err);
    return res.status(400).json({
      success: false,
      message: 'Invalid ID format',
    });
  }

  // Custom ErrorHandler
  if (err instanceof ErrorHandler) {
    // console.error("Custom ErrorHandler:222222", err);
    err.message = err.message || 'Internal facilities server error';
    err.statusCode = err.statusCode || 500;
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  // Fallback: Unexpected Server Error
  return res.status(500).json({
    success: false,
    message: 'Something went wrong with facilities server. Please try again later.',
  });
};
