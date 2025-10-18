import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { appConfig } from '../../config/appConfig/app.config';
import { ErrorHandler } from '../../utils/errors/errorHandler.util';

// Extend the Request interface
declare global {
  namespace Express {
    interface Request {
      merchantUserId?: string;
    }
  }
}

export const jwtAuth = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers['authorization'];
  if (!token) {
    return next(new ErrorHandler(401, 'please login again, your session is expired...'));
  }
  try {
    const decodedData = (await jwt.verify(token, appConfig.jwt_secret)) as { id: string };
    // console.log('decodedData', decodedData);
    req.merchantUserId = decodedData.id;
  } catch (err) {
    return next(new ErrorHandler(401, 'please login again, your session is expired...'));
  }
  next();
};

// Authorization Middleware
// export const authByUserRole = (...roles) => {
//   return async (req: Request, res: Response, next: NextFunction) => {
//     if (!roles.includes(req.user.role)) {
//       return next(
//         new ErrorHandler(
//           403,
//           `Role: ${req.user.role} is not allowed to access this resource`
//         )
//       );
//     }
//     next();
//   };
// };
