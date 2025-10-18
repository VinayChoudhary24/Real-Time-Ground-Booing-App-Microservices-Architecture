import { jobsLogger } from '../../logs/logger.util';

export const dailyJobHandler = async () => {
  try {
    // job logic here
    console.log('Running Merchant daily job...');

    // Log success
    jobsLogger.info('Merchant Daily job executed successfully', {
      jobName: 'dailyJob',
      status: 'success',
    });
  } catch (err: any) {
    // Log failure
    jobsLogger.error('Merchant Daily job failed', {
      jobName: 'dailyJob',
      status: 'failure',
      stack: err.stack,
      errorMessage: err.message,
    });
    throw err; // important: rethrow so BullMQ marks job as failed
  }
};
