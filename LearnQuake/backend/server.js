import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import earthquakeRoutes from './routes/earthquakeRoutes.js';
import mapRoutes from './routes/mapRoutes.js';
import { generateMapAnalysis } from './services/mapAnalysisService.js';
import newsRoutes from './routes/newsRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from parent directory
dotenv.config({ path: join(__dirname, '..', '.env') });

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json()); 

// Routes
app.use('/api/earthquakes', earthquakeRoutes);
app.use('/map', mapRoutes);
app.use('/api/news', newsRoutes);

// check lang rin if gumagana yung server
app.listen(port, () => {
  console.log(`Map Analysis backend running on http://localhost:${port}`);
  console.log(
    `Search earthquakes at: http://localhost:${port}/api/earthquakes/search?location=California`,
  );
});

function jsonResponse(statusCode, payload) {
  return {
    statusCode,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  };
}

export const handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return jsonResponse(405, { success: false, error: "Method Not Allowed" });
  }

  let body;
  try {
    body = JSON.parse(event.body || "{}");
  } catch {
    return jsonResponse(400, { success: false, error: "Invalid JSON payload" });
  }

  const { place, magnitude, areaCoverage, coordinates } = body;
  if (!place || magnitude === undefined || !areaCoverage || !coordinates) {
    return jsonResponse(400, {
      success: false,
      error: "Missing required fields: place, magnitude, areaCoverage, coordinates",
    });
  }

  try {
    const analysis = await generateMapAnalysis({ place, magnitude, areaCoverage, coordinates });
    return jsonResponse(200, { success: true, analysis });
  } catch (error) {
    console.error("Map function error:", error);
    return jsonResponse(500, { success: false, error: error.message });
  }
};
