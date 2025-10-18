import { RedisOptions } from 'ioredis';
import { appConfig } from '../appConfig';

const REDIS_HOST = (appConfig.host as string) || '127.0.0.1';
const REDIS_PORT = Number(process.env.REDIS_PORT) || 6379;

export const redisConfig: RedisOptions = {
  host: REDIS_HOST, // or process.env.REDIS_HOST
  port: REDIS_PORT, // default Redis port
  maxRetriesPerRequest: null,
};
