import 'dotenv/config';
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

// Health check
const healthCheck = (req, res) => {
  res.json({
    message: 'LearnQuake API is running on Netlify',
    endpoints: {
      earthquakes: '/api/earthquakes',
      map: '/map',
      footage: '/api/footage',
      news: '/api/news',
    },
  });
};

// Mount routes directly on app (Netlify strips the function path)
app.get('/', healthCheck);
app.use('/api/earthquakes', earthquakeRoutes);
app.use('/map', mapRoutes);
app.use('/api/footage', footageRoutes);
app.use('/api/news', newsRoutes);

// Also handle root path for the map function specifically
app.post('/', async (req, res, next) => {
  // If POST to root of this function, treat it as /map
  const { place, magnitude, areaCoverage, coordinates } = req.body;
  if (place && magnitude !== undefined) {
    req.url = '/map';
    return mapRoutes(req, res, next);
  }
  next();
});

// Export for Netlify Functions
export { app };
export const handler = serverless(app);