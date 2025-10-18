import dayjs from 'dayjs';

export const generateBookingObject = ({
  userId,
  userData,
  facilityAvailability,
  facility,
  merchantWithLocation,
  subTotalAmount,
  taxes,
  totalAmount,
  promoCode = {},
  discount = {},
  //   specialRequests = '',
  //   addOns = [],
}: any): any => {
  const location = merchantWithLocation.locations.find(
    (loc: any) => loc._id.toString() === facility.locationId.toString(),
  );

  const bookingObject = {
    // User Info
    userId,
    userDetails: {
      firstName: userData.firstName || '',
      lastName: userData.lastName || '',
      email: userData.email || '',
      phone: userData.phone || '',
      phoneCode: userData.phoneCode || '',
    },

    // Merchant Info
    merchantUserId: facility.merchantUserId,
    merchantDetails: {
      email: merchantWithLocation.email || '',
      phone: merchantWithLocation.phone || '',
      phoneCode: userData.phoneCode || '',
    },

    // Location Info
    locationId: facility.locationId,
    locationDetails: {
      name: location?.name || '',
      address: {
        addressLine: location?.address?.addressLine || '',
        addressLineTwo: location?.address?.addressLineTwo || '',
        city: location?.address?.city || '',
        state: location?.address?.state || '',
        country: location?.address?.country || '',
        postalCode: location?.address?.postalCode || '',
        coordinates: {
          latitude: location?.address?.coordinates?.latitude || 0,
          longitude: location?.address?.coordinates?.longitude || 0,
        },
      },
      phone: location?.phone || '',
      phoneCode: userData.phoneCode || '',
      email: merchantWithLocation.email || '',
    },

    // Facility Info
    facilityId: facility._id,
    facilityDetails: {
      name: facility.name || '',
      type: facility.type || 2,
      sport: facility.sport || [],
      description: facility.description || '',
      images: facility.images || [],
      isTimeFlexible: facility.isTimeFlexible || true,
    },

    // Booking Info
    booking: {
      facilityAvailabilityId: facilityAvailability._id,
      facilityAvailabilityDetails: {
        facilityId: facilityAvailability.facilityId,
        date: facilityAvailability.date || 0,
        day: facilityAvailability.day || '',
        isActive: facilityAvailability.isActive || true,
      },
      slots: facilityAvailability.slots || [],
    },

    subTotalAmount,
    taxes,
    totalAmount,
    promoCode,
    discount,

    // Timestamps
    _createdAtDate: new Date(),
    createdAt: dayjs().unix(),
    updatedAt: dayjs().unix(),
  };

  return bookingObject;
};
