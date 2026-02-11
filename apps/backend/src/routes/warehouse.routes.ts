import { Router } from 'express';
import { getWarehouseById } from '../controllers/warehouse.controller';

const router = Router();

router.get('/:id', getWarehouseById);

export default router;
