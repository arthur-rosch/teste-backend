import { Response } from 'express';
import { ZodError } from 'zod';
import { OrdersService } from '../services/orders.service';
import { createOrderSchema } from '../utils/validators';
import { AuthRequest } from '../types';

const ordersService = new OrdersService();

export class OrdersController {
  async create(req: AuthRequest, res: Response) {
    try {
      const validatedData = createOrderSchema.parse(req.body);
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const order = await ordersService.createOrder(validatedData, userId);
      return res.status(201).json(order);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          error: 'Validation error',
          details: error.errors.map(e => ({ field: e.path.join('.'), message: e.message }))
        });
      }
      if (error instanceof Error) {
        return res.status(400).json({ error: error.message });
      }
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  async list(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const state = req.query.state as string;

      const result = await ordersService.getOrders(userId, page, limit, state);
      return res.status(200).json(result);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({ error: error.message });
      }
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  async advance(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const orderId = req.params.id;
      const order = await ordersService.advanceOrderState(orderId, userId);
      return res.status(200).json(order);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({ error: error.message });
      }
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
}
