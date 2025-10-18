import { jobsLogger } from '../../logs/logger.util';
import dayjs from 'dayjs';

export const monthlyJobHandler = async (context?: { jobId?: string; runAtUnix?: number }) => {
  const runAtUnix = context?.runAtUnix ?? dayjs().unix();

  try {
    console.log('Running Facility monthly job...');
    // ... monthly job logic goes here ...

    // Log success
    jobsLogger.info('Facility Monthly job executed successfully', {
      jobName: 'monthlyJob',
      status: 'completed',
      runAtUnix,
    });
  } catch (err: any) {
    // Log failure
    jobsLogger.error('Facility Monthly job failed', {
      jobName: 'monthlyJob',
      status: 'failed',
      runAtUnix,
      errorMessage: err.message,
      stack: err.stack,
    });
    throw err; // rethrow so BullMQ marks the job as failed
  }
};
