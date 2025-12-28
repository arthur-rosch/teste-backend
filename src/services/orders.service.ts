import { Order } from '../models/Order';
import { CreateOrderDTO, OrderState, OrderStatus, ServiceStatus } from '../types';

export class OrdersService {
  async createOrder(data: CreateOrderDTO, userId: string) {
    const totalValue = data.services.reduce((sum, service) => sum + service.value, 0);

    if (totalValue <= 0) {
      throw new Error('Total order value must be greater than 0');
    }

    const servicesWithStatus = data.services.map(service => ({
      ...service,
      status: ServiceStatus.PENDING,
    }));

    const order = await Order.create({
      lab: data.lab,
      patient: data.patient,
      customer: data.customer,
      services: servicesWithStatus,
      state: OrderState.CREATED,
      status: OrderStatus.ACTIVE,
      userId,
    });

    return order;
  }

  async getOrders(userId: string, page = 1, limit = 10, state?: string) {
    const skip = (page - 1) * limit;
    const filter: any = { userId, status: OrderStatus.ACTIVE };

    if (state) {
      filter.state = state;
    }

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Order.countDocuments(filter),
    ]);

    return {
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getOrderById(orderId: string, userId: string) {
    const order = await Order.findOne({ _id: orderId, userId });
    if (!order) {
      throw new Error('Order not found');
    }
    return order;
  }

  async advanceOrderState(orderId: string, userId: string) {
    const order = await this.getOrderById(orderId, userId);

    const stateTransitions: Record<OrderState, OrderState | null> = {
      [OrderState.CREATED]: OrderState.ANALYSIS,
      [OrderState.ANALYSIS]: OrderState.COMPLETED,
      [OrderState.COMPLETED]: null,
    };

    const nextState = stateTransitions[order.state as OrderState];

    if (!nextState) {
      throw new Error('Order is already completed and cannot be advanced');
    }

    order.state = nextState;
    await order.save();

    return order;
  }
}
