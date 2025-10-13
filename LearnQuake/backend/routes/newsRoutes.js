import express from 'express';
import { NewsService } from '../services/newsService.js';

const router = express.Router();
const newsService = new NewsService();

router.get('/earthquake', async (req, res) => {
  try {
    const { query = 'earthquake', pageSize = 6 } = req.query;
    
    console.log('📰 Fetching news:', { query, pageSize });
    
    const result = await newsService.fetchEarthquakeNews(query, pageSize);
    
    res.json(result);
  } catch (error) {
    console.error('❌ News error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;