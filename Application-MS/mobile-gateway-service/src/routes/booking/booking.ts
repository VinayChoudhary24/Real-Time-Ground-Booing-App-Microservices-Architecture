import express, { Request, Response, NextFunction } from 'express';
import axios from 'axios';
import { appConfig } from '../../config/appConfig';
import { jwtAuth } from '../../middleware/jwt/authentication.middleware';
import { sanitizeHeaders } from '../../middleware/sanitizeHeader/sanitizeHeaders.middleware';

const router = express.Router();

// Axios instance for booking service
const bookingApi = axios.create({
  baseURL: appConfig.services.booking,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ROUTE: POST /api/booking - Create new booking
router.post(
  '/api/booking',
  jwtAuth,
  sanitizeHeaders,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const response = await bookingApi.post(req.path, req.body, {
        headers: {
          ...req.headers,
          'x-user-id': req.userId,
        },
      });
      res.send(response.data);
    } catch (error) {
      next(error);
    }
  },
);

export default router;
