import mongoose from 'mongoose';
import { consoleLogger } from '../../utils/logs/logger.util';
import { appConfig } from '../appConfig/app.config';
import dotenv from 'dotenv';
import FacilitySchemaModel from '../../features/facility/models/facility.schema';
import FacilityAvailabilityModel from '../../features/facilityAvailability/models/facilityAvailability.schema';
import DiscountSchemaModel from '../../features/discount/models/discount.schema';
import DiscountUsageSchemaModel from '../../features/discount/discountUsage/models/discountUsage.schema';

// Load environment variables from .env
dotenv.config();

export const connectDB = async () => {
  try {
    const mongo_URI = appConfig.mongoURI || process.env.mongoURI;
    const url = mongo_URI as string;
    // consoleLogger.info({ MongoDB: "Connecting to DB..." });
    const res = await mongoose.connect(url);
    consoleLogger.debug({
      MongoDB: `mongodb connected with facilities server ${res.connection.host}`,
    });

    // Sync Indexes on Startup
    await FacilitySchemaModel.syncIndexes();
    await FacilityAvailabilityModel.syncIndexes();
    await DiscountSchemaModel.syncIndexes();
    await DiscountUsageSchemaModel.syncIndexes();
  } catch (error) {
    consoleLogger.error({
      MongoDB: 'facilities-service failed to establish connection with mongodb',
    });
    console.log(error);
  }
};
