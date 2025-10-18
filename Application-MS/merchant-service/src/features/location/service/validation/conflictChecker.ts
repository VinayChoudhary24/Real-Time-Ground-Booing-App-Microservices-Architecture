import { ErrorHandler } from '../../../../utils/errors/errorHandler.util';
import MerchantUserModel from '../../../merchantUser/models/merchantUser.schema';
import MerchantLocationModel from '../../models/location.schema';

interface ConflictCheckOptions {
  phone?: string;
  email?: string;
  merchantUserId: string;
}

export const validatePhoneEmailConflicts = async ({
  phone,
  email,
  merchantUserId,
}: ConflictCheckOptions): Promise<void> => {
  const merchantUserConflicts: any[] = [];
  const locationConflicts: any[] = [];

  // Build conflict conditions for MerchantUser
  // ----------------------------------------------
  // This array will hold conflict filters for checking existing merchant users
  // with the same phone or email, excluding the current merchant (by _id).
  if (phone) {
    merchantUserConflicts.push({ phone, _id: { $ne: merchantUserId } });
    locationConflicts.push({ phone, merchantUserId: { $ne: merchantUserId } });
  }

  // Build conflict conditions for MerchantLocation
  // ----------------------------------------------
  // This array will hold filters for checking if any other location
  // (belonging to a different merchant) uses the same phone or email.
  if (email) {
    merchantUserConflicts.push({ email, _id: { $ne: merchantUserId } });
    locationConflicts.push({ email, merchantUserId: { $ne: merchantUserId } });
  }

  const conflictChecks = [
    merchantUserConflicts.length > 0
      ? MerchantUserModel.findOne({ $or: merchantUserConflicts }).select('_id phone email').lean()
      : Promise.resolve(null),
    locationConflicts.length > 0
      ? MerchantLocationModel.findOne({ $or: locationConflicts }).select('_id phone email').lean()
      : Promise.resolve(null),
  ];

  const [conflictingUser, conflictingLocation] = await Promise.all(conflictChecks);

  if (conflictingUser || conflictingLocation) {
    const conflictType = conflictingUser ? 'merchant' : 'location';
    const conflictingField =
      conflictingUser?.phone === phone || conflictingLocation?.phone === phone ? 'phone' : 'email';

    throw new ErrorHandler(400, `${conflictingField} is already used by another ${conflictType}.`);
  }
};
