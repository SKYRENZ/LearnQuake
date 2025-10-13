import { generateMapAnalysis } from '../../backend/services/mapAnalysisService.js';

function jsonResponse(statusCode, payload) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'POST, OPTIONS'
    },
    body: JSON.stringify(payload),
  };
}

export const handler = async (event) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return jsonResponse(200, {});
  }

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
    console.log('📤 Map analysis request:', { place, magnitude, areaCoverage });
    
    const analysis = await generateMapAnalysis({
      place,
      magnitude,
      areaCoverage,
      coordinates,
    });

    return jsonResponse(200, { success: true, analysis });
  } catch (error) {
    console.error('❌ Map analysis error:', error);
    return jsonResponse(500, {
      success: false,
      error: error.message || 'Failed to generate map analysis'
    });
  }
};

