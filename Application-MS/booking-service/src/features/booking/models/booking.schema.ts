import mongoose from 'mongoose';
import dayjs from 'dayjs';
// import e from 'express';

// Booking status constants
const BOOKING_STATUS = {
  PENDING: 1, // Initial booking request
  CONFIRMED: 2, // Booking confirmed by system/merchant
  CANCELLED: 3, // Cancelled by user/merchant
  COMPLETED: 4, // Session completed
  NO_SHOW: 5, // User didn't show up
  REFUNDED: 6, // Payment refunded
  EXPIRED: 7, // Booking expired (auto-cancel)
};

// Booking types constants
const BOOKING_TYPE = {
  ONLINE: 1, // Online booking
  OFFLINE: 2, // In-person booking
  PHONE: 3, // Booking via phone call or WhatsApp
};

// Payment status constants
const PAYMENT_STATUS = {
  PENDING: 1, // Payment not initiated
  PROCESSING: 2, // Payment in progress
  COMPLETED: 3, // Payment successful
  FAILED: 4, // Payment failed
  REFUNDED: 5, // Payment refunded
  PARTIALLY_REFUNDED: 6, // Partial refund processed
};

// Cancellation type constants
const CANCELLATION_TYPE = {
  NO_CAN: 0, // default Value
  USER: 1, // User initiated
  MERCHANT: 2, // Merchant initiated
  SYSTEM: 3, // System initiated (auto-cancel)
  ADMIN: 4, // Admin initiated
};
const CancellationSchema = new mongoose.Schema(
  {
    cancelledBy: {
      type: Number,
      enum: Object.values(CANCELLATION_TYPE),
      default: CANCELLATION_TYPE.NO_CAN,
    },
    cancelledAt: { type: Number, default: 0 }, // UNIX timestamp
    reason: { type: String, default: '' },
    refundEligible: { type: Boolean, default: false },
    cancellationFee: { type: Number, default: 0, min: 0 },
    refundAmount: { type: Number, default: 0 },
  },
  { _id: false },
);

const AddOnSchema = new mongoose.Schema(
  {
    name: { type: String, default: '' },
    price: { type: Number, default: 0 },
    quantity: {
      type: Number,
      default: 0,
    },
  },
  { _id: false },
);

const CardInfoSchema = new mongoose.Schema(
  {
    last4: { type: String, default: '' }, // e.g., '4242'
    brand: { type: String, default: '' }, // e.g., 'Visa'
    cardType: { type: String, default: '' }, // 'credit' or 'debit'
    network: { type: String, default: '' }, // e.g., 'Visa', 'MasterCard'
    issuer: { type: String, default: '' }, // e.g., 'HDFC Bank'
    country: { type: String, default: '' }, // e.g., 'IN'
    nameOnCard: { type: String, default: '' }, // optional
  },
  { _id: false },
);

