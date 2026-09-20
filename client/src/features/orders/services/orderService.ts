import { api } from "@/lib/api";

export interface OrderItem {
  id: string;
  menuItemId: string;
  name: string;
  imageUrl: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  userId: string;
  restaurantId: string;
  orderDateTime: string;
  totalAmount: number;
  status: string;
  items: OrderItem[];
}

export interface CreateOrderRequest {
  restaurantId: string;
  items: {
    menuItemId: string;
    quantity: number;
  }[];
}

export interface UpdateOrderStatusRequest {
  status: string;
}

export const orderService = {
  async create(data: CreateOrderRequest, token: string): Promise<Order> {
    return api.post<Order>("/orders", data, token);
  },

  async getById(id: string, token: string): Promise<Order> {
    return api.get<Order>(`/orders/${id}`, token);
  },

  async getMyOrders(token: string): Promise<Order[]> {
    return api.get<Order[]>("/orders/my-orders", token);
  },

  async getAll(token: string): Promise<Order[]> {
    return api.get<Order[]>("/orders", token);
  },

  async getSellerOrders(token: string): Promise<Order[]> {
    return api.get<Order[]>("/orders/seller/my-orders", token);
  },

  async getAvailableOrders(token: string): Promise<Order[]> {
    return api.get<Order[]>("/orders/delivery/available", token);
  },

  async getDeliveryBoyOrders(token: string): Promise<Order[]> {
    return api.get<Order[]>("/orders/delivery/my-orders", token);
  },

  async updateStatus(
    id: string,
    status: string,
    token: string
  ): Promise<Order> {
    return api.put<Order>(`/orders/${id}/status`, { status }, token);
  },
};
