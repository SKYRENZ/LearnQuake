import { generateMapAnalysis } from '../services/mapAnalysisService.js';

export async function handleMapAnalysis(req, res) {
  const { place, magnitude, areaCoverage, coordinates } = req.body;

  try {
    console.log('📤 Sending request to OpenAI with body:', {
      place,
      magnitude,
      areaCoverage,
      coordinates,
    });

    const analysis = await generateMapAnalysis({
      place,
      magnitude,
      areaCoverage,
      coordinates,
    });

    res.json({ analysis });
  } catch (error) {
    console.error('❌ Error in mapController:', error);
    res
      .status(500)
      .json({ error: error.message || 'Something went wrong with Map Analysis.' });
  }
}