import 'dotenv/config';
import express from 'express';
import serverless from 'serverless-http';
import cors from 'cors';
import earthquakeRoutes from './routes/earthquakeRoutes.js';
import newsRoutes from './routes/newsRoutes.js';
import footageRoutes from './routes/footageRoutes.js';

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

// Routes - adjusted for Netlify Functions base path
router.use('/earthquakes', earthquakeRoutes);
router.use('/footage', footageRoutes);
router.use('/news', newsRoutes);

// Mount router under /api
app.use('/api', router);

// Export for Netlify Functions
export { app };
export default app;
export const handler = serverless(app);