import express from 'express';
import footageController from '../controllers/footageController.js';

const router = express.Router();
router.get('/', footageController.getVideos);
export default router;