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

// Logging middleware to debug requests
app.use((req, res, next) => {
  console.log('Request:', req.method, req.path, req.body);
  next();
});

// Handle root POST for map analysis FIRST (when called as /.netlify/functions/map)
app.post('/', async (req, res) => {
  console.log('POST / handler hit');
  const { place, magnitude, areaCoverage, coordinates } = req.body;
  
  if (!place || magnitude === undefined || !areaCoverage || !coordinates) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields: place, magnitude, areaCoverage, coordinates',
    });
  }

  try {
    const analysis = await generateMapAnalysis({ place, magnitude, areaCoverage, coordinates });
    return res.json({ success: true, analysis });
  } catch (error) {
    console.error('Map analysis error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Health check GET AFTER POST
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

// Mount other routes
app.use('/api/earthquakes', earthquakeRoutes);
app.use('/map', mapRoutes);
app.use('/api/footage', footageRoutes);
app.use('/api/news', newsRoutes);

// Export for Netlify Functions
export { app };
export const handler = serverless(app);