import mongoose from 'mongoose';
import { consoleLogger } from '../../utils/logs/logger.util';
import { appConfig } from '../appConfig/app.config';
import dotenv from 'dotenv';
import BookingSchemaModel from '../../features/booking/models/booking.schema';

// Load environment variables from .env
dotenv.config();

export const connectDB = async () => {
  try {
    const mongo_URI = appConfig.mongoURI || process.env.mongoURI;
    const url = mongo_URI as string;
    // consoleLogger.info({ MongoDB: "Connecting to DB..." });
    const res = await mongoose.connect(url);
    consoleLogger.debug({
      MongoDB: `mongodb connected with booking server ${res.connection.host}`,
    });

    // Sync Indexes on Startup
    await BookingSchemaModel.syncIndexes();
  } catch (error) {
    consoleLogger.error({
      MongoDB: 'booking-service failed to establish connection with mongodb',
    });
    console.log(error);
  }
};
