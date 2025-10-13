import express from 'express';
import newsController from '../controllers/newsController.js';

const router = express.Router();

router.get('/earthquake', newsController.getEarthquakeNews);
router.get('/headlines', newsController.getTopHeadlines);

export default router;