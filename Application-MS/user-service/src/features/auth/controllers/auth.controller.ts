import { Request, Response, NextFunction } from 'express';
import { ErrorHandler } from '../../../utils/errors/errorHandler.util';
import { sendToken } from '../../../utils/sendToken/sendToken.util';
import EventEmitter from 'events';
import {
  createNewUserRepo,
  findUserForPasswordResetRepo,
  findUserRepo,
} from '../repository/auth.repository';
import { sendWelcomeEmail } from '../../../utils/emails/welcomeMail.util';
import { errorLogger } from '../../../utils/logs/logger.util';
import { createNewSessionRepo } from '../../userSessions/repository/userSession.repository';
import { sendPasswordResetEmail } from '../../../utils/emails/passwordReset.util';
import crypto from 'crypto';

// Create event emitter instance
const userEventEmitter = new EventEmitter();
// Event handlers for background processing
userEventEmitter.on('merchant.created', async (data) => {
  const { user, location, ipAddress, userAgent } = data;

  // Send welcome/OTP email (non-critical)
  try {
    await sendWelcomeEmail(user);
  } catch (emailError) {
    errorLogger.error('Failed to send welcome email:', emailError);
  }
  // Create session record (non-critical)
  try {
    await createNewSessionRepo(user, ipAddress, userAgent);
  } catch (sessionError) {
    errorLogger.error('Failed to create session:', sessionError);
  }
});

export const createNewUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { firstName, lastName, email, phoneCode, phone, password } = req.body;

    if (!firstName || !lastName || !email || !phoneCode || !phone || !password) {
      return next(new ErrorHandler(400, 'Please provide all required fields'));
    }

    const userData = {
      firstName,
      lastName,
      email,
      phoneCode,
      phone,
      password,
    };

    const newUser = await createNewUserRepo(userData);

    await sendToken(newUser, res, 201);

    setImmediate(() => {
      userEventEmitter.emit('user.created', {
        user: newUser,
        ipAddress: req.headers['x-app-ip'] || req.headers['x-client-ip'] || req.ip || '',
        userAgent: req.headers['user-agent'] || req.headers['x-client'] || '',
      });
    });
  } catch (err) {
    return next(err);
  }
};

export const userLogin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return next(new ErrorHandler(400, 'please provide email and password'));
    }
    const user: any = await findUserRepo({ email }, true);
    if (!user) {
      return next(new ErrorHandler(401, 'user not found! please register yourself now!!'));
    }
    const passwordMatch = await user.comparePassword(password);
    if (!passwordMatch) {
      return next(new ErrorHandler(400, 'Invalid password!'));
    }
    await sendToken(user, res, 200);
  } catch (err) {
    return next(err);
  }
};

export const forgetPassword = async (req: Request, res: Response, next: NextFunction) => {
  const { email } = req.body;
  if (!email) {
    return next(new ErrorHandler(400, 'please provide email'));
  }
  try {
    const user: any = await findUserRepo({ email });
    if (!user) {
      return next(new ErrorHandler(404, 'User not found with this email'));
    }

    const resetToken = await user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    try {
      // add a localhost URL for testing purposes i.e localhost:3000/reset-password
      const resetPasswordURL = `localhost:3000/reset-password/${resetToken}`;
      await sendPasswordResetEmail(user, resetPasswordURL);
      res.status(200).json({
        success: true,
        message: `Password reset link sent to ${user.email}`,
      });
    } catch (emailError) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });
      errorLogger.error('Failed to send password reset email:', emailError);
      res.status(500).json({
        success: false,
        message: 'Failed to send password reset email',
      });
    }
  } catch (err) {
    return next(err);
  }
};

export const resetUserPassword = async (req: Request, res: Response, next: NextFunction) => {
  const { token } = req.params;
  const { newPassword, confirmPassword } = req.body;

  if (!token) {
    return next(new ErrorHandler(400, 'please provide verification token'));
  }

  if (!newPassword || newPassword !== confirmPassword) {
    return next(new ErrorHandler(400, 'Passwords do not match'));
  }

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  try {
    const user: any = await findUserForPasswordResetRepo(hashedToken);

    if (!user) {
      return next(new ErrorHandler(400, 'Reset token is invalid or expired'));
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    await sendToken(user, res, 200); // auto-login after reset
  } catch (err) {
    return next(err);
  }
};
