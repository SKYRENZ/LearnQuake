import './config/loadEnv.js';
import express from 'express';
import serverless from 'serverless-http';
import cors from 'cors';
import earthquakeRoutes from './routes/earthquakeRoutes.js';
import mapRoutes from './routes/mapRoutes.js';
import footageRoutes from './routes/footageRoutes.js';
import newsRoutes from './routes/newsRoutes.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes - adjusted for Netlify Functions base path
app.use('/api/earthquakes', earthquakeRoutes);
app.use('/map', mapRoutes);
app.use('/api/footage', footageRoutes);
app.use('/api/news', newsRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({
    message: 'LearnQuake API is running on Netlify',
    endpoints: {
      earthquakes: '/api/earthquakes',
      map: '/map',
      footage: '/api/footage',
      news: '/api/news',
    },
  });
});

// Export for Netlify Functions
export const handler = serverless(app);