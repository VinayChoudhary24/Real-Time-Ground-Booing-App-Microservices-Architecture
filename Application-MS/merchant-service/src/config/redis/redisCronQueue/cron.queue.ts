import { Queue } from 'bullmq';
import { redisConfig } from '../redisConnection';

export const cronQueue = new Queue('cron-jobs', {
  connection: redisConfig,
});
