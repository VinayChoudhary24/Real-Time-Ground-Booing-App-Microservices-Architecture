import dayjs from 'dayjs';
import mongoose from 'mongoose';
import validator from 'validator';

// Location Status Constants
const INACTIVE = 0;
const ACTIVE = 1;
const SUSPENDED = 2;

// Address Schema
const addressSchema = new mongoose.Schema(
  {
    addressLine: {
      type: String,
      required: [true, 'address is required'],
    },
    addressLineTwo: {
      type: String,
      default: '',
    },
    city: {
      type: String,
      required: [true, 'City is required'],
    },
    state: {
      type: String,
      required: [true, 'State is required'],
    },
    country: {
      type: String,
      required: [true, 'Country is required'],
    },
    postalCode: {
      type: String,
      required: [true, 'Postal code is required'],
    },
    coordinates: {
      latitude: {
        type: Number,
      },
      longitude: {
        type: Number,
      },
    },
  },
  { _id: false },
);

const merchantLocationSchema = new mongoose.Schema(
  {
    merchantUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MerchantUser',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'location name is required'],
      trim: true,
      maxLength: [100, "location name can't exceed 100 characters"],
      minLength: [2, 'location name should have at least 2 characters'],
    },
    address: addressSchema,
    description: {
      type: String,
      trim: true,
      maxLength: [500, "description can't exceed 500 characters"],
    },
    phoneCode: {
      type: String,
      required: [true, 'Phone code is required'],
    },
    phone: {
      type: String,
      required: [true, 'location number is required'],
      validate: {
        validator: validator.isMobilePhone,
        message: 'Please enter a valid phone number',
      },
    },
    email: {
      type: String,
      validate: [validator.isEmail, 'please enter a valid email'],
    },
    status: {
      type: Number,
      enum: {
        values: [ACTIVE, INACTIVE, SUSPENDED],
      },
      default: ACTIVE,
    },
    locationImage: {
      public_id: {
        type: String,
        default: '',
      },
      url: {
        type: String,
        default: '',
      },
    },
    website: {
      type: String,
      trim: true,
      validate: [validator.isURL, 'website URL format is invalid'],
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

// Virtual for full address
merchantLocationSchema.virtual('fullAddress').get(function () {
  const addr: any = this.address;
  return `${addr.addressLine}${addr.addressLineTwo ? ', ' + addr.addressLineTwo : ''}, ${addr.city}, ${addr.state}, ${addr.postalCode}, ${addr.country}`;
});

merchantLocationSchema.virtual('mobile').get(function () {
  return `${this.phoneCode}${this.phone}`;
});

// before save
merchantLocationSchema.pre('save', function (next) {
  this.updatedAt = dayjs().unix();
  if (this.isNew) {
    this.createdAt = dayjs().unix();
  }
  next();
});

// Pre-update middleware to update the updatedAt timestamp
merchantLocationSchema.pre(['findOneAndUpdate', 'updateOne', 'updateMany'], function (next) {
  this.set({ updatedAt: dayjs().unix() });
  next();
});

// Indexes for better query performance
merchantLocationSchema.index({ name: 'text' });
// merchantLocationSchema.index({ name: 1 });
merchantLocationSchema.index({ email: 1 });
merchantLocationSchema.index({ phone: 1 });
merchantLocationSchema.index({ merchantUserId: 1, status: 1 });
merchantLocationSchema.index({ _id: 1, merchantUserId: 1 });
merchantLocationSchema.index({ createdAt: -1 }); // For listing

merchantLocationSchema.index({ email: 1, merchantUserId: 1 });
merchantLocationSchema.index({ phone: 1, merchantUserId: 1 });

// LOCATION SEARCH INDEXES - Based on ESR (Equality, Sort, Range) rule
merchantLocationSchema.index({ 'address.addressLine': 1 });
merchantLocationSchema.index({ 'address.addressLineTwo': 1 });
merchantLocationSchema.index({ 'address.city': 1 });
merchantLocationSchema.index({ 'address.state': 1 });
merchantLocationSchema.index({ 'address.postalCode': 1 });

// Compound indexes for common search patterns
merchantLocationSchema.index({ 'address.city': 1, name: 1 });
merchantLocationSchema.index({ 'address.city': 1, 'address.state': 1 });

// Geospatial index for location-based queries
merchantLocationSchema.index({ 'address.coordinates': '2dsphere' });

// index for full search across address fields
merchantLocationSchema.index({
  'address.city': 1,
  'address.state': 1,
  'address.postalCode': 1,
});
// merchantLocationSchema.index({
//   name: 'text',
//   'address.city': 'text',
// });

merchantLocationSchema.set('toJSON', {
  virtuals: true,
  versionKey: false, // hides __v
  transform: function (doc, ret) {
    delete ret.id; // hides the virtual 'id'
    return ret;
  },
});

const MerchantLocationModel = mongoose.model('MerchantLocation', merchantLocationSchema);
export default MerchantLocationModel;
