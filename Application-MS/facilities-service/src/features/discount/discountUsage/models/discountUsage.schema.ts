import dayjs from 'dayjs';
import mongoose from 'mongoose';

const discountUsageSchema = new mongoose.Schema(
  {
    discountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Discount',
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    merchantUserId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    facilityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Facility',
    },
    locationId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    originalAmount: {
      type: Number,
      required: true,
    },
    discountAmount: {
      type: Number,
      required: true,
    },
    finalAmount: {
      type: Number,
      required: true,
    },
    usedAt: {
      type: Number,
      default: () => dayjs().unix(),
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
discountUsageSchema.pre('save', function (next) {
  this.updatedAt = dayjs().unix();
  if (this.isNew) {
    this.createdAt = dayjs().unix();
  }
  next();
});

// Pre-update middleware to update the updatedAt timestamp
discountUsageSchema.pre(['findOneAndUpdate', 'updateOne', 'updateMany'], function (next) {
  this.set({ updatedAt: dayjs().unix() });
  next();
});

discountUsageSchema.index({ discountId: 1 });
discountUsageSchema.index({ discountId: 1, userId: 1 }, { unique: true }); // One use per discount per user
discountUsageSchema.index({ merchantUserId: 1, userId: 1 });

discountUsageSchema.set('toJSON', {
  virtuals: true,
  versionKey: false, // hides __v
  //   transform: function (doc, ret) {
  //     delete ret.id; // hides the virtual 'id'
  //     return ret;
  //   },
});

const DiscountUsageSchemaModel = mongoose.model('DiscountUsageSchema', discountUsageSchema);
export default DiscountUsageSchemaModel;
