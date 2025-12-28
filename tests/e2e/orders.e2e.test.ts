import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../../src/app';
import { User } from '../../src/models/User';
import { Order } from '../../src/models/Order';

describe('Orders E2E', () => {
  let authToken: string;
  let userId: string;

  beforeAll(async () => {
    const testDbUri = 'mongodb://localhost:27017/teste-backend-e2e';
    await mongoose.connect(testDbUri);

    const registerResponse = await request(app)
      .post('/auth/register')
      .send({
        email: 'ordersuser@example.com',
        password: 'password123',
      });

    authToken = registerResponse.body.token;
    userId = registerResponse.body.user.id;
  });

  afterAll(async () => {
    await Order.deleteMany({});
    await User.deleteMany({});
    await mongoose.connection.close();
  });

  describe('POST /orders', () => {
    it('should create an order successfully', async () => {
      const response = await request(app)
        .post('/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          lab: 'Lab A',
          patient: 'Patient A',
          customer: 'Customer A',
          services: [
            { name: 'Service 1', value: 100 },
            { name: 'Service 2', value: 50 },
          ],
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('_id');
      expect(response.body.state).toBe('CREATED');
      expect(response.body.status).toBe('ACTIVE');
      expect(response.body.services).toHaveLength(2);
      expect(response.body.services[0].status).toBe('PENDING');
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .post('/orders')
        .send({
          lab: 'Lab A',
          patient: 'Patient A',
          customer: 'Customer A',
          services: [{ name: 'Service 1', value: 100 }],
        });

      expect(response.status).toBe(401);
    });

    it('should return 400 for empty services array', async () => {
      const response = await request(app)
        .post('/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          lab: 'Lab A',
          patient: 'Patient A',
          customer: 'Customer A',
          services: [],
        });

      expect(response.status).toBe(400);
    });

    it('should return 400 for service with zero value', async () => {
      const response = await request(app)
        .post('/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          lab: 'Lab A',
          patient: 'Patient A',
          customer: 'Customer A',
          services: [{ name: 'Service 1', value: 0 }],
        });

      expect(response.status).toBe(400);
    });

    it('should return 400 for negative service value', async () => {
      const response = await request(app)
        .post('/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          lab: 'Lab A',
          patient: 'Patient A',
          customer: 'Customer A',
          services: [{ name: 'Service 1', value: -10 }],
        });

      expect(response.status).toBe(400);
    });

    it('should return 400 for missing required fields', async () => {
      const response = await request(app)
        .post('/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          lab: 'Lab A',
          services: [{ name: 'Service 1', value: 100 }],
        });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /orders', () => {
    beforeAll(async () => {
      await request(app)
        .post('/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          lab: 'Lab B',
          patient: 'Patient B',
          customer: 'Customer B',
          services: [{ name: 'Service 1', value: 200 }],
        });

      await request(app)
        .post('/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          lab: 'Lab C',
          patient: 'Patient C',
          customer: 'Customer C',
          services: [{ name: 'Service 1', value: 300 }],
        });
    });

    it('should list orders with pagination', async () => {
      const response = await request(app)
        .get('/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ page: 1, limit: 10 });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('orders');
      expect(response.body).toHaveProperty('pagination');
      expect(Array.isArray(response.body.orders)).toBe(true);
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(10);
    });

    it('should filter orders by state', async () => {
      const response = await request(app)
        .get('/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ state: 'CREATED' });

      expect(response.status).toBe(200);
      expect(response.body.orders.every((order: any) => order.state === 'CREATED')).toBe(true);
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .get('/orders');

      expect(response.status).toBe(401);
    });
  });

  describe('PATCH /orders/:id/advance', () => {
    let orderId: string;

    beforeAll(async () => {
      const createResponse = await request(app)
        .post('/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          lab: 'Lab D',
          patient: 'Patient D',
          customer: 'Customer D',
          services: [{ name: 'Service 1', value: 400 }],
        });

      orderId = createResponse.body._id;
    });

    it('should advance order from CREATED to ANALYSIS', async () => {
      const response = await request(app)
        .patch(`/orders/${orderId}/advance`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.state).toBe('ANALYSIS');
    });

    it('should advance order from ANALYSIS to COMPLETED', async () => {
      const response = await request(app)
        .patch(`/orders/${orderId}/advance`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.state).toBe('COMPLETED');
    });

    it('should return 400 when trying to advance completed order', async () => {
      const response = await request(app)
        .patch(`/orders/${orderId}/advance`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Order is already completed and cannot be advanced');
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .patch(`/orders/${orderId}/advance`);

      expect(response.status).toBe(401);
    });

    it('should return 400 for non-existent order', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .patch(`/orders/${fakeId}/advance`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Order not found');
    });
  });
});
