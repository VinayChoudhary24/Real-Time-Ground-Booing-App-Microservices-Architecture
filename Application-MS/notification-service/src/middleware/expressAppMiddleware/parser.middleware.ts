import express from 'express';

export const applyParsingMiddleware = (app: express.Application): void => {
  // Parse JSON bodies
  app.use(express.json({ type: 'application/json', limit: '20mb' }));
  // app.use(express.json());

  // Parse URL-encoded data
  app.use(express.urlencoded({ limit: '20mb', extended: true, parameterLimit: 50000 }));
  // app.use(express.urlencoded({ extended: true }));
};
