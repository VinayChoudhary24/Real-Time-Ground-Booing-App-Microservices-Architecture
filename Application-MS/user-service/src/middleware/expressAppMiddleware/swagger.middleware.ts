import swagger from 'swagger-ui-express';
import fs from 'fs';
import path from 'path';
import express from 'express';
import { __dirname } from '../../utils/directory/dirname.util';

export const applySwaggerMiddleware = (app: express.Application): void => {
  // Load the swagger.json file
  // Load swagger.json at runtime
    let apiDocs = {}
    try {
  apiDocs = JSON.parse(fs.readFileSync(path.join(__dirname, '../../../docs/api/swagger.json'), 'utf8'));
} catch (err) {
  console.error("❌ Failed to load Swagger docs:", err);
}
  
  // Swagger UI route
    app.use('/api-docs', swagger.serve, swagger.setup(apiDocs));
  // app.use('/api-docs', swagger.serve, swagger.setup(swaggerJSONDocument));
}