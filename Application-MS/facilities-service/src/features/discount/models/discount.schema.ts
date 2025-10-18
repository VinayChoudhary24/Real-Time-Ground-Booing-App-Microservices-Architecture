import dayjs from 'dayjs';
import mongoose from 'mongoose';

const DISCOUNT_TYPES = {
  PERCENTAGE: 1,
  FLAT: 2,
};

const STATUS = {
  ACTIVE: 1,
  INACTIVE: 0,
  SUSPENDED: 2,
};

const DISCOUNT_SCOPE = {
  TIME_BASED: 1,
  STOCK_BASED: 2,
};

const discountSchema = new mongoose.Schema(
  {
    merchantUserId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    locationId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    facilityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Facility',
      required: [true, 'Facility must be selected'],
    },
    name: {
      type: String,
      required: [true, 'discount name is required'],
      trim: true,
      maxlength: [50, 'discount name cannot exceed 50 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'description cannot exceed 1000 characters'],
    },
    discountType: {
      type: Number,
      enum: {
        values: Object.values(DISCOUNT_TYPES),
        message: 'Invalid discount type',
      },
      required: [true, 'discount type is required'],
    },
    discountValue: {
      type: Number, // percentage value (0-100) or flat amount
      required: [true, 'discount value is required'],
      //   validate percentage or flat values are valid
      validate: {
        validator: function (this: any, value: number) {
          if (this.discountType === DISCOUNT_TYPES.PERCENTAGE) {
            return value > 0 && value <= 100; // percentage must be between 0 and 100
          }
          return value > 0; // flat amount must be non-negative
        },
        message: 'Invalid discount value',
      },
    },
    discountScope: {
      type: Number,
      enum: Object.values(DISCOUNT_SCOPE),
      required: true,
      default: DISCOUNT_SCOPE.TIME_BASED,
      description: 'Defines how discount usage limits are applied',
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
    minimumBookingAmount: {
      type: Number,
      default: 0,
    },
    // Maximum discount amount (useful for percentage discounts)
    maxDiscountAmount: {
      type: Number,
      validate: {
        validator: function (value: number) {
          return !value || value > 0;
        },
        message: 'max discount amount must be positive',
      },
    },
    // If time is not flexible, we will have slotsIds if selected else only facilityAvailibilityIds for days
    applicableDatesAndSlots: {
      type: [
        {
          facilityAvailabilityId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'FacilityAvailability',
            required: [true, 'Please select dates for discount'],
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
    startDate: {
      type: Number,
      required: true,
    },
    endDate: {
      type: Number,
      required: true,
    },
    // If Facility has Flexible Time we allow merchant to have start and end Time to allow discount on Specific hours
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
    isActive: {
      type: Boolean,
      default: true,
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
  {
    timestamps: false,
  },
);

// before save
discountSchema.pre('save', function (next) {
  this.updatedAt = dayjs().unix();
  if (this.isNew) {
    this.createdAt = dayjs().unix();
  }
  next();
});

// Pre-update middleware to update the updatedAt timestamp
discountSchema.pre(['findOneAndUpdate', 'updateOne', 'updateMany'], function (next) {
  this.set({ updatedAt: dayjs().unix() });
  next();
});

discountSchema.index({ merchantUserId: 1, status: 1 });
// To prevent duplicate discount names under a location
// discountSchema.index({ name: 1, locationId: 1 }, { unique: true });
// Prevent duplication of discount name under a merchant
// discountSchema.index({ name: 1, merchantUserId: 1 }, { unique: true });
discountSchema.index({ status: 1 });

discountSchema.index({ endDate: 1, status: 1 });

discountSchema.index({
  facilityIds: 1,
  startDate: 1,
  endDate: 1,
  status: 1,
});

discountSchema.index({
  merchantUserId: 1,
  locationId: 1,
  status: 1,
});

// To get the Virtual Fields in Response
discountSchema.set('toJSON', {
  virtuals: true,
  versionKey: false, // hides __v
  //   transform: function (doc, ret) {
  //     delete ret.id; // hides the virtual 'id'
  //     return ret;
  //   },
});

const DiscountSchemaModel = mongoose.model('Discount', discountSchema);
export default DiscountSchemaModel;
