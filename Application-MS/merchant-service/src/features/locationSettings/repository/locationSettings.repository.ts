import mongoose from 'mongoose';
import { ErrorHandler } from '../../../utils/errors/errorHandler.util';
import LocationSettingsModel from '../models/locationSettings.schema';

export const createNewLocationSettingsRepo = async (locationId: any) => {
  try {
    await LocationSettingsModel.create({ locationId });
    // const locationSettings = new LocationSettingsModel({ locationId });
    // await locationSettings.save({ session: session ?? null });
    // console.log('LOCATION-SETTINGS', locationSettings);
    // return locationSettings;
  } catch (error: any) {
    if (error instanceof mongoose.Error || error instanceof ErrorHandler) {
      throw error;
    } else {
      throw new ErrorHandler(500, 'something went wrong while creating new merchant location');
    }
  }
};
