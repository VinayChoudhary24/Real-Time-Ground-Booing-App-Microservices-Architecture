import { fileURLToPath } from 'url';
import path from 'path';

// // Polyfill for __dirname and with ESM Module fileURLToPath Works for Swagger 
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export { __dirname, __filename };