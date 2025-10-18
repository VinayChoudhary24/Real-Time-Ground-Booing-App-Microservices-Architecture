import dayjs from 'dayjs';
import mongoose from 'mongoose';
import validator from 'validator';

// Academy Status Constants
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

const AGE_GROUP = {
  UNDER_10: 1, // U10 - 8–9 years
  UNDER_12: 2, // U12 - 10–11 years
  UNDER_14: 3, // U14 - 12–13 years
  UNDER_16: 4, // U16 - 14–15 years
  UNDER_18: 5, // U18 - 16–17 years (teen)
  ADULT: 6, // 18+ years
};

const sessionSchema = new mongoose.Schema({
  startTime: {
    type: String,
    required: [true, 'Please provide session start time'],
    match: [
      /^(0?[1-9]|1[0-2]):[0-5][0-9]\s?(AM|PM)$/i,
      'Start time must be in 12-hour format (e.g., 06:30 AM)',
    ],
  },
  endTime: {
    type: String,
    required: [true, 'Please provide session end time'],
    match: [
      /^(0?[1-9]|1[0-2]):[0-5][0-9]\s?(AM|PM)$/i,
      'End time must be in 12-hour format (e.g., 06:30 PM)',
    ],
  },
});

const batchSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'batch name is required'],
      trim: true,
    },
    sport: {
      type: [Number],
      required: [true, 'batch sport is required'],
      enum: {
        values: Object.values(SPORTS),
        message: 'Invalid sport type',
      },
    },
    ageGroup: {
      type: [Number],
      required: [true, 'age group is required'],
      enum: {
        values: Object.values(AGE_GROUP),
        message: 'Invalid age group',
      },
    },
    startDate: {
      type: Date,
      required: [true, 'Please provide batch start date'],
      validate: {
        validator: function (value: Date): boolean {
          return value instanceof Date && !isNaN(value.getTime());
        },
        message: 'Start date must be a valid date',
      },
    },
    endDate: {
      type: Date,
      required: [true, 'Please provide batch end date'],
      validate: {
        validator: function (value: Date): boolean {
          return value instanceof Date && !isNaN(value.getTime());
        },
        message: 'End date must be a valid date',
      },
    },
    days: {
      type: [String], // e.g. ['Monday', 'Wednesday', 'Friday']
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      required: true,
    },
    sessionsPerDay: {
      type: [sessionSchema], // Multiple sessions per selected days
      required: true,
    },
    fees: {
      type: Number,
      required: true,
      min: 0,
    },
    enrollmentOpen: {
      type: Boolean,
      default: true,
    },
    phoneCode: {
      type: String,
      default: '',
    },
    phone: {
      type: String,
      default: '',
      validate: {
        validator: validator.isMobilePhone,
        message: 'Please enter a valid phone number',
      },
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      default: '',
      validate: [validator.isEmail, 'please enter a valid email'],
    },
    merchantUserId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    locationId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    facilityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Facility',
    },
    coaches: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'AcademyCoach' }],
      default: [],
    },
    discountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Discount',
      default: null,
    },
    isOpen: {
      type: Boolean,
      default: true,
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
batchSchema.pre('save', function (next) {
  this.updatedAt = dayjs().unix();
  if (this.isNew) {
    this.createdAt = dayjs().unix();
  }
  next();
});

// Pre-update middleware to update the updatedAt timestamp
batchSchema.pre(['findOneAndUpdate', 'updateOne', 'updateMany'], function (next) {
  this.set({ updatedAt: dayjs().unix() });
  next();
});

batchSchema.index({ academyId: 1, status: 1 });
batchSchema.index({ coaches: 1, status: 1 });
batchSchema.index({ name: 'text', description: 'text' });

// To get the Virtual Fields in Response
batchSchema.set('toJSON', {
  virtuals: true,
  versionKey: false, // hides __v
});

const AcademyBatchSchemaModel = mongoose.model('AcademyBatch', batchSchema);
export default AcademyBatchSchemaModel;
