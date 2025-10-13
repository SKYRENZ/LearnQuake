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
const NETLIFY_BASE = '/.netlify/functions/map';

// Middleware
app.use(cors());
app.use(express.json());

// Logging middleware to debug requests
app.use((req, res, next) => {
  console.log('Request:', req.method, req.path, req.body);
  next();
});

function registerRoutes(base = '') {
  app.use(`${base}/api/earthquakes`, earthquakeRoutes);
  app.use(`${base}/api/footage`, footageRoutes);
  app.use(`${base}/api/news`, newsRoutes);
  app.use(`${base}/map`, mapRoutes);
}

async function handleMapAnalysis(req, res) {
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
}

app.post('/', handleMapAnalysis);
app.post(NETLIFY_BASE, handleMapAnalysis);

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
app.get(NETLIFY_BASE, (req, res) => {
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

registerRoutes();
registerRoutes(NETLIFY_BASE);

// Export for Netlify Functions
export { app };
export const handler = serverless(app);