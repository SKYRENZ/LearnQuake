import 'dotenv/config';
import express from 'express';
import serverless from 'serverless-http';
import cors from 'cors';
import earthquakeRoutes from './routes/earthquakeRoutes.js';
import mapRoutes from './routes/mapRoutes.js';
import footageRoutes from './routes/footageRoutes.js';
import newsRoutes from './routes/newsRoutes.js';

const app = express();
const router = express.Router();

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

app.get('/', healthCheck);
app.get('/.netlify/functions/map', healthCheck);

// Routes - adjusted for Netlify Functions base path
router.use('/api/earthquakes', earthquakeRoutes);
router.use('/map', mapRoutes);
router.use('/api/footage', footageRoutes);
router.use('/api/news', newsRoutes);

app.use('/.netlify/functions/map', router);
app.use('/', router);

// Export for Netlify Functions
export { app };
export const handler = serverless(app);