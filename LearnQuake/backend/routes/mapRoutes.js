import { Router } from 'express';
import { handleMapAnalysis } from '../controllers/mapController.js';

const router = Router();

router.post('/', handleMapAnalysis);

export default router;