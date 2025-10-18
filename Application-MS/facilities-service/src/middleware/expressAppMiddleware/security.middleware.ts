import helmet from 'helmet';
import compression from 'compression';
import express from 'express';
import cookieParser from "cookie-parser";
import cors from 'cors';
import { corsOptions } from '../../utils/cors/cors.util';

export const applySecurityMiddleware = (app: express.Application): void => {
  // Set security HTTP headers
  app.use(helmet());
  app.use(cookieParser());

  app.use(cors(corsOptions));
  app.options('/{*splat}', cors(corsOptions)); // Explicitly handle preflight

  // Enable resources compression
  app.use(compression());
}