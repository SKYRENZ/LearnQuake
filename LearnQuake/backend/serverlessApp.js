import 'dotenv/config';
import express from 'express';
import serverless from 'serverless-http';
import cors from 'cors';
import earthquakeRoutes from './routes/earthquakeRoutes.js';
import mapRoutes from './routes/mapRoutes.js';
import footageRoutes from './routes/footageRoutes.js';
import newsRoutes from './routes/newsRoutes.js';
import { generateMapAnalysis } from './services/mapAnalysisService.js';

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

// Handle root POST for map analysis (when called as /.netlify/functions/map)
app.post('/', async (req, res) => {
  const { place, magnitude, areaCoverage, coordinates } = req.body;
  
  if (!place || magnitude === undefined || !areaCoverage || !coordinates) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields: place, magnitude, areaCoverage, coordinates',
    });
  }

  try {
    const analysis = await generateMapAnalysis({ place, magnitude, areaCoverage, coordinates });
    res.json({ success: true, analysis });
  } catch (error) {
    console.error('Map analysis error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Mount routes
app.get('/', healthCheck);
app.use('/api/earthquakes', earthquakeRoutes);
app.use('/map', mapRoutes);
app.use('/api/footage', footageRoutes);
app.use('/api/news', newsRoutes);

// Export for Netlify Functions
export { app };
export const handler = serverless(app);