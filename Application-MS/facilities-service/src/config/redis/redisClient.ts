import Redis from 'ioredis';
import { consoleLogger } from '../../utils/logs/logger.util';
import { appConfig } from '../appConfig';

const REDIS_HOST = (appConfig.host as string) || '127.0.0.1';
const REDIS_PORT = Number(process.env.REDIS_PORT) || 6379;

let redis: Redis;

export const connectRedis = () => {
  redis = new Redis({
    host: REDIS_HOST,
    port: REDIS_PORT,
    // password: process.env.REDIS_PASSWORD, // if enabled in redis.conf file in system
  });

  redis.on('connect', () => {
    consoleLogger.info({ service: 'Facility-Redis', status: 'connected' });
  });

  redis.on('error', (err) => {
    consoleLogger.error({ service: 'Facility-Redis', error: err.message });
  });

  return redis;
};

// ## Initialize Redis in Server.ts file

export const getRedis = () => {
  if (!redis) {
    throw new Error('Facility-Redis is not initialized. Call connectRedis() first.');
  }
  return redis;
};
