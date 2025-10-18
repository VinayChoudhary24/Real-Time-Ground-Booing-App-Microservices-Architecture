import express, { Application, Request, Response } from 'express';
// import session from 'express-session';
import dotenv from 'dotenv';
import router from './routes/index';
import { applyParsingMiddleware } from './middleware/expressAppMiddlewares/parser.middleware';
import { applySecurityMiddleware } from './middleware/expressAppMiddlewares/security.middleware';
import { applySwaggerMiddleware } from './middleware/expressAppMiddlewares/swagger.middleware';
import { notFoundMiddleware } from './middleware/error/notFound.middleware';
import { errorHandlerMiddleware } from './middleware/error/error.middleware';
import healthCheckRouter from './routes/health/health'

// Load environment variables from .env
dotenv.config();

const app: Application = express();

// ------------------ Middleware Stack ------------------ //
applyParsingMiddleware(app);
applySecurityMiddleware(app);
//   // Create global proxy instance
// const globalProxy = createGlobalProxy({
//   target: 'http://localhost:6069',
//   timeout: 10000,
//   maxSockets: 100,
//   maxFreeSockets: 20
// });

// // Apply global proxy middleware
// app.use(globalProxy.getMiddleware());

// // Health check endpoint (not proxied)
// app.get('/health', (req, res) => {
//   globalProxy.healthCheck(req, res);
// });
applySwaggerMiddleware(app);

// ------------------ Health Check ------------------ //
app.use('/api/health', healthCheckRouter);

// ------------------ Mount Routes ------------------ //
app.use(router);

// ------------------ 404 Handler ------------------ //
app.use(notFoundMiddleware);

// ------------------ Error Handler ------------------ //
app.use(errorHandlerMiddleware);

export default app;