const bookingSchema = new mongoose.Schema(
  {
    // Who booked
    userId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    userDetails: {
      firstName: { type: String, trim: true, default: '' },
      lastName: { type: String, trim: true, default: '' },
      email: { type: String, lowercase: true, trim: true, default: '' },
      phone: { type: String, default: '' },
      phoneCode: { type: String, default: '' },
    },

    // Merchant metadata
    merchantUserId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    merchantDetails: {
      email: { type: String, lowercase: true, trim: true, default: '' },
      phone: { type: String, default: '' },
      phoneCode: { type: String, default: '' },
    },

    // Location metadata
    locationId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    locationDetails: {
      name: { type: String, trim: true, default: '' },
      address: {
        addressLine: { type: String, default: '' },
        addressLineTwo: { type: String, default: '' },
        city: { type: String, default: '' },
        state: { type: String, default: '' },
        country: { type: String, default: '' },
        postalCode: { type: String, default: '' },
        coordinates: {
          latitude: { type: Number, default: 0 },
          longitude: { type: Number, default: 0 },
        },
      },
      phone: { type: String, default: '' },
      phoneCode: { type: String, default: '' },
      email: { type: String, lowercase: true, trim: true, default: '' },
    },

    // Facility Metadata
    facilityId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    facilityDetails: {
      name: { type: String, trim: true, default: '' },
      type: { type: Number, default: 0 }, // SINGLE_PURPOSE, MULTI_PURPOSE
      sport: { type: [Number], default: [] },
      description: { type: String, default: '' },
      images: {
        type: [String],
        default: [],
      },
      isTimeFlexible: { type: Boolean, default: true },
    },

    // Booking details
    booking: {
      facilityAvailabilityId: {
        type: mongoose.Schema.Types.ObjectId,
      },
      facilityAvailabilityDetails: {
        facilityId: { type: mongoose.Schema.Types.ObjectId },
        date: { type: Number },
        day: { type: String },
        isActive: { type: Boolean },
      },
      slots: {
        type: [{}],
        required: [true, 'slots are required'],
      },
    },
    discount: {
      discountId: { type: mongoose.Schema.Types.ObjectId, default: null }, // Reference to a discount document
      discountdetails: {
        authorizedBy: { type: String, default: '' }, // Who created the discount
        discountName: { type: String, default: '' }, // Name of the discount
        discountCode: { type: String, default: '' }, // The actual discount code
        discountType: { type: String, default: '' }, // e.g., 'percentage or 'fixed'
        discountValue: { type: Number, default: 0 }, // e.g., 10 for 10%
        description: { type: String, default: '' }, // Description of the discount
        appliedAt: { type: Number, default: 0 }, // UNIX timestamp when discount was applied
        appliedBy: { type: String, default: '' }, // Who applied the discount
        isActive: { type: Boolean, default: true }, // Is the discount still active
      },
    },
    promoCode: {
      promoCodeId: { type: mongoose.Schema.Types.ObjectId, default: null }, // Reference to a promo code document
      promoCodeDetails: {
        authorizedBy: { type: String, default: '' }, // Who created the promo code
        promoCodeName: { type: String, default: '' }, // Name of the promo code
        promoCode: { type: String, default: '' }, // The actual promo code
        description: { type: String, default: '' }, // Description of the promo code
        promoCodeType: { type: String, default: '' }, // e.g., 'percentage' or 'fixed'
        promoCodeValue: { type: Number, default: 0 }, // e.g., 10 for 10%
        appliedAt: { type: Number, default: 0 }, // UNIX timestamp when promo code was applied
        appliedBy: { type: String, default: '' }, // Who applied the promo code
        isActive: { type: Boolean, default: true }, // Is the promo code still active
      },
    },
    subTotalAmount: {
      type: Number,
      required: [true, 'subTotalAmount is required'],
      min: [0, 'subTotalAmount must not be negative'],
    },
    refundedAmount: {
      type: Number,
      default: 0,
    },
    taxes: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalAmount: {
      type: Number,
      required: [true, 'totalAmount is required'],
      min: [0, 'totalAmount must not be negative'],
    },

    // Booking status
    bookingStatus: {
      type: Number,
      enum: Object.values(BOOKING_STATUS),
      default: BOOKING_STATUS.PENDING,
    },
    bookingType: {
      type: Number,
      enum: Object.values(BOOKING_TYPE),
      default: BOOKING_TYPE.ONLINE, // Default to online booking
    },

    // Payment info
    payment: {
      paymentId: { type: String, default: '' }, // External payment service ID
      status: {
        type: Number,
        enum: Object.values(PAYMENT_STATUS),
        default: PAYMENT_STATUS.PENDING, // Default to pending
      },
      method: { type: String, default: '' }, // 'card', 'upi', 'wallet', etc.
      gateway: { type: String, default: '' },
      paidAt: { type: Number, default: 0 }, // UNIX timestamp
      amountPaid: { type: Number, default: 0 },
      transaction: { type: [{}], default: [] },
      cardInfo: {
        type: CardInfoSchema,
        default: () => ({}),
      },
    },

    // Cancellation Details
    cancellation: {
      type: CancellationSchema,
      default: () => ({}),
    },

    // Additional Features
    specialRequests: {
      type: String,
      maxlength: 1000,
      default: '',
    },

    // Equipment or add-ons
    addOns: {
      type: [AddOnSchema],
      default: [],
    },

    // Rating and feedback (post-booking)
    feedback: {
      rating: {
        type: Number,
        max: 5,
        default: 0, // 0 means no rating given yet
      },
      comment: {
        type: String,
        maxlength: 2000,
        default: '',
      },
      submittedAt: { type: Number, default: 0 }, // Unix timestamp
    },

    // Booking timestamps
    // Date field specifically for TTL index
    _createdAtDate: {
      type: Date,
      default: Date.now,
      index: true,
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
bookingSchema.pre('save', function (next) {
  this.updatedAt = dayjs().unix();
  if (this.isNew) {
    this.createdAt = dayjs().unix();
  }
  next();
});

// Pre-update middleware to update the updatedAt timestamp
bookingSchema.pre(['findOneAndUpdate', 'updateOne', 'updateMany'], function (next) {
  this.set({ updatedAt: dayjs().unix() });
  next();
});

// Compound Indexes for Performance
bookingSchema.index({ userId: 1, bookingStatus: 1 }); // User's bookings by status
bookingSchema.index({ merchantUserId: 1, bookingStatus: 1 }); // Merchant's bookings by status
bookingSchema.index({ paymentStatus: 1, createdAt: 1 }); // Payment processing queries
bookingSchema.index({ createdAt: 1 }); // Recent bookings
bookingSchema.index({ userId: 1, createdAt: -1 });
// For user bookings sorted by most recent

bookingSchema.index({ merchantUserId: 1, createdAt: -1 });
// Merchant-level reports, listing, analytics

bookingSchema.index({ facilityId: 1, createdAt: 1 });
// For availability checks, historical views

bookingSchema.index({ locationId: 1, createdAt: 1 });
// All bookings at a location sorted by time

bookingSchema.index({ bookingStatus: 1, createdAt: -1 });
// For filtering bookings by status and recent activity

bookingSchema.index({ 'payment.paymentId': 1 });
// Look up booking via payment ID

bookingSchema.index({ 'payment.transaction.transactionId': 1 });
// Lookup based on transaction-level info

bookingSchema.index({ 'cancellation.cancelledAt': -1 });
// Reporting / filtering on cancelled bookings

bookingSchema.index({ 'feedback.rating': -1 });
// To support feedback analysis or fetching reviews

bookingSchema.index({ userId: 1, bookingStatus: 1, createdAt: -1 });
// Find active bookings for user, sorted by recent

// TTL Index for auto-cleanup of unpaid bookings after 15 minutes (900 seconds)
// Only applies to bookings with payment status PENDING, PROCESSING, or FAILED
bookingSchema.index(
  { _createdAtDate: 1 },
  {
    name: 'ttl_booking_cleanup',
    expireAfterSeconds: 900, // 15 minutes = 15 * 60 = 900 seconds
    partialFilterExpression: {
      'payment.status': {
        $in: [PAYMENT_STATUS.PENDING, PAYMENT_STATUS.PROCESSING, PAYMENT_STATUS.FAILED],
      },
    },
  },
);

// To get the Virtual Fields in Response
bookingSchema.set('toJSON', {
  virtuals: true,
  versionKey: false, // hides __v
});

const BookingSchemaModel = mongoose.model('Booking', bookingSchema);
export default BookingSchemaModel;
