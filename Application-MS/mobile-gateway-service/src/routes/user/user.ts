import express, { Request, Response, NextFunction } from 'express';
import axios from 'axios';
import { appConfig } from '../../config/appConfig/app.config';
import { sanitizeHeaders } from '../../middleware/sanitizeHeader/sanitizeHeaders.middleware';
import { jwtAuth } from '../../middleware/jwt/authentication.middleware';

const router = express.Router();

// Axios instance for merchant service

const userApi = axios.create({
  baseURL: appConfig.services.user,
  headers: {
    'Content-Type': 'application/json',
  },
});
// ROUTE: POST /api/user/register - Register user
router.post(
  '/api/user/register',
  sanitizeHeaders,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const response = await userApi.post(req.path, req.body, {
        headers: req.headers,
      });
      res.send(response.data);
    } catch (error) {
      next(error);
    }
  },
);

// ROUTE: POST /api/user/login - user Login
router.post(
  '/api/user/login',
  sanitizeHeaders,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const response = await userApi.post(req.path, req.body, {
        headers: req.headers,
      });
      res.send(response.data);
    } catch (error) {
      next(error);
    }
  },
);

// ROUTE: GET /api/user - Get user profile
router.get(
  '/api/user',
  jwtAuth,
  sanitizeHeaders,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const response = await userApi.get(req.path, {
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

// ROUTE: PUT /api/user - Update user profile
router.put(
  '/api/user',
  jwtAuth,
  sanitizeHeaders,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const response = await userApi.put(req.path, req.body, {
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

// // ROUTE: GET /api/merchant/location - Get merchant with location Details
// router.get(
//   '/api/merchant/location',
//   jwtAuth,
//   sanitizeHeaders,
//   async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       const response = await merchantApi.get(req.path, {
//         params: {
//           ...req.query,
//         },
//         headers: {
//           ...req.headers,
//           'x-merchant-user-id': req.merchantUserId,
//         },
//       });
//       res.send(response.data);
//     } catch (error) {
//       next(error);
//     }
//   },
// );

// // ROUTE: POST /api/location - Create Merchant Location
// router.post(
//   '/api/location',
//   jwtAuth,
//   sanitizeHeaders,
//   async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       const response = await merchantApi.post(req.path, req.body, {
//         headers: {
//           ...req.headers,
//           'x-merchant-user-id': req.merchantUserId,
//         },
//       });
//       res.send(response.data);
//     } catch (error) {
//       next(error);
//     }
//   },
// );

// // ROUTE: GET /api/location/:locationId - Get location Details
// router.get(
//   '/api/location/:locationId',
//   jwtAuth,
//   sanitizeHeaders,
//   async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       const response = await merchantApi.get(req.path, {
//         params: {
//           ...req.query,
//         },
//         headers: {
//           ...req.headers,
//           'x-merchant-user-id': req.merchantUserId,
//         },
//       });
//       res.send(response.data);
//     } catch (error) {
//       next(error);
//     }
//   },
// );

// // ROUTE: GET /api/allLocations - Get All location Details
// router.get(
//   '/api/allLocations',
//   jwtAuth,
//   sanitizeHeaders,
//   async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       const response = await merchantApi.get(req.path, {
//         params: {
//           ...req.query,
//         },
//         headers: {
//           ...req.headers,
//           'x-merchant-user-id': req.merchantUserId,
//         },
//       });
//       res.send(response.data);
//     } catch (error) {
//       next(error);
//     }
//   },
// );

// // ROUTE: PUT /api/location/:locationId - Update location details
// router.put(
//   '/api/location/:locationId',
//   jwtAuth,
//   sanitizeHeaders,
//   async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       const response = await merchantApi.put(req.path, req.body, {
//         headers: {
//           ...req.headers,
//           'x-merchant-user-id': req.merchantUserId,
//         },
//       });
//       res.send(response.data);
//     } catch (error) {
//       next(error);
//     }
//   },
// );

// // ROUTE: DELETE /api/location/:locationId - Delete location Details
// router.delete(
//   '/api/location/:locationId',
//   jwtAuth,
//   sanitizeHeaders,
//   async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       const response = await merchantApi.delete(req.path, {
//         params: {
//           ...req.query,
//         },
//         headers: {
//           ...req.headers,
//           'x-merchant-user-id': req.merchantUserId,
//         },
//       });
//       res.send(response.data);
//     } catch (error) {
//       next(error);
//     }
//   },
// );

export default router;
