import mongoose from 'mongoose';
import dayjs from 'dayjs';

const userSessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
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

userSessionSchema.index({ userId: 1 });
userSessionSchema.index({ isActive: 1 });
userSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
// merchantSessionSchema.index({ createdAt: 1 }); // Optional
userSessionSchema.index({ userId: 1, isActive: 1 });

const UserSessionModel = mongoose.model('UserSession', userSessionSchema);
export default UserSessionModel;
