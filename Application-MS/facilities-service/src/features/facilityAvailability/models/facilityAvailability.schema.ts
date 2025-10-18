import dayjs from 'dayjs';
import mongoose from 'mongoose';

// Type of Interval
const SLOT = 1;
const MAINTENANCE = 2;
const ACADEMY = 3;

const slotSchema = new mongoose.Schema({
  startTime: {
    type: String,
    required: true,
    match: /^(0?[1-9]|1[0-2]):[0-5][0-9]\s?(AM|PM)$/i,
  },
  endTime: {
    type: String,
    required: true,
    match: /^(0?[1-9]|1[0-2]):[0-5][0-9]\s?(AM|PM)$/i,
  },
  price: {
    type: Number,
    default: 0,
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
  applicableDiscountIds: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'Discount',
    default: [],
  },
});

const facilityAvailabilitySchema = new mongoose.Schema(
  {
    facilityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Facility',
      required: true,
    },
    merchantUserId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    locationId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    date: {
      type: Number,
      required: true,
    },
    day: {
      type: String, // 'Monday'
      required: true,
    },
    discountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Discount',
      default: null,
    },
    pricePerHour: {
      type: Number,
      default: 0,
    },
    slots: {
      type: [slotSchema],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
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
facilityAvailabilitySchema.pre('save', function (next) {
  this.updatedAt = dayjs().unix();
  if (this.isNew) {
    this.createdAt = dayjs().unix();
  }
  next();
});

// Mongoose Middleware/Hook to keep updatedAt in Sync
// Pre-update middleware to update the updatedAt timestamp
facilityAvailabilitySchema.pre(['findOneAndUpdate', 'updateOne', 'updateMany'], function (next) {
  this.set({ updatedAt: dayjs().unix() });
  next();
});

// Fetch all slots for a facility on a specific date
facilityAvailabilitySchema.index({ facilityId: 1, date: 1 });
facilityAvailabilitySchema.index({ facilityId: 1, isActive: 1 });
facilityAvailabilitySchema.index({ date: 1, isActive: 1 });

facilityAvailabilitySchema.index({
  facilityId: 1,
  date: 1,
  isActive: 1,
});

// prevents accidental duplication for the same facility & date.
facilityAvailabilitySchema.index(
  { facilityId: 1, date: 1 },
  {
    unique: true,
    name: 'duplicate_facilityId_date_idx', // Explicit name to prevent auto-naming conflicts
    background: true, // Optional: builds index in the background to avoid blocking
  },
);

facilityAvailabilitySchema.index({
  'slots.isAvailable': 1,
  facilityId: 1,
  date: 1,
});

facilityAvailabilitySchema.index({
  'slots.startTime': 1,
  'slots.endTime': 1,
  facilityId: 1,
}); // Time-based slot queries

facilityAvailabilitySchema.index({
  'slots.price': 1,
  facilityId: 1,
  date: 1,
});

facilityAvailabilitySchema.index({
  'slots.startTime': 1,
  'slots.endTime': 1,
  'slots.isAvailable': 1,
  date: 1,
  isActive: 1,
});
facilityAvailabilitySchema.index({
  'slots.startTime': 1,
  'slots.endTime': 1,
  date: 1,
  isActive: 1,
});

// To get the Virtual Fields in Response
facilityAvailabilitySchema.set('toJSON', {
  virtuals: true,
  versionKey: false, // hides __v
  //   transform: function (doc, ret) {
  //     delete ret.id; // hides the virtual 'id'
  //     return ret;
  //   },
});

const FacilityAvailabilityModel = mongoose.model(
  'FacilityAvailability',
  facilityAvailabilitySchema,
);
export default FacilityAvailabilityModel;
