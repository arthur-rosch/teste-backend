import express, { Express } from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes';
import ordersRoutes from './routes/orders.routes';

const app: Express = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/auth', authRoutes);
app.use('/orders', ordersRoutes);

export default app;
