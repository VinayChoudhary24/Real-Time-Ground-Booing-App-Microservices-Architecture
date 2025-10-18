import dayjs from 'dayjs';
import mongoose from 'mongoose';

/**
 * Promo Code functionality is a valuable addition — it gives merchants the ability to run promotions independent of facilities and can be applied at checkout across facilities, locations, or even user groups.
 */

const PROMOCODE_TYPES = {
  PERCENTAGE: 1,
  FLAT: 2,
};

const STATUS = {
  ACTIVE: 1,
  INACTIVE: 0,
  SUSPENDED: 2,
};

const PROMOCODE_SCOPE = {
  TIME_BASED: 1,
  STOCK_BASED: 2,
};

const promoCodeSchema = new mongoose.Schema(
  {
    merchantUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    locationIds: {
      type: [mongoose.Schema.Types.ObjectId],
    },
    facilityIds: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'Facility',
      required: [true, 'Facility must be selected'],
    },
    code: {
      type: String,
      required: [true, 'Promo code is required'],
      trim: true,
      uppercase: true,
      maxlength: [40, 'Promo code cannot exceed 40 characters'],
      match: [
        /^[A-Z0-9_]+$/,
        'Promo code must contain only uppercase letters, numbers, or underscores',
      ],
    },
    name: {
      type: String,
      default: '',
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
      trim: true,
      default: '',
    },
    promoCodeType: {
      type: Number,
      enum: {
        values: Object.values(PROMOCODE_TYPES),
        message: 'Invalid promo code type',
      },
      required: [true, 'promo code type is required'],
    },
    promoCodeValue: {
      type: Number,
      required: [true, 'Promo code value is required'],
      validate: {
        validator: function (this: any, value: number) {
          if (this.promoCodeType === PROMOCODE_TYPES.PERCENTAGE) {
            return value > 0 && value <= 100; // percentage must be between 0 and 100
          }
          return value > 0; // flat amount must be non-negative
        },
        message: 'Invalid discount value',
      },
    },
    promoCodeScope: {
      type: Number,
      enum: Object.values(PROMOCODE_SCOPE),
      required: true,
      default: PROMOCODE_SCOPE.TIME_BASED,
      description: 'Defines how promo code usage limits are applied',
    },
    // if scope is STOCK_BASED, we need number of Stocks i.e 1 stock = 1 booking
    stock: {
      type: Number,
      default: 0,
      validate: {
        validator: function (value: number) {
          // Skip validation if value is undefined/null (will use default)
          if (value == null) return true;

          // Additional checks for edge cases
          return Number.isFinite(value) && value >= 0;
        },
        message: 'stock value is not valid',
      },
    },
    maxPromocodeAmount: {
      type: Number,
      default: null,
      validate: {
        validator: (val: number) => !val || val > 0,
        message: 'Max promo code amount must be greater than 0',
      },
    },
    minBookingAmount: {
      type: Number,
      default: 0,
      validate: {
        validator: (val: number) => val >= 0,
        message: 'Min booking amount cannot be negative',
      },
    },
    // If time is not flexible, we will have slotsIds if selected else only facilityAvailibilityIds for days
    applicableDatesAndSlots: {
      type: [
        {
          facilityAvailabilityId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'FacilityAvailability',
            required: [true, 'Please select dates for promo code'],
          },
          slotIds: {
            type: [mongoose.Schema.Types.ObjectId],
            default: [],
          },
        },
      ],
      validate: {
        validator: function (value: any[]) {
          const ids = value.map((v) => v.facilityAvailabilityId?.toString());
          return ids.length === new Set(ids).size;
        },
        message: 'Duplicate facility Availability Id entries are not allowed',
      },
    },
    UserIds: {
      type: [mongoose.Schema.Types.ObjectId],
      default: [], // Empty = applicable to all
    },
    perUserLimit: {
      type: Number,
      default: 1, // e.g., each user can use it once
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    startDate: {
      type: Number,
      required: true,
    },
    endDate: {
      type: Number,
      required: true,
    },
    startTime: {
      type: String,
      default: '',
      match: /^(0?[1-9]|1[0-2]):[0-5][0-9]\s?(AM|PM)$/i,
    },
    endTime: {
      type: String,
      default: '',
      match: /^(0?[1-9]|1[0-2]):[0-5][0-9]\s?(AM|PM)$/i,
    },
    status: {
      type: Number,
      enum: Object.values(STATUS),
      default: STATUS.ACTIVE,
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
  { timestamps: false },
);

// before save
promoCodeSchema.pre('save', function (next) {
  this.updatedAt = dayjs().unix();
  if (this.isNew) {
    this.createdAt = dayjs().unix();
  }
  next();
});

// Pre-update middleware to update the updatedAt timestamp
promoCodeSchema.pre(['findOneAndUpdate', 'updateOne', 'updateMany'], function (next) {
  this.set({ updatedAt: dayjs().unix() });
  next();
});

// Indexes for high-performance lookups
promoCodeSchema.index({ merchantUserId: 1 });
promoCodeSchema.index({ code: 1 }, { unique: true });
promoCodeSchema.index({ merchantUserId: 1, status: 1 });
promoCodeSchema.index({ startDate: 1, endDate: 1 });
promoCodeSchema.index({ UserIds: 1 });

// Compound Indexes for Performance
promoCodeSchema.index({ merchantUserId: 1, isActive: 1, status: 1 }); // Merchant active promos
promoCodeSchema.index({ promoCodeType: 1, isActive: 1 }); // Type-based queries

// To get the Virtual Fields in Response
promoCodeSchema.set('toJSON', {
  virtuals: true,
  versionKey: false, // hides __v
  //   transform: function (doc, ret) {
  //     delete ret.id; // hides the virtual 'id'
  //     return ret;
  //   },
});

const PromoCodeSchemaModel = mongoose.model('PromoCode', promoCodeSchema);
export default PromoCodeSchemaModel;
