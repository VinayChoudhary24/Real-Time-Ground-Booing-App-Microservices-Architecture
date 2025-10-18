import mongoose from 'mongoose';
import dayjs from 'dayjs';

const merchantSessionSchema = new mongoose.Schema(
  {
    merchantUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MerchantUser',
      required: true,
    },
    userAgent: {
      type: String,
      default: '',
    },
    ipAddress: {
      type: String,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    expiresAt: {
      type: Date,
      required: true,
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

merchantSessionSchema.index({ merchantUserId: 1 });
merchantSessionSchema.index({ isActive: 1 });
merchantSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
// merchantSessionSchema.index({ createdAt: 1 }); // Optional
merchantSessionSchema.index({ merchantUserId: 1, isActive: 1 });

const MerchantSessionModel = mongoose.model('MerchantSession', merchantSessionSchema);
export default MerchantSessionModel;
