import { Request, Response, NextFunction } from 'express';
import { appConfig } from '../../../config/appConfig';
import { ErrorHandler } from '../../../utils/errors/errorHandler.util';

export const verifyInternalRequest = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers['x-internal-token']?.toString();

  const validToken =
    appConfig.bookingFacilitySecret?.toString() || process.env.BOOKING_FACILITY_SECRET?.toString();

  if (!token || token !== validToken) {
    // console.log('Not_Valid_token', token);
    return next(
      new ErrorHandler(403, 'Forbidden: Invalid or missing internal token from booking service'),
    );
    // return res.status(403).json({ success: false, message: '' });
  }

  next();
};
