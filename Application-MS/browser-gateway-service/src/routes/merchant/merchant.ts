import express, { Request, Response, NextFunction } from 'express';
import axios from 'axios';
import { appConfig } from '../../config/appConfig/app.config';
import { sanitizeHeaders } from '../../middleware/sanitizeHeader/sanitizeHeaders.middleware';
import { jwtAuth } from '../../middleware/jwt/authentication.middleware';

const router = express.Router();

// Axios instance for merchant service

const merchantApi = axios.create({
  baseURL: appConfig.services.merchant,
  headers: {
    'Content-Type': 'application/json',
  },
});
// ROUTE: POST /api/auth/register - Register merchant
router.post(
  '/api/merchant/register',
  sanitizeHeaders,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // console.log("Merchant-Register-PATH", req.path);
      // console.log("Merchant-Register-merchantApi", merchantApi.defaults.baseURL + req.path);
      const response = await merchantApi.post(req.path, req.body, {
        headers: req.headers,
        //     headers: {
        //   'Content-Type': 'application/json',
        // },
      });
      // console.log("Merchant-Response", response.data);
      res.send(response.data);
    } catch (error) {
      // console.log("Merchant-ERROR");
      next(error);
    }
  },
);

// ROUTE: POST /api/auth/login - merchant Login
router.post(
  '/api/merchant/login',
  sanitizeHeaders,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const response = await merchantApi.post(req.path, req.body, {
        headers: req.headers,
      });
      res.send(response.data);
    } catch (error) {
      next(error);
    }
  },
);

// ROUTE: GET /api/merchant/google - Merchant Social Google Login
router.get(
  '/api/merchant/google',
  sanitizeHeaders,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const response = await merchantApi.get(req.path, {
        headers: req.headers,
      });
      console.log('GOOGLE-URL', response.data);
      res.send(response.data);
    } catch (error) {
      next(error);
    }
  },
);

// ROUTE: GET /api/merchant/oauth2/callback - Google OAuth2 Callback URL
// router.get(
//   '/api/merchant/oauth2/callback',
//   // sanitizeHeaders,
//   async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       const response = await merchantApi.get(req.path, {
//         headers: req.headers,
//       });
//       console.log('GOOGLE-CAllBACK', response.data);
//       res.send(response.data);
//     } catch (error) {
//       next(error);
//     }
//   },
// );

// ROUTE: GET /api/merchant - Get merchant profile
router.get(
  '/api/merchant',
  jwtAuth,
  sanitizeHeaders,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const response = await merchantApi.get(req.path, {
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

// ROUTE: PUT /api/merchant - Update merchant profile
router.put(
  '/api/merchant',
  jwtAuth,
  sanitizeHeaders,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const response = await merchantApi.put(req.path, req.body, {
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

// ROUTE: GET /api/merchant/location - Get merchant with location Details
router.get(
  '/api/merchant/location',
  jwtAuth,
  sanitizeHeaders,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const response = await merchantApi.get(req.path, {
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

// ROUTE: POST /api/location - Create Merchant Location
router.post(
  '/api/location',
  jwtAuth,
  sanitizeHeaders,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const response = await merchantApi.post(req.path, req.body, {
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

// ROUTE: GET /api/location/:locationId - Get location Details
router.get(
  '/api/location/:locationId',
  jwtAuth,
  sanitizeHeaders,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const response = await merchantApi.get(req.path, {
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

// ROUTE: GET /api/location - Get All location Details
router.get(
  '/api/location',
  jwtAuth,
  sanitizeHeaders,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const response = await merchantApi.get(req.path, {
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

// ROUTE: PUT /api/location/:locationId - Update location details
router.put(
  '/api/location/:locationId',
  jwtAuth,
  sanitizeHeaders,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const response = await merchantApi.put(req.path, req.body, {
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

// ROUTE: DELETE /api/location/:locationId - Delete location Details
router.delete(
  '/api/location/:locationId',
  jwtAuth,
  sanitizeHeaders,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const response = await merchantApi.delete(req.path, {
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

export default router;
