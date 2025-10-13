import { Router } from 'express';
import {
  searchByLocation,
  getRecent,
  searchByCountry,
} from '../controllers/earthquakeController.js';

const router = Router();

router.get('/', getRecent);
router.get('/search', searchByLocation);
router.get('/search-by-country', searchByCountry);

export default router;