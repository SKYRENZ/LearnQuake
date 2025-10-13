import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import earthquakeRoutes from './routes/earthquakeRoutes.js';
import mapRoutes from './routes/mapRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from parent directory
dotenv.config({ path: join(__dirname, '..', '.env') });

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/earthquakes', earthquakeRoutes);
// allow both local "/map" and Netlify "/.netlify/functions/map"
app.use('/map', mapRoutes);
app.use('/.netlify/functions/map', mapRoutes);

export default app;