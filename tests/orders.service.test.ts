import { describe, it, expect, beforeEach, vi } from 'vitest';
import { OrdersService } from '../src/services/orders.service';
import { Order } from '../src/models/Order';
import { OrderState, ServiceStatus } from '../src/types';

vi.mock('../src/models/Order');

describe('OrdersService', () => {
  let ordersService: OrdersService;

  beforeEach(() => {
    ordersService = new OrdersService();
    vi.clearAllMocks();
  });

  describe('createOrder', () => {
    it('should create an order with CREATED state and PENDING services', async () => {
      const mockOrder = {
        _id: '123',
        lab: 'Lab A',
        patient: 'Patient A',
        customer: 'Customer A',
        services: [{ name: 'Service 1', value: 100, status: ServiceStatus.PENDING }],
        state: OrderState.CREATED,
        userId: 'user123',
      };

      vi.mocked(Order.create).mockResolvedValue(mockOrder as any);

      const result = await ordersService.createOrder(
        {
          lab: 'Lab A',
          patient: 'Patient A',
          customer: 'Customer A',
          services: [{ name: 'Service 1', value: 100 }],
        },
        'user123'
      );

      expect(result.state).toBe(OrderState.CREATED);
      expect(result.services[0].status).toBe(ServiceStatus.PENDING);
    });

    it('should throw error when total value is 0', async () => {
      await expect(
        ordersService.createOrder(
          {
            lab: 'Lab A',
            patient: 'Patient A',
            customer: 'Customer A',
            services: [{ name: 'Service 1', value: 0 }],
          },
          'user123'
        )
      ).rejects.toThrow('Total order value must be greater than 0');
    });

    it('should throw error when total value is negative', async () => {
      await expect(
        ordersService.createOrder(
          {
            lab: 'Lab A',
            patient: 'Patient A',
            customer: 'Customer A',
            services: [{ name: 'Service 1', value: -10 }],
          },
          'user123'
        )
      ).rejects.toThrow('Total order value must be greater than 0');
    });
  });

  describe('advanceOrderState', () => {
    it('should advance from CREATED to ANALYSIS', async () => {
      const mockOrder = {
        _id: '123',
        state: OrderState.CREATED,
        userId: 'user123',
        save: vi.fn().mockResolvedValue(true),
      };

      vi.mocked(Order.findOne).mockResolvedValue(mockOrder as any);

      const result = await ordersService.advanceOrderState('123', 'user123');

      expect(result.state).toBe(OrderState.ANALYSIS);
      expect(mockOrder.save).toHaveBeenCalled();
    });

    it('should advance from ANALYSIS to COMPLETED', async () => {
      const mockOrder = {
        _id: '123',
        state: OrderState.ANALYSIS,
        userId: 'user123',
        save: vi.fn().mockResolvedValue(true),
      };

      vi.mocked(Order.findOne).mockResolvedValue(mockOrder as any);

      const result = await ordersService.advanceOrderState('123', 'user123');

      expect(result.state).toBe(OrderState.COMPLETED);
      expect(mockOrder.save).toHaveBeenCalled();
    });

    it('should throw error when trying to advance COMPLETED order', async () => {
      const mockOrder = {
        _id: '123',
        state: OrderState.COMPLETED,
        userId: 'user123',
      };

      vi.mocked(Order.findOne).mockResolvedValue(mockOrder as any);

      await expect(
        ordersService.advanceOrderState('123', 'user123')
      ).rejects.toThrow('Order is already completed and cannot be advanced');
    });

    it('should throw error when order is not found', async () => {
      vi.mocked(Order.findOne).mockResolvedValue(null);

      await expect(
        ordersService.advanceOrderState('123', 'user123')
      ).rejects.toThrow('Order not found');
    });

    it('should not allow skipping states', async () => {
      const mockOrder = {
        _id: '123',
        state: OrderState.CREATED,
        userId: 'user123',
        save: vi.fn().mockResolvedValue(true),
      };

      vi.mocked(Order.findOne).mockResolvedValue(mockOrder as any);

      const result = await ordersService.advanceOrderState('123', 'user123');

      expect(result.state).toBe(OrderState.ANALYSIS);
      expect(result.state).not.toBe(OrderState.COMPLETED);
    });
  });
});
