import { jobsLogger } from '../../logs/logger.util';

export const weeklyJobHandler = async () => {
  try {
    // weekly job logic here
    console.log('Running Merchant weekly job...');

    // Log success
    jobsLogger.info('Merchant Weekly job executed successfully', {
      jobName: 'weeklyJob',
      status: 'success',
    });
  } catch (err: any) {
    // Log failure
    jobsLogger.error('Merchant Weekly job failed', {
      jobName: 'weeklyJob',
      status: 'failure',
      stack: err.stack,
      errorMessage: err.message,
    });
    throw err; // rethrow so BullMQ marks job as failed
  }
};
