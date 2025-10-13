import express from 'express';
import { YouTubeService } from '../services/youtubeService.js';

const router = express.Router();
const youtubeService = new YouTubeService();

router.get('/', async (req, res) => {
  try {
    const { region = 'PH', maxResults = 9, query = 'Philippines' } = req.query;
    
    console.log('🎥 Fetching footage:', { region, maxResults, query });
    
    const result = await youtubeService.searchVideos(query, maxResults, region);
    
    res.json(result);
  } catch (error) {
    console.error('❌ Footage error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;