// cron.scheduler.ts
import { cronQueue } from '../redisCronQueue/cron.queue';

export const scheduleCronJobs = async () => {
  try {
    // ## CLearing Logic Can be Removed alter when REAL Jobs are added
    // 1Get all existing repeatable jobs
    const repeatableJobs = await cronQueue.getRepeatableJobs();

    // Remove each one
    for (const job of repeatableJobs) {
      await cronQueue.removeRepeatableByKey(job.key);
    }

    console.log('Cleared all previous repeatable jobs');

    // 3Schedule fresh jobs with fixed jobId
    // Daily job: everyday at 00:00 / 12:00 AM
    await cronQueue.add(
      'dailyJob',
      {},
      {
        repeat: { pattern: '0 0 * * *' },
        jobId: 'dailyJobMerchant',
        attempts: 3, // retry up to 3 times
        backoff: {
          type: 'exponential', // can also be 'fixed'
          delay: 10000, // 10 seconds delay before retry
        },
        removeOnComplete: true,
        removeOnFail: false, // keep failed jobs for inspection
      },
    );

    // Weekly job: every Monday at 01:00
    await cronQueue.add(
      'weeklyJob',
      {},
      { repeat: { pattern: '0 1 * * 1' }, jobId: 'weeklyJobMerchant' },
    );

    // Monthly job: 1st of every month at 02:00
    await cronQueue.add(
      'monthlyJob',
      {},
      { repeat: { pattern: '0 2 1 * *' }, jobId: 'monthlyJobMerchant' },
    );

    console.log('Scheduled all new repeatable jobs successfully');
  } catch (err) {
    console.error('Failed to schedule cron jobs:', err);
  }
};
