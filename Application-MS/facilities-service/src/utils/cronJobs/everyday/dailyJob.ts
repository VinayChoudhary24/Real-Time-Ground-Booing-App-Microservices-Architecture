import { jobsLogger } from '../../logs/logger.util';
import dayjs from 'dayjs';

export const dailyJobHandler = async (context?: {
  jobId?: string | undefined;
  runAtUnix?: number | undefined;
}) => {
  const runAtUnix = context?.runAtUnix ?? dayjs().unix();
  try {
    console.log('Running Facility daily job...');
    // ... job logic goes here ...

    jobsLogger.info('Facility Daily job executed successfully', {
      jobName: 'dailyJob',
      status: 'completed',
      runAtUnix,
    });
  } catch (err: any) {
    jobsLogger.error('Facility Daily job failed', {
      jobName: 'dailyJob',
      status: 'failed',
      runAtUnix,
      errorMessage: err.message,
      stack: err.stack,
    });
    throw err;
  }
};
