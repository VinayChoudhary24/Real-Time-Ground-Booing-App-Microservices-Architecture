import express, { Application, Request, Response } from 'express';
// import session from 'express-session';
import AuthRoutes from './features/auth/routes/auth.routes';
import UserRoutes from './features/user/routes/user.routes';
import { applyParsingMiddleware } from './middleware/expressAppMiddleware/parser.middleware';
import { applySecurityMiddleware } from './middleware/expressAppMiddleware/security.middleware';
import { applySwaggerMiddleware } from './middleware/expressAppMiddleware/swagger.middleware';
import { errorHandlerMiddleware } from './middleware/error/errorHandler.middleware';
import { notFoundMiddleware } from './middleware/error/notFound.middleware';
import healthCheckRouter from './config/health/health';

const app: Application = express();

// ------------------ Middleware Stack ------------------ //
applyParsingMiddleware(app);
applySecurityMiddleware(app);
applySwaggerMiddleware(app);

// ------------------ Health Check ------------------ //
app.use('/api/health', healthCheckRouter);

// ------------------ Mount Routes ------------------ //
app.use(AuthRoutes);
app.use(UserRoutes);
// ------------------ 404 Handler ------------------ //
app.use(notFoundMiddleware);

// ------------------ Error Handler ------------------ //
app.use(errorHandlerMiddleware);

export default app;
