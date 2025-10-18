import express, { Request, Response, NextFunction } from 'express';
import axios from 'axios';
import { appConfig } from '../../config/appConfig/app.config';
import { sanitizeHeaders } from '../../middleware/sanitizeHeader/sanitizeHeaders.middleware';
import { jwtAuth } from '../../middleware/jwt/authentication.middleware';

const router = express.Router();

// Axios instance for facilities service
const facilitiesApi = axios.create({
  baseURL: appConfig.services.facilities,
  headers: {
    'Content-Type': 'application/json',
  },
});

// -------------------------FACILITY-----------------------------//
// ROUTE: POST /api/facility - Create merchant facility
router.post(
  '/api/facility',
  jwtAuth,
  sanitizeHeaders,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const response = await facilitiesApi.post(req.path, req.body, {
        headers: {
          ...req.headers,
          'x-merchant-user-id': req.merchantUserId,
        },
      });
      res.send(response.data);
    } catch (error) {
      next(error);
    }
  },
);

// ROUTE: GET /api/facility/:facilityId - Get facility Details
router.get(
  '/api/facility/:facilityId',
  jwtAuth,
  sanitizeHeaders,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const response = await facilitiesApi.get(req.path, {
        params: {
          ...req.query,
        },
        headers: {
          ...req.headers,
          'x-merchant-user-id': req.merchantUserId,
        },
      });
      res.send(response.data);
    } catch (error) {
      next(error);
    }
  },
);

// ROUTE: GET /api/facility - Get All facilities Details
router.get(
  '/api/facility',
  jwtAuth,
  sanitizeHeaders,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const response = await facilitiesApi.get(req.path, {
        params: {
          ...req.query,
        },
        headers: {
          ...req.headers,
          'x-merchant-user-id': req.merchantUserId,
        },
      });
      res.send(response.data);
    } catch (error) {
      next(error);
    }
  },
);

// ROUTE: PUT /api/facility/:facilityId - Update facility details
router.put(
  '/api/facility/:facilityId',
  jwtAuth,
  sanitizeHeaders,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const response = await facilitiesApi.put(req.path, req.body, {
        headers: {
          ...req.headers,
          'x-merchant-user-id': req.merchantUserId,
        },
      });
      res.send(response.data);
    } catch (error) {
      next(error);
    }
  },
);

// ROUTE: DELETE /api/facility/:facilityId - Delete facility Details
router.delete(
  '/api/facility/:facilityId',
  jwtAuth,
  sanitizeHeaders,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const response = await facilitiesApi.delete(req.path, {
        params: {
          ...req.query,
        },
        headers: {
          ...req.headers,
          'x-merchant-user-id': req.merchantUserId,
        },
      });
      res.send(response.data);
    } catch (error) {
      next(error);
    }
  },
);
// -------------------------FACILITY-----------------------------//

// -------------------------DISCOUNT-----------------------------//
// ROUTE: POST /api/discount - Create merchant discount
router.post(
  '/api/discount',
  jwtAuth,
  sanitizeHeaders,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const response = await facilitiesApi.post(req.path, req.body, {
        headers: {
          ...req.headers,
          'x-merchant-user-id': req.merchantUserId,
        },
      });
      res.send(response.data);
    } catch (error) {
      next(error);
    }
  },
);

// ROUTE: GET /api/discount/:discountId - Get discount Details
router.get(
  '/api/discount/:discountId',
  jwtAuth,
  sanitizeHeaders,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const response = await facilitiesApi.get(req.path, {
        params: {
          ...req.query,
        },
        headers: {
          ...req.headers,
          'x-merchant-user-id': req.merchantUserId,
        },
      });
      res.send(response.data);
    } catch (error) {
      next(error);
    }
  },
);

// ROUTE: GET /api/discount - Get All discounts Details
router.get(
  '/api/discount',
  jwtAuth,
  sanitizeHeaders,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const response = await facilitiesApi.get(req.path, {
        params: {
          ...req.query,
        },
        headers: {
          ...req.headers,
          'x-merchant-user-id': req.merchantUserId,
        },
      });
      res.send(response.data);
    } catch (error) {
      next(error);
    }
  },
);

// ROUTE: PUT /api/discount/:discountId - Update discount details
router.put(
  '/api/discount/:discountId',
  jwtAuth,
  sanitizeHeaders,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const response = await facilitiesApi.put(req.path, req.body, {
        headers: {
          ...req.headers,
          'x-merchant-user-id': req.merchantUserId,
        },
      });
      res.send(response.data);
    } catch (error) {
      next(error);
    }
  },
);

// ROUTE: DELETE /api/discount/:discountId - Delete discount Details
router.delete(
  '/api/discount/:discountId',
  jwtAuth,
  sanitizeHeaders,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const response = await facilitiesApi.delete(req.path, {
        params: {
          ...req.query,
        },
        headers: {
          ...req.headers,
          'x-merchant-user-id': req.merchantUserId,
        },
      });
      res.send(response.data);
    } catch (error) {
      next(error);
    }
  },
);
// -------------------------DISCOUNT-----------------------------//
export default router;
