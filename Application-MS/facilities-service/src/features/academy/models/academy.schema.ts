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

const academySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'academy name is required'],
      trim: true,
    },
    sport: {
      type: [Number],
      required: [true, 'academy sport is required'],
      enum: {
        values: Object.values(SPORTS),
        message: 'Invalid sport type',
      },
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
academySchema.pre('save', function (next) {
  this.updatedAt = dayjs().unix();
  if (this.isNew) {
    this.createdAt = dayjs().unix();
  }
  next();
});

// Pre-update middleware to update the updatedAt timestamp
academySchema.pre(['findOneAndUpdate', 'updateOne', 'updateMany'], function (next) {
  this.set({ updatedAt: dayjs().unix() });
  next();
});

academySchema.index({ sport: 1, status: 1 });
academySchema.index({ facilityId: 1, status: 1 });
academySchema.index({ name: 'text', description: 'text' });
academySchema.index({ merchantUserId: 1, locationId: 1, status: 1 });

// To get the Virtual Fields in Response
academySchema.set('toJSON', {
  virtuals: true,
  versionKey: false, // hides __v
});

const AcademySchemaModel = mongoose.model('Academy', academySchema);
export default AcademySchemaModel;
