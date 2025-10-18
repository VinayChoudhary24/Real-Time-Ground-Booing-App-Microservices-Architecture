import express, { Application, Request, Response } from 'express';
// import session from 'express-session';
import FacilityRoutes from './features/facility/routes/facility.routes';
import FacilityAvailabilityRoutes from './features/facilityAvailability/routes/facilityAvailability.routes';
import DiscountRoutes from './features/discount/routes/discount.routes';
import AcademyRoutes from './features/academy/routes/academy.routes';
import PlayerRoutes from './features/academy/player/routes/player.routes';
import CoachRoutes from './features/academy/coach/routes/coach.routes';
import BatchRoutes from './features/academy/batch/routes/batch.routes';
import { applyParsingMiddleware } from './middleware/expressAppMiddleware/parser.middleware';
import { applySecurityMiddleware } from './middleware/expressAppMiddleware/security.middleware';
import { applySwaggerMiddleware } from './middleware/expressAppMiddleware/swagger.middleware';
import { errorHandlerMiddleware } from './middleware/error/errorHandler.middleware';
import { notFoundMiddleware } from './middleware/error/notFound.middleware';
import healthCheckRouter from './config/health/health';
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

// ------------------ Redis-Bull Board ------------------ //
const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath('/admin/queues');
createBullBoard({
  queues: [new BullMQAdapter(cronQueue)],
  serverAdapter,
});
app.use('/admin/queues', serverAdapter.getRouter());

// ------------------ Mount Routes ------------------ //
app.use(FacilityRoutes);
app.use(FacilityAvailabilityRoutes);
app.use(DiscountRoutes);
// app.use(PromocodeRoutes);
app.use(AcademyRoutes);
app.use(PlayerRoutes);
app.use(CoachRoutes);
app.use(BatchRoutes);

// ------------------ 404 Handler ------------------ //
app.use(notFoundMiddleware);

// ------------------ Error Handler ------------------ //
app.use(errorHandlerMiddleware);

export default app;
