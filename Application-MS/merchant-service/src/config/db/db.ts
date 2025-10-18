import mongoose from 'mongoose';
import { consoleLogger } from '../../utils/logs/logger.util';
import { appConfig } from '../appConfig/app.config';
import dotenv from 'dotenv';
import MerchantLocationModel from '../../features/location/models/location.schema';
import MerchantUserModel from '../../features/merchantUser/models/merchantUser.schema';
import LocationSettingsModel from '../../features/locationSettings/models/locationSettings.schema';

// Load environment variables from .env
dotenv.config();

export const connectDB = async () => {
  try {
    const mongo_URI = appConfig.mongoURI || process.env.mongoURI;
    const url = mongo_URI as string;
    // consoleLogger.info({ MongoDB: "Connecting to DB..." });
    const res = await mongoose.connect(url);
    consoleLogger.debug({
      MongoDB: `mongodb connected with merchant server ${res.connection.host}`,
    });

    // Sync Indexes on Startup
    await MerchantUserModel.syncIndexes();
    await MerchantLocationModel.syncIndexes();
    await LocationSettingsModel.syncIndexes();
  } catch (error) {
    consoleLogger.error({
      MongoDB: 'merchant-service failed to establish connection with mongodb',
    });
    console.log(error);
  }
};
