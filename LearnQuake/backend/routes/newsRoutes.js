import express from 'express';
import newsController from '../controllers/newsController.js';

const router = express.Router();

// GET /api/news - Fetch recent earthquake news
router.get('/', newsController.getEarthquakeNews);

// GET /api/news/search - Search news by location
router.get('/search', newsController.searchNewsByLocation);

// GET /api/news/date-range - Fetch news by date range
router.get('/date-range', newsController.getNewsByDateRange);

export default router;