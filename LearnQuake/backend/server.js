import './config/loadEnv.js';
import express from 'express';
import cors from 'cors';
import { generateMapAnalysis } from './services/mapAnalysisService.js';
import earthquakeRoutes from './routes/earthquakeRoutes.js';
import mapRoutes from './routes/mapRoutes.js';
import newsRoutes from './routes/newsRoutes.js';
import footageRoutes from './routes/footageRoutes.js';

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/earthquakes', earthquakeRoutes);
app.use('/map', mapRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/footage', footageRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({
    message: 'LearnQuake API is running',
    endpoints: {
      earthquakes: '/api/earthquakes',
      map: '/map',
      news: '/api/news',
    },
  });
});

// Local server listener
app.listen(port, () => {
  console.log(`Map Analysis backend running on http://localhost:${port}`);
  console.log(
    `Search earthquakes at: http://localhost:${port}/api/earthquakes/search?location=California`,
  );
  console.log(`Get news at: http://localhost:${port}/api/news`);
});

// Netlify handler (kept for parity with serverlessApp)
function jsonResponse(statusCode, payload) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  };
}

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return jsonResponse(405, { success: false, error: 'Method Not Allowed' });
  }

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return jsonResponse(400, { success: false, error: 'Invalid JSON payload' });
  }

  const { place, magnitude, areaCoverage, coordinates } = body;
  if (!place || magnitude === undefined || !areaCoverage || !coordinates) {
    return jsonResponse(400, {
      success: false,
      error: 'Missing required fields: place, magnitude, areaCoverage, coordinates',
    });
  }

  try {
    const analysis = await generateMapAnalysis({
      place,
      magnitude,
      areaCoverage,
      coordinates,
    });
    return jsonResponse(200, { success: true, analysis });
  } catch (error) {
    console.error('Map function error:', error);
    return jsonResponse(500, { success: false, error: error.message });
  }
};
