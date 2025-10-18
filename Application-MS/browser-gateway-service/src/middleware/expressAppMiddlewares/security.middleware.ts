import helmet from 'helmet';
import compression from 'compression';
import cors from 'cors';
import express from 'express';
import { corsOptions } from '../../utils/cors/cors.util';

export const applySecurityMiddleware = (app: express.Application): void => {
  // Set security HTTP headers
  app.use(helmet());
  
  // CORS
  app.use(cors(corsOptions));
  app.options('/{*splat}', cors(corsOptions)); // Explicitly handle preflight

  // Enable resources compression
  app.use(compression());
}