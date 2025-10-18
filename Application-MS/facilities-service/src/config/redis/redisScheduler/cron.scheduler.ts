// import { upsertScheduledJob } from '../../../features/scheduledJobs/service/scheduledJobsDB';
import { cronQueue } from '../redisCronQueue/cron.queue';

export const scheduleCronJobs = async () => {
  try {
    // // ## CLearing Logic Can be Removed alter when REAL Jobs are added
    // // 1Get all existing repeatable jobs
    // const repeatableJobs = await cronQueue.getRepeatableJobs();

    // // Remove each one
    // for (const job of repeatableJobs) {
    //   await cronQueue.removeRepeatableByKey(job.key);
    // }

    // console.log('Cleared all previous repeatable jobs');

    // ensure DB record exists for each repeatable job
    // await upsertScheduledJob({
    //   name: 'dailyJob',
    //   jobId: 'dailyJobFacility',
    //   schedulePattern: '0 0 * * *',
    //   meta: { description: 'Daily facility job' },
    // });

    // Daily job: everyday at 00:15 / 12:15 AM
    await cronQueue.add(
      'dailyJob',
      {},
      {
        repeat: { pattern: '0 0 * * *' },
        jobId: 'dailyJobFacility',
        attempts: 3,
        backoff: { type: 'exponential', delay: 10000 },
        removeOnComplete: true,
        removeOnFail: false,
      },
    );

    // Weekly
    // await upsertScheduledJob({
    //   name: 'weeklyJob',
    //   jobId: 'weeklyJobFacility',
    //   schedulePattern: '0 1 * * 1',
    // });

    // Weekly job: every Monday at 01:00
    await cronQueue.add(
      'weeklyJob',
      {},
      { repeat: { pattern: '0 1 * * 1' }, jobId: 'weeklyJobFacility' },
    );

    // monthly
    // await upsertScheduledJob({
    //   name: 'monthlyJob',
    //   jobId: 'monthlyJobzz',
    //   schedulePattern: '0 2 1 * *',
    // });

    // Monthly job: 1st of every month at 02:00
    await cronQueue.add(
      'monthlyJob',
      {},
      { repeat: { pattern: '0 2 1 * *' }, jobId: 'monthlyJobFacility' },
    );

    console.log('Scheduled all new repeatable jobs successfully');
  } catch (err) {
    console.error('Failed to schedule cron jobs:', err);
  }
};
