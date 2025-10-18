import express from 'express';
import {
  createNewUser,
  forgetPassword,
  resetUserPassword,
  userLogin,
} from '../controllers/auth.controller';

const router = express.Router();

// POST Routes
// User Register
router.route('/api/user/register').post(createNewUser);
// User login
router.route('/api/user/login').post(userLogin);
// User Forgot Password
router.route('/password/forget').post(forgetPassword);

// PUT Routes
// User Reset Password
router.route('/password/reset/:token').put(resetUserPassword);

export default router;
