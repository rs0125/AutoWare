import { Request, Response } from 'express';
import { getWarehouseWithData } from '../services/warehouse.service';

export const getWarehouseById = async (req: Request, res: Response) => {
  try {
    const warehouseId = parseInt(req.params.id);

    if (isNaN(warehouseId)) {
      return res.status(400).json({ error: 'Invalid warehouse ID' });
    }

    const warehouse = await getWarehouseWithData(warehouseId);

    if (!warehouse) {
      return res.status(404).json({ error: 'Warehouse not found' });
    }

    res.status(200).json(warehouse);
  } catch (error) {
    console.error('Error fetching warehouse:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
