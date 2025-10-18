import { Queue } from 'bullmq';
import { redisConfig } from '../redisConnection';

export const cronQueue = new Queue('cron-jobs', {
  connection: redisConfig,
});

// export a scheduler instance so it can be awaited on startup
// let cronQueueScheduler: QueueScheduler | null = null;
// export const startCronQueueScheduler = async () => {
//   if (cronQueueScheduler) return;
//   cronQueueScheduler = new QueueScheduler('cron-jobs', { connection: redisConfig });
//   await cronQueueScheduler.waitUntilReady();
//   // optionally keep reference for graceful shutdown
// };

// export const stopCronQueueScheduler = async () => {
//   if (!cronQueueScheduler) return;
//   await cronQueueScheduler.close();
//   cronQueueScheduler = null;
// };
