import { Request, Response, NextFunction } from 'express';
import { ErrorHandler } from '../../utils/errors/errorHandler.util';

export const errorHandlerMiddleware: any = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // Custom ErrorHandler
  if (err instanceof ErrorHandler) {
    // console.error("Custom ErrorHandler:222222", err);
    err.message = err.message || 'Internal Gateway Server Error';
    err.statusCode = err.statusCode || 500;
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  // console.log("Gateway-err", err.status)
  const statusCode = err?.status || 500;
  let message = err?.message || 'Internal Gateway Server Error';

  // Check the error from other service
  if (err?.response && err?.response?.data) {
    // console.log('Gateway Error From Service:', err.response.data);
    // Use the message and status code from the downstream service if available
    message = err?.response?.data?.message || message;
  }

  return res.status(statusCode).json({
    success: false,
    message,
  });
};
