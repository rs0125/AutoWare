import { Router } from 'express';
import { generateSatelliteImageHandler } from '../controllers/maps.controller';

const router = Router();

router.post('/satellite-image', generateSatelliteImageHandler);

export default router;
