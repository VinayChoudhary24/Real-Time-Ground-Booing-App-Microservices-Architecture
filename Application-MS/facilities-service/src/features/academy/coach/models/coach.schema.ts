import dayjs from 'dayjs';
import mongoose from 'mongoose';
import validator from 'validator';

// Status Constants
const INACTIVE = 0;
const ACTIVE = 1;
const SUSPENDED = 2;

// Sport Constants
const SPORTS = {
  FOOTBALL: 1,
  BASKETBALL: 2,
  CRICKET: 3,
  TENNIS: 4,
  BADMINTON: 5,
  VOLLEYBALL: 6,
  TABLE_TENNIS: 7,
  PICKLEBALL: 8,
  SWIMMING: 9,
};

const GENDER = { MALE: 1, FEMALE: 2, OTHER: 3 };

// Address Schema
const addressSchema = new mongoose.Schema(
  {
    addressLine: {
      type: String,
      required: [true, 'address is required'],
    },
    addressLineTwo: {
      type: String,
      default: '',
    },
    city: {
      type: String,
      required: [true, 'City is required'],
    },
    state: {
      type: String,
      required: [true, 'State is required'],
    },
    country: {
      type: String,
      required: [true, 'Country is required'],
    },
    postalCode: {
      type: String,
      required: [true, 'Postal code is required'],
    },
    coordinates: {
      latitude: {
        type: Number,
      },
      longitude: {
        type: Number,
      },
    },
  },
  { _id: false },
);

const coachSchema = new mongoose.Schema(
  {
    academyId: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Academy',
        default: '',
      },
    ],
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      minlength: [2, 'First name must be at least 2 characters'],
      maxlength: [30, 'First name must be at most 30 characters'],
      validate: {
        validator: (v: string) => /^[a-zA-Z0-9\s\-']+$/.test(v),
        message: 'First name can only contain letters, numbers, spaces, hyphens, and apostrophes',
      },
    },

    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
      minlength: [2, 'Last name must be at least 2 characters'],
      maxlength: [30, 'Last name must be at most 30 characters'],
      validate: {
        validator: (v: string) => /^[a-zA-Z0-9\s\-']+$/.test(v),
        message: 'Last name can only contain letters, numbers, spaces, hyphens, and apostrophes',
      },
    },
    phoneCode: {
      type: String,
      required: [true, 'Phone code is required'],
    },
    phone: {
      type: String,
      required: [true, 'phone number is required'],
      validate: {
        validator: validator.isMobilePhone,
        message: 'Please enter a valid phone number',
      },
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      required: [true, 'email is required'],
      validate: [validator.isEmail, 'please enter a valid email'],
    },
    sport: {
      type: [Number],
      required: [true, 'player sport is required'],
      enum: {
        values: Object.values(SPORTS),
        message: 'Invalid sport type',
      },
    },
    address: addressSchema,
    hourlyRate: { type: Number, default: 0 },
    monthlyRate: { type: Number, default: 0 },
    managedBatch: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'AcademyBatch' }],
      default: [],
    },
    dob: { type: Date },
    gender: {
      type: [Number],
      required: [true, 'gender is required'],
      enum: {
        values: Object.values(GENDER),
        message: 'Invalid gender type',
      },
    },
    tags: { type: [String], default: [] },
    merchantUserId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    locationId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    images: {
      type: [String],
      default: [],
      validate: {
        validator: (arr: string[]) => arr.every((url) => validator.isURL(url)),
        message: 'Each image must be a valid URL',
      },
    },
    status: {
      type: Number,
      enum: {
        values: [ACTIVE, INACTIVE, SUSPENDED],
      },
      default: ACTIVE,
    },
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

// before save
coachSchema.pre('save', function (next) {
  this.updatedAt = dayjs().unix();
  if (this.isNew) {
    this.createdAt = dayjs().unix();
  }
  next();
});

// Pre-update middleware to update the updatedAt timestamp
coachSchema.pre(['findOneAndUpdate', 'updateOne', 'updateMany'], function (next) {
  this.set({ updatedAt: dayjs().unix() });
  next();
});

coachSchema.index({ academyId: 1, status: 1 });
coachSchema.index({ sports: 1, status: 1 });
coachSchema.index({ firstName: 'text', lastName: 'text' });

// To get the Virtual Fields in Response
coachSchema.set('toJSON', {
  virtuals: true,
  versionKey: false, // hides __v
});

const AcademyCoachSchemaModel = mongoose.model('AcademyCoach', coachSchema);
export default AcademyCoachSchemaModel;
