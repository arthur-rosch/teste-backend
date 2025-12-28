import { Router } from 'express';
import { OrdersController } from '../controllers/orders.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();
const ordersController = new OrdersController();

router.use(authMiddleware);

router.post('/', (req, res) => ordersController.create(req, res));
router.get('/', (req, res) => ordersController.list(req, res));
router.patch('/:id/advance', (req, res) => ordersController.advance(req, res));

export default router;
