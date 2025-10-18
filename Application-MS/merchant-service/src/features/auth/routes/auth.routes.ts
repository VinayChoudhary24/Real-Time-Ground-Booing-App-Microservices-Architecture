import express from 'express';
import {
  createNewMerchantUser,
  forgetPassword,
  merchantGoogleAuth,
  merchantGoogleLogin,
  merchantLogin,
  resetMerchantPassword,
} from '../controller/auth.controller';

const router = express.Router();

// POST Routes
// Merchant Register
router.route('/api/merchant/register').post(createNewMerchantUser);
// Merchant login
router.route('/api/merchant/login').post(merchantLogin);
// Merchant Social Google login
router.route('/api/merchant/google').get(merchantGoogleAuth);
// Google OAuth2 Callback URL
router.route('/api/merchant/oauth2/callback').get(merchantGoogleLogin);

// Merchant Forgot Password
router.route('/password/forget').post(forgetPassword);

// PUT Routes
// Merchant Reset Password
router.route('/password/reset/:token').put(resetMerchantPassword);

export default router;
