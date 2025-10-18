import mongoose from 'mongoose';
import { consoleLogger } from '../../utils/logs/logger.util';
import { appConfig } from '../appConfig/app.config';
import dotenv from 'dotenv';
import UserModel from '../../features/user/models/user.schema';

// Load environment variables from .env
dotenv.config();

export const connectDB = async () => {
  try {
    const mongo_URI = appConfig.mongoURI || process.env.mongoURI;
    const url = mongo_URI as string;
    const res = await mongoose.connect(url);
    consoleLogger.debug({
      MongoDB: `mongodb connected with user server ${res.connection.host}`,
    });

    // Sync Indexes on Startup
    await UserModel.syncIndexes();
  } catch (error) {
    consoleLogger.error({
      MongoDB: 'user-service failed to establish connection with mongodb',
    });
    console.log(error);
  }
};
