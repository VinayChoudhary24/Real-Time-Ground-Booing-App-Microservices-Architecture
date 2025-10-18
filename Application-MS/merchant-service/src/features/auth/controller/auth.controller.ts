import { Request, Response, NextFunction } from 'express';
import { sendToken } from '../../../utils/sendToken/sendToken.util';
import { sendWelcomeEmail } from '../../../utils/emails/welcomeMail.util';
import {
  createNewUserOAuthRepo,
  createNewUserRepo,
  findMerchantForPasswordResetRepo,
  findMerchantUserRepo,
} from '../repository/auth.repository';
import { errorLogger } from '../../../utils/logs/logger.util';
import { createNewSessionRepo } from '../../merchantSessions/repository/merchantSession.repository';
import { createNewLocationRepo } from '../../location/repository/location.repository';
import { createNewLocationSettingsRepo } from '../../locationSettings/repository/locationSettings.repository';
import mongoose from 'mongoose';
import { ErrorHandler } from '../../../utils/errors/errorHandler.util';
import EventEmitter from 'events';
import { sendPasswordResetEmail } from '../../../utils/emails/passwordReset.util';
import crypto from 'crypto';
import { generateAuthUrl, getUserInfoGoogle } from '../service/googleAuth';
import { appConfig } from '../../../config/appConfig';
import { getToken } from '../../../utils/getToken/getToken.util';

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

  // Create Location Settings
  try {
    const locationId = location._id;
    // await createNewLocationSettingsRepo(newLocation._id, session);
    await createNewLocationSettingsRepo(locationId);
  } catch (locationSettingsError) {
    errorLogger.error('Failed to create merchant locationSettings:', locationSettingsError);
  }
});

// This has Medium Response to Merchant but with High Data integity using MongoDB Transacions, Event-Emitters
export const createNewMerchantUser = async (req: Request, res: Response, next: NextFunction) => {
  const session = await mongoose.startSession();

  try {
    const { firstName, lastName, email, phone, password, location } = req.body;

    if (!firstName || !lastName || !email || !password || !location) {
      return next(new ErrorHandler(400, 'Please provide all required fields'));
    }

    let newUser: any;
    let newLocation: any;
    let locationSettings: any;
    let transactionResult = false;

    // Critical operations that need consistency - use transaction
    transactionResult = await session.withTransaction(
      async () => {
        // Create user
        const merchantData = {
          firstName,
          lastName,
          email,
          phone,
          password,
        };

        newUser = await createNewUserRepo(merchantData, session);
        console.log('ExeCuted-User-Operation');
        if (location) {
          newLocation = await createNewLocationRepo(newUser, location, session);
        }
        return true;
      },
      {
        readConcern: { level: 'local' }, // SAFE: Reads consistent local data
        writeConcern: { w: 'majority', j: true }, // SAFE: Waits for majority + journal
        maxCommitTimeMS: 5000, // SAFE: Reasonable timeout
      },
    );

    if (!transactionResult) {
      throw new ErrorHandler(400, 'something went wrong, please try again in some time');
    }
    // Send response immediately after critical operations complete
    // console.log('BEFORE sending response:', Date.now());
    await sendToken(newUser, res, 201);
    // console.log('AFTER sending response:', Date.now());

    setImmediate(() => {
      // Emit events for background processing
      userEventEmitter.emit('merchant.created', {
        user: newUser,
        location: newLocation,
        ipAddress: req.headers['x-app-ip'] || req.headers['x-client-ip'] || req.ip || '',
        userAgent: req.headers['user-agent'] || req.headers['x-client'] || '',
      });
    });
  } catch (err) {
    return next(err);
  } finally {
    await session.endSession();
  }
};

// This is For Faster Response to Merchant but with Data Integrity Issues i.e location creation might fail in rare case
// export const createNewMerchantUser = async (req: Request, res: Response, next: NextFunction) => {
//   // console.log("req.headers", req.headers)
//   try {
//     const { firstName, lastName, email, password, location } = req.body;
//     let merchantData = {
//       firstName: firstName,
//       lastName: lastName,
//       email: email,
//       password: password,
//     };
//     const newUser = await createNewUserRepo(merchantData);
//     await sendToken(newUser, res, 200);

//     // Save Merchant Location
//     let newLocation: any;
//     try {
//       const merchantUserId = newUser._id;
//       newLocation = await createNewLocationRepo(merchantUserId, location);
//     } catch (locationError) {
//       errorLogger.error('Failed to create merchant location:', locationError);
//     }

//     // Send welcome email/OTP in background
//     try {
//       // # For Using NodeMailer we need to on the Google 2 Step verification setting and Than scroll-Down to generate
//       // App Password wehich will be Accepted by the Google SMTP Server not the Actual Password
//       await sendWelcomeEmail(newUser);
//     } catch (emailError) {
//       errorLogger.error('Failed to send welcome email:', emailError);
//     }

//     // Save session call
//     try {
//       const ipAddress = req.headers['x-app-ip']
//         ? req.headers['x-app-ip']
//         : req.headers['x-client-ip']
//           ? req.headers['x-client-ip']
//           : '';

