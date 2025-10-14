import express from 'express';
import { generateMapAnalysis } from '../services/mapAnalysisService.js';

const router = express.Router();

// POST /map - Generate AI analysis for earthquake simulation
router.post('/', async (req, res) => {
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

export default router;