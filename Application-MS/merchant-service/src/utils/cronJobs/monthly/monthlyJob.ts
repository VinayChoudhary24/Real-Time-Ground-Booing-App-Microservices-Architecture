import { jobsLogger } from '../../logs/logger.util';

export const monthlyJobHandler = async () => {
  try {
    // Your monthly job logic here
    console.log('Running Merchant monthly job...');

    // Log success
    jobsLogger.info('Merchant Monthly job executed successfully', {
      jobName: 'monthlyJob',
      status: 'success',
    });
  } catch (err: any) {
    // Log failure
    jobsLogger.error('Merchant Monthly job failed', {
      jobName: 'monthlyJob',
      status: 'failure',
      stack: err.stack,
      errorMessage: err.message,
    });
    throw err; // important: rethrow so BullMQ marks the job as failed
  }
};