//       const userAgent = req.headers['user-agent']
//         ? req.headers['user-agent']
//         : req.headers['x-client']
//           ? req.headers['x-client']
//           : '';
//       await createNewSessionRepo(newUser, ipAddress, userAgent);
//     } catch (sessionError) {
//       errorLogger.error('Failed to create merchant session:', sessionError);
//     }

//     // Create Location Settings
//     try {
//       const locationId = newLocation._id;
//       await createNewLocationSettingsRepo(locationId);
//     } catch (locationSettingsError) {
//       errorLogger.error('Failed to create merchant locationSettings:', locationSettingsError);
//     }
//   } catch (err) {
//     return next(err);
//   }
// };

export const merchantLogin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return next(new ErrorHandler(400, 'please provide email and password'));
    }
    const merchantUser: any = await findMerchantUserRepo({ email }, true);
    if (!merchantUser) {
      return next(new ErrorHandler(401, 'user not found! please register yourself now!!'));
    }
    const passwordMatch = await merchantUser.comparePassword(password);
    if (!passwordMatch) {
      return next(new ErrorHandler(400, 'Invalid password!'));
    }
    await sendToken(merchantUser, res, 200);
  } catch (err) {
    return next(err);
  }
};

export const merchantGoogleAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const googleAuthUrl = generateAuthUrl();
    console.log('Redirecting to Google Auth URL:', googleAuthUrl);
    // res.json({ authUrl: googleAuthUrl });
    res.status(200).json({
      success: true,
      authUrl: googleAuthUrl,
    });
  } catch (err) {
    return next(err);
  }
};

export const merchantGoogleLogin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const frontendUrl = appConfig.dashboardBaseURL || process.env.DASHBOARD_BASE_URL;
    let redirectUrl = '';
    // const { code } = req.query as string;
    const code = req.query.code as string;
    if (!code || typeof code !== 'string') {
      redirectUrl = `${frontendUrl}/auth/google/oauth2/result?error=Google Authorization code is missing or invalid`;
      res.status(400).json({
        success: false,
        redirectUrl,
      });
    }

    const merchantInfo: any = await getUserInfoGoogle(code);
    if (!merchantInfo || !merchantInfo.email) {
      redirectUrl = `${frontendUrl}/auth/google/oauth2/result?error=Failed to retrieve merchant information from Google`;
      res.status(400).json({
        success: false,
        redirectUrl,
      });
    }
    console.log('Retrieved merchant info from Google:', merchantInfo);
    let merchant = await findMerchantUserRepo({ email: merchantInfo.email });
    console.log('Existing merchant found:', merchant);
    if (!merchant) {
      // Create new merchant if not exists
      console.log('Creating New Merchant');
      merchant = await createNewUserOAuthRepo({
        firstName: merchantInfo.given_name,
        lastName: merchantInfo.family_name,
        email: merchantInfo.email,
        profileImg: {
          public_id: 'google-oauth2',
          url: merchantInfo.picture,
        },
        authProvider: 'google',
        merchantGoogleId: merchantInfo.id,
      });
    }
    const token = await getToken(merchant);
    redirectUrl = `${frontendUrl}/auth/google/oauth2/result?token=${token}`;
    res.status(200).json({
      success: true,
      redirectUrl,
    });
    // ## Now We Verified the Merchant Details and on Dashboard we need to handle the Create Location Logic i.e
    // After this on Dashboard we can redirect User to Create Location Page for data Consistency and Integrity
  } catch (err) {
    // return next(err);
    const frontendUrl = appConfig.dashboardBaseURL || process.env.DASHBOARD_BASE_URL;
    const redirectUrl = `${frontendUrl}/auth/google/oauth2/result?error=Google Authentication failed`;
    res.status(400).json({
      success: false,
      redirectUrl,
    });
  }
};

export const forgetPassword = async (req: Request, res: Response, next: NextFunction) => {
  const { email } = req.body;
  if (!email) {
    return next(new ErrorHandler(400, 'please provide email'));
  }
  try {
    const merchantUser: any = await findMerchantUserRepo({ email });
    if (!merchantUser) {
      return next(new ErrorHandler(404, 'Merchant not found with this email'));
    }

    const resetToken = await merchantUser.getResetPasswordToken();
    await merchantUser.save({ validateBeforeSave: false });

    try {
      // add a localhost URL for testing purposes i.e localhost:5173/reset-password
      const resetPasswordURL = `localhost:5173/reset-password/${resetToken}`;
      await sendPasswordResetEmail(merchantUser, resetPasswordURL);
      res.status(200).json({
        success: true,
        message: `Password reset link sent to ${merchantUser.email}`,
      });
    } catch (emailError) {
      merchantUser.resetPasswordToken = undefined;
      merchantUser.resetPasswordExpire = undefined;
      await merchantUser.save({ validateBeforeSave: false });
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

export const resetMerchantPassword = async (req: Request, res: Response, next: NextFunction) => {
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
    const merchantUser: any = await findMerchantForPasswordResetRepo(hashedToken);

    if (!merchantUser) {
      return next(new ErrorHandler(400, 'Reset token is invalid or expired'));
    }

    merchantUser.password = newPassword;
    merchantUser.resetPasswordToken = undefined;
    merchantUser.resetPasswordExpire = undefined;
    await merchantUser.save();

    await sendToken(merchantUser, res, 200); // auto-login after reset
  } catch (err) {
    return next(err);
  }
};
