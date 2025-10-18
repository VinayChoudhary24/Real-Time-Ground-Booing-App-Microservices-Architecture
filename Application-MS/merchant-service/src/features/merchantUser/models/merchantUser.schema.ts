import mongoose from 'mongoose';
import validator from 'validator';
import dayjs from 'dayjs';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { appConfig } from '../../../config/appConfig/app.config';

// Merchant Status is Subscription Status
const TRIAL_EXPIRED = 0;
const TRIAL_IN_PROGRESS = 1;
const SUBSCRIBED = 2;

const jwt_expire = '1h';

const merchantUserSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, 'first name is required'],
      trim: true,
      maxLength: [30, "first name can't exceed 30 characters"],
      minLength: [2, 'first name should have atleast 2 charcters'],
      validate: {
        validator: function (v: string) {
          return /^[a-zA-Z0-9\s\-']+$/.test(v); // <-- Added 0-9
        },
        message: 'first name can only contain letters, numbers, spaces, hyphens, and apostrophes',
      },
    },
    lastName: {
      type: String,
      required: [
        function (this: any) {
          // Only required for local auth, optional for OAuth
          return this.authProvider === 'local';
        },
        'Last name is required',
      ],
      trim: true,
      maxLength: [30, "last name can't exceed 30 characters"],
      minLength: [2, 'last name should have atleast 2 charcters'],
      validate: {
        validator: function (v: string) {
          return /^[a-zA-Z0-9\s\-']+$/.test(v);
        },
        message: 'last name can only contain letters, numbers, spaces, hyphens, and apostrophes',
      },
    },
    phoneCode: {
      type: String,
      required: [
        function (this: any) {
          // Only required for local auth, optional for OAuth
          return this.authProvider === 'local';
        },
        'Phone code is required',
      ],
    },
    phone: {
      type: String,
      required: [
        function (this: any) {
          // Only required for local auth, optional for OAuth
          return this.authProvider === 'local';
        },
        'phone number is required',
      ],
      validate: {
        validator: validator.isMobilePhone,
        message: 'Please enter a valid phone number',
      },
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      required: [true, 'merchant email is required'],
      validate: [validator.isEmail, 'please enter a valid email'],
    },
    password: {
      type: String,
      required: [
        function (this: any) {
          // Only required for local auth, optional for OAuth
          return this.authProvider === 'local';
        },
        'Please enter your password',
      ],
      select: false,
      minlength: [8, 'Password must be at least 8 characters long'],
      maxlength: [52, 'Password cannot exceed 52 characters'],
      validate: [
        {
          validator: function (v: string) {
            // Strong password requirements
            return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(v);
          },
          message:
            'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
        },
      ],
    },
    profileImg: {
      public_id: {
        type: String,
        default: '',
      },
      url: {
        type: String,
        default: 'this is dummy avatar url',
      },
    },
    has2FA: {
      type: Boolean,
      default: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    isPhoneVerified: {
      type: Boolean,
      default: false,
    },
    authProvider: {
      type: String,
      enum: ['local', 'google', 'apple', 'facebook'],
      default: 'local',
    },
    merchantGoogleId: { type: String, default: null },
    status: {
      type: Number,
      enum: [TRIAL_EXPIRED, TRIAL_IN_PROGRESS, SUBSCRIBED],
      default: TRIAL_IN_PROGRESS,
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    createdAt: {
      type: Number,
      default: () => dayjs().unix(),
    },
    updatedAt: {
      type: Number,
      default: () => dayjs().unix(),
    },
  },
  {
    timestamps: false,
  },
);

// Virtual for full name
merchantUserSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

merchantUserSchema.virtual('mobile').get(function () {
  return `${this.phoneCode}${this.phone}`;
});

// Virtual for Getting Locations
// merchantUserSchema.virtual('locations', {
//   ref: 'MerchantLocation',
//   localField: '_id',
//   foreignField: 'merchantUserId'
// });
// // Usage in Repository File - gives you population-like syntax without storing array
// const merchantWithLocations = await MerchantUserModel.findById(merchantId)
//   .populate('locations');

// before save
merchantUserSchema.pre('save', function (next) {
  this.updatedAt = dayjs().unix();
  if (this.isNew) {
    this.createdAt = dayjs().unix();
  }
  next();
});
// Mongoose Middleware/Hook to keep updatedAt in Sync
// Pre-update middleware to update the updatedAt timestamp
merchantUserSchema.pre(['findOneAndUpdate', 'updateOne', 'updateMany'], function (next) {
  this.set({ updatedAt: dayjs().unix() });
  next();
});

// hash user password before saving using bcrypt
// merchantUserSchema.pre('save', async function (next) {
//   // Less rounds means less secure but faster, more rounds means more secure but takes time for operation
//   // the value can should be between 1-20
//   // Hash password with cost of 12 (recommended for production)
//   const saltRounds = 12;
//   // const saltRounds = await bcrypt.genSalt(12);
//   this.password = await bcrypt.hash(this.password, saltRounds);
//   next();
// });
merchantUserSchema.pre('save', async function (next) {
  // For a NEW user being created:
  // - this.isModified('password') returns TRUE (because it's a new document)
  // - this.password exists and contains the plain text password
  // So the condition passes and password gets hashed

  if (!this.isModified('password') || !this.password) {
    return next(); // This won't execute for new users
  }

  // try {
  const saltRounds = 12;
  this.password = await bcrypt.hash(this.password, saltRounds); // Password gets hashed
  next();
  // } catch (error) {
  // next(error);
  // }
});

// JWT Token
merchantUserSchema.methods.getJWTToken = function () {
  return jwt.sign({ id: this._id }, appConfig.jwt_secret, {
    expiresIn: jwt_expire,
  });
};

// password compare
merchantUserSchema.methods.comparePassword = async function (password: string) {
  return await bcrypt.compare(password, this.password);
};

// generatePasswordResetToken
merchantUserSchema.methods.getResetPasswordToken = async function () {
  const resetToken = crypto.randomBytes(20).toString('hex');

  // hashing and updating user resetPasswordToken
  this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');

  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

// Index Definitions
merchantUserSchema.index({ email: 1 }, { unique: true });
merchantUserSchema.index({ phone: 1 }, { unique: true });
merchantUserSchema.index({ status: 1 });

// To get the Virtual Fields in Response
merchantUserSchema.set('toJSON', {
  virtuals: true,
  versionKey: false, // hides __v
  transform: function (doc, ret) {
    delete ret.password;
    // delete ret.resetPasswordToken;
    // delete ret.resetPasswordExpire;
    delete ret.id; // hides the virtual 'id'
    return ret;
  },
});

const MerchantUserModel = mongoose.model('MerchantUser', merchantUserSchema);
export default MerchantUserModel;
