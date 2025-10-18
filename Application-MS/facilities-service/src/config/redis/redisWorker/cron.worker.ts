import { Worker } from 'bullmq';
import { dailyJobHandler } from '../../../utils/cronJobs/everyday/dailyJob';
import { weeklyJobHandler } from '../../../utils/cronJobs/weekly/weeklyJob';
import { monthlyJobHandler } from '../../../utils/cronJobs/monthly/monthlyJob';
import { redisConfig } from '../redisConnection';
import { consoleLogger } from '../../../utils/logs/logger.util';

let cronWorker: Worker | null = null;
export const startCronWorker = () => {
  if (cronWorker) return; // already started
  cronWorker = new Worker(
    'cron-jobs',
    async (job) => {
      switch (job.name) {
        case 'dailyJob':
          await dailyJobHandler();
          break;
        case 'weeklyJob':
          await weeklyJobHandler();
          break;
        case 'monthlyJob':
          await monthlyJobHandler();
          break;
      }
    },
    { connection: redisConfig },
  );
  cronWorker.on('completed', (job) => {
    consoleLogger.info({ job: job.name, status: 'completed' });
  });
  cronWorker.on('failed', (job, err) => {
    consoleLogger.error({ job: job?.name, error: err.message });
  });
  consoleLogger.info({ status: 'Facility Cron worker started' });
};
export const stopCronWorker = async () => {
  if (!cronWorker) return;
  await cronWorker.close();
  cronWorker = null;
  consoleLogger.info({ status: 'Facility Cron worker stopped' });
};
