import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import earthquakeRoutes from './routes/earthquakeRoutes.js';
import mapRoutes from './routes/mapRoutes.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/earthquakes', earthquakeRoutes);
app.use('/map', mapRoutes);

export default app;