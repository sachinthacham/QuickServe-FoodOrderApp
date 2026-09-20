import { api } from "@/lib/api";

export interface CartItem {
  id: string;
  menuItemId: string;
  menuItemName: string;
  imageUrl: string;
  price: number;
  quantity: number;
}

export interface Cart {
  id: string;
  userId: string;
  restaurantId: string;
  createdAt: string;
  updatedAt: string;
  items: CartItem[];
}

export interface AddCartItemRequest {
  restaurantId: string;
  menuItemId: string;
  quantity: number;
}

export interface UpdateCartItemQuantityRequest {
  quantity: number;
}

export const cartService = {
  async getCart(token: string): Promise<Cart> {
    return api.get<Cart>("/cart", token);
  },

  async addItem(data: AddCartItemRequest, token: string): Promise<Cart> {
    return api.post<Cart>("/cart/items", data, token);
  },

  async removeItem(cartItemId: string, token: string): Promise<Cart> {
    return api.delete<Cart>(`/cart/items/${cartItemId}`, token);
  },

  async updateQuantity(
    cartItemId: string,
    data: UpdateCartItemQuantityRequest,
    token: string
  ): Promise<Cart> {
    return api.put<Cart>(`/cart/items/${cartItemId}/quantity`, data, token);
  },

  async clearCart(token: string): Promise<Cart> {
    return api.delete<Cart>("/cart", token);
  },
};
