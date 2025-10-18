import { jobsLogger } from '../../logs/logger.util';
import dayjs from 'dayjs';

export const weeklyJobHandler = async (context?: { jobId?: string; runAtUnix?: number }) => {
  const runAtUnix = context?.runAtUnix ?? dayjs().unix();

  try {
    console.log('Running Facility weekly job...');
    // ... weekly job logic goes here ...

    // Log success
    jobsLogger.info('Facility Weekly job executed successfully', {
      jobName: 'weeklyJob',
      status: 'completed',
      runAtUnix,
    });
  } catch (err: any) {
    // Log failure
    jobsLogger.error('Facility Weekly job failed', {
      jobName: 'weeklyJob',
      status: 'failed',
      runAtUnix,
      errorMessage: err.message,
      stack: err.stack,
    });
    throw err; // rethrow so BullMQ marks the job as failed
  }
};
