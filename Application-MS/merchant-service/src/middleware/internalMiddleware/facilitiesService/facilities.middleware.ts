import { Request, Response, NextFunction } from 'express';
import { ErrorHandler } from '../../../utils/errors/errorHandler.util';
import { appConfig } from '../../../config/appConfig';

export const verifyInternalRequest = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers['x-internal-token']?.toString();

  const validToken =
    appConfig.facilityMerchantSecret?.toString() ||
    process.env.FACILITY_MERCHANT_SECRET?.toString();

  if (!token || token !== validToken) {
    // console.log('Not_Valid_token', token);
    return next(
      new ErrorHandler(403, 'Forbidden: Invalid or missing internal token from facilities service'),
    );
    // return res.status(403).json({ success: false, message: '' });
  }

  next();
};
