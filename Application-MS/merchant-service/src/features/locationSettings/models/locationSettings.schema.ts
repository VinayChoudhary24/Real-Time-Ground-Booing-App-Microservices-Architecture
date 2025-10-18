import mongoose from 'mongoose';
import dayjs from 'dayjs';

const locationSettingsSchema = new mongoose.Schema(
  {
    locationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MerchantLocation',
      required: true,
    },
    // Feature toggles
    isBookingEnabled: {
      type: Boolean,
      default: true,
    },
    isPaymentEnabled: {
      type: Boolean,
      default: true,
    },
    // Auto-confirm bookings
    autoConfirmBookings: {
      type: Boolean,
      default: false,
    },
    // Created/Updated
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

// Pre-save/update hooks
locationSettingsSchema.pre('save', function (next) {
  this.updatedAt = dayjs().unix();
  if (this.isNew) {
    this.createdAt = dayjs().unix();
  }
  next();
});

locationSettingsSchema.pre(['findOneAndUpdate', 'updateOne', 'updateMany'], function (next) {
  this.set({ updatedAt: dayjs().unix() });
  next();
});

// Index for fast access
locationSettingsSchema.index({ locationId: 1 }, { unique: true });

locationSettingsSchema.set('toJSON', {
  virtuals: true,
  versionKey: false, // hides __v
  transform: function (doc, ret) {
    delete ret.id; // hides the virtual 'id'
    return ret;
  },
});

// Model export
const LocationSettingsModel = mongoose.model('LocationSettings', locationSettingsSchema);
export default LocationSettingsModel;
