import dayjs from 'dayjs';
import { cronQueue } from '../redisCronQueue/cron.queue';
import mongoose from 'mongoose';
import { jobsLogger } from '../../../utils/logs/logger.util';

// Minimal schema, store metadata as raw object
const ScheduledJobLogSchema = new mongoose.Schema(
  {
    level: String,
    message: String,
    metadata: mongoose.Schema.Types.Mixed, // metadata stored here
    timestamp: Number,
  },
  { collection: 'ScheduledJobsLogs' },
);

const ScheduledJobLog = mongoose.model('ScheduledJobLog', ScheduledJobLogSchema);

/**
 * Retry failed jobs and recover missed daily, weekly, and monthly jobs.
 */
export const checkAndRecoverJobs = async () => {
  try {
    // -----------------------------
    // Retry all failed jobs
    // -----------------------------
    const failedJobs: any[] = await ScheduledJobLog.find({ 'metadata.status': 'failed' }).lean();
    for (const job of failedJobs) {
      const jobName = job.metadata?.jobName;
      const runAtUnix = job.metadata?.runAtUnix;
      if (!jobName || !runAtUnix) continue;

      jobsLogger.info('Re-running failed job', { jobName, runAtUnix });
      await cronQueue.add(jobName, { recovered: true, originalRunAtUnix: runAtUnix });
    }

    const now = dayjs();

    // -----------------------------
    // Recover daily job
    // -----------------------------
    const lastDaily: any = await ScheduledJobLog.findOne({
      'metadata.jobName': 'dailyJob',
      'metadata.status': 'completed',
    })
      .sort({ 'metadata.runAtUnix': -1 })
      .lean();

    const dailyScheduledUnix = now.startOf('day').add(15, 'minute').unix(); // daily at 00:15
    const dailyGrace = 15 * 60; // 15 minutes

    if (!lastDaily || lastDaily.metadata?.runAtUnix < dailyScheduledUnix - dailyGrace) {
      jobsLogger.warn('Detected missed daily run. Enqueuing recovery job.', {
        jobName: 'dailyJob',
        lastRunAtUnix: lastDaily?.metadata?.runAtUnix,
      });
      await cronQueue.add('dailyJob', { recovered: true, missed: true });
    } else {
      jobsLogger.info('Daily job already executed today. No recovery needed.', {
        jobName: 'dailyJob',
        lastRunAtUnix: lastDaily?.metadata?.runAtUnix,
      });
    }

    // -----------------------------
    // Recover weekly job
    // -----------------------------
    const lastWeekly: any = await ScheduledJobLog.findOne({
      'metadata.jobName': 'weeklyJob',
      'metadata.status': 'completed',
    })
      .sort({ 'metadata.runAtUnix': -1 })
      .lean();

    const weeklyScheduled = now.startOf('week').add(1, 'hour').unix(); // Monday 01:00
    const weeklyGrace = 30 * 60; // 30 minutes

    if (
      !lastWeekly ||
      (now.day() === 1 && lastWeekly.metadata?.runAtUnix < weeklyScheduled - weeklyGrace)
    ) {
      jobsLogger.warn('Detected missed weekly run. Enqueuing recovery job.', {
        jobName: 'weeklyJob',
        lastRunAtUnix: lastWeekly?.metadata?.runAtUnix,
      });
      await cronQueue.add('weeklyJob', { recovered: true, missed: true });
    } else {
      jobsLogger.info('Weekly job already executed this week. No recovery needed.', {
        jobName: 'weeklyJob',
        lastRunAtUnix: lastWeekly?.metadata?.runAtUnix,
      });
    }

    // -----------------------------
    // Recover monthly job
    // -----------------------------
    const lastMonthly: any = await ScheduledJobLog.findOne({
      'metadata.jobName': 'monthlyJob',
      'metadata.status': 'completed',
    })
      .sort({ 'metadata.runAtUnix': -1 })
      .lean();

    const monthlyScheduled = now.startOf('month').add(2, 'hour').unix(); // 1st day 02:00
    const monthlyGrace = 60 * 60; // 1 hour grace for longer monthly job

    if (
      !lastMonthly ||
      (now.date() === 1 && lastMonthly.metadata?.runAtUnix < monthlyScheduled - monthlyGrace)
    ) {
      jobsLogger.warn('Detected missed monthly run. Enqueuing recovery job.', {
        jobName: 'monthlyJob',
        lastRunAtUnix: lastMonthly?.metadata?.runAtUnix,
      });
      await cronQueue.add('monthlyJob', { recovered: true, missed: true });
    } else {
      jobsLogger.info('Monthly job already executed this month. No recovery needed.', {
        jobName: 'monthlyJob',
        lastRunAtUnix: lastMonthly?.metadata?.runAtUnix,
      });
    }

    jobsLogger.info('Job recovery check completed successfully');
  } catch (err: any) {
    jobsLogger.error('Job recovery process failed', { error: err.message, stack: err.stack });
  }
};
