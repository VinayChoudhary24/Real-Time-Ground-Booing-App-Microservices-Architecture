import express, { Application, Request, Response } from 'express';
// import session from 'express-session';
import AuthRoutes from './features/auth/routes/auth.routes';
import MerchantUserRoutes from './features/merchantUser/routes/merchantUser.routes';
import LocationRoutes from './features/location/routes/location.routes';
import { applyParsingMiddleware } from './middleware/expressAppMiddleware/parser.middleware';
import { applySecurityMiddleware } from './middleware/expressAppMiddleware/security.middleware';
import { applySwaggerMiddleware } from './middleware/expressAppMiddleware/swagger.middleware';
import { errorHandlerMiddleware } from './middleware/error/errorHandler.middleware';
import { notFoundMiddleware } from './middleware/error/notFound.middleware';
import healthCheckRouter from './config/health/health';
// import { getRedis } from './config/redis/redisClient';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';
import { createBullBoard } from '@bull-board/api';
import { cronQueue } from './config/redis/redisCronQueue/cron.queue';

const app: Application = express();

// ------------------ Middleware Stack ------------------ //
applyParsingMiddleware(app);
applySecurityMiddleware(app);
applySwaggerMiddleware(app);

// ------------------ Health Check ------------------ //
app.use('/api/health', healthCheckRouter);

// ------------------ Redis Test Route --------------- //
// app.get('/api/redis-test', async (req, res) => {
//   const redis = getRedis();
//   await redis.set('hello', 'world', 'EX', 60); // expire in 60s
//   const value = await redis.get('hello');
//   res.json({ value });
// });
// ------------------ Bull Board ------------------ //
const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath('/admin/queues');
createBullBoard({
  queues: [new BullMQAdapter(cronQueue)],
  serverAdapter,
});
app.use('/admin/queues', serverAdapter.getRouter());

// ------------------ Mount Routes ------------------ //
app.use(AuthRoutes);
app.use(MerchantUserRoutes);
app.use(LocationRoutes);

// ------------------ 404 Handler ------------------ //
app.use(notFoundMiddleware);

// ------------------ Error Handler ------------------ //
app.use(errorHandlerMiddleware);

export default app;
