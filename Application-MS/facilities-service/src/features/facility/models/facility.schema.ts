import dayjs from 'dayjs';
import mongoose from 'mongoose';
import validator from 'validator';

// Facility Status Constants
const INACTIVE = 0;
const ACTIVE = 1;
const SUSPENDED = 2;

const SINGLE_PURPOSE = 1;
const MULTI_PURPOSE = 2;

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

// Type of Interval
const SLOT = 1;
const MAINTENANCE = 2;
const ACADEMY = 3;

// This is the Base Slots with Prices
const baseSlotSchema = new mongoose.Schema({
  startTime: {
    type: String,
    required: [true, 'please provide session start time'],
    match: [
      /^(0?[1-9]|1[0-2]):[0-5][0-9]\s?(AM|PM)$/i,
      'session start time must be in 12-hour format (e.g., 06:30 AM)',
    ],
  },
  endTime: {
    type: String,
    required: [true, 'please provide session end time'],
    match: [
      /^(0?[1-9]|1[0-2]):[0-5][0-9]\s?(AM|PM)$/i,
      'session end time must be in 12-hour format (e.g., 06:30 PM)',
    ],
  },
  price: {
    type: Number,
    required: [true, 'please provide session price'],
    validate: {
      validator: function (value: number) {
        // Additional checks for edge cases
        return Number.isFinite(value) && value >= 0;
      },
      message: 'session price is not valid',
    },
  },
  isAvailable: {
    type: Boolean,
    default: true,
  },
  type: {
    type: Number,
    required: [true, 'Interval type is required'],
    enum: {
      values: [SLOT, MAINTENANCE, ACADEMY],
      message: 'Invalid Interval type',
    },
  },
});

// This is the Base Slots with Prices
const intervalTypeSchema = new mongoose.Schema({
  startTime: {
    type: String,
    required: [true, 'please provide interval start time'],
    match: [
      /^(0?[1-9]|1[0-2]):[0-5][0-9]\s?(AM|PM)$/i,
      'interval start time must be in 12-hour format (e.g., 06:30 AM)',
    ],
  },
  endTime: {
    type: String,
    required: [true, 'please provide interval end time'],
    match: [
      /^(0?[1-9]|1[0-2]):[0-5][0-9]\s?(AM|PM)$/i,
      'interval end time must be in 12-hour format (e.g., 06:30 PM)',
    ],
  },
  isBookable: {
    type: Boolean,
    default: true,
  },
  type: {
    type: Number,
    required: [true, 'Interval type is required'],
    enum: {
      values: [SLOT, MAINTENANCE, ACADEMY],
      message: 'Invalid Interval type',
    },
  },
  applicableDiscountIds: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'Discount',
    default: [],
  },
});

const facilitySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'facility name is required'],
      trim: true,
    },
    type: {
      type: Number,
      required: [true, 'facility type is required'],
      enum: {
        values: [SINGLE_PURPOSE, MULTI_PURPOSE],
        message: 'Invalid facility type',
      },
    },
    sport: {
      type: [Number],
      required: [true, 'sport is required'],
      enum: {
        values: Object.values(SPORTS),
        message: 'Invalid sport type',
      },
    },
    isTimeFlexible: {
      type: Boolean,
      default: true,
    },
    maintenance: {
      type: Boolean,
      default: false,
    },
    academyTime: {
      type: Boolean,
      default: false,
    },
    merchantUserId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    locationId: {
      type: mongoose.Schema.Types.ObjectId,
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
    dayStartTime: {
      type: String,
      required: [true, 'please provide day start time'],
      match: [
        /^(0?[1-9]|1[0-2]):[0-5][0-9]\s?(AM|PM)$/i,
        'day start time must be in 12-hour format (e.g., 06:00 AM)',
      ],
    },
    dayEndTime: {
      type: String,
      required: [true, 'please provide day end time'],
      match: [
        /^(0?[1-9]|1[0-2]):[0-5][0-9]\s?(AM|PM)$/i,
        'day end time must be in 12-hour format (e.g., 10:30 PM)',
      ],
    },
    hoursPerSession: {
      type: [Number],
      required: [true, 'please provide hours per session'],
      validate: {
        validator: function (value: number[]): boolean {
          const unique = new Set(value);
          return (
            Array.isArray(value) &&
            value.length > 0 &&
            value.every((num) => typeof num === 'number' && num > 0 && Number.isInteger(num)) &&
            unique.size === value.length
          );
        },
        message: 'hours per session is not valid',
      },
    },
    pricePerHour: {
      type: Number,
      default: 0,
      // set: (v: number) => Math.round(v * 100) / 100, // Rounds to 2 decimal places
      validate: {
        validator: function (value: number) {
          // Skip validation if value is undefined/null (will use default)
          if (value == null) return true;

          // Additional checks for edge cases
          return Number.isFinite(value) && value >= 0;
        },
        message: 'price per hour is not valid',
      },
    },
    baseSlots: {
      type: [baseSlotSchema],
      default: [],
    },
    intervalTypes: {
      type: [intervalTypeSchema],
      default: [],
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
facilitySchema.pre('save', function (next) {
  this.updatedAt = dayjs().unix();
  if (this.isNew) {
    this.createdAt = dayjs().unix();
  }
  next();
});

// Mongoose Middleware/Hook to keep updatedAt in Sync
// Pre-update middleware to update the updatedAt timestamp
facilitySchema.pre(['findOneAndUpdate', 'updateOne', 'updateMany'], function (next) {
  this.set({ updatedAt: dayjs().unix() });
  next();
});

// To prevent duplicate facility names under a location
// facilitySchema.index({ name: 1, locationId: 1 }, { unique: true });

// Index Definitions
facilitySchema.index({ sport: 1 });
facilitySchema.index({ sport: 1, type: 1 }); // helps with MULTI_PURPOSE filtering + sport
facilitySchema.index({ sport: 1, locationId: 1 });
facilitySchema.index({ sport: 1, status: 1 });

// Index for fast lookup by merchant (for dashboard, facility management)
facilitySchema.index({ name: 1 });
facilitySchema.index({ merchantUserId: 1 });
// Compound index for location + isOpen (e.g., user wants open facilities nearby)
facilitySchema.index({ locationId: 1, isOpen: 1 });
facilitySchema.index({ locationId: 1, status: 1 });
// Full-text index on name and description (for fuzzy search, autocomplete, etc.)
facilitySchema.index(
  {
    name: 'text',
    description: 'text',
  },
  {
    weights: {
      name: 10, // Name is more important than description
      description: 5,
    },
    name: 'facility_text_index',
  },
);
// Index for scheduling/searching based on available time slots
facilitySchema.index({ dayStartTime: 1, dayEndTime: 1 });
facilitySchema.index({ 'baseSlots.startTime': 1, 'baseSlots.endTime': 1 });
facilitySchema.index({ pricePerHour: 1, status: 1 });
// To get the Virtual Fields in Response
facilitySchema.set('toJSON', {
  virtuals: true,
  versionKey: false, // hides __v
});

const FacilitySchemaModel = mongoose.model('Facility', facilitySchema);
export default FacilitySchemaModel;
