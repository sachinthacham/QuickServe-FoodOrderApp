import { api } from "@/lib/api";

export interface Restaurant {
  id: string;
  name: string;
  description: string;
  address: string;
  imageUrl: string;
  menuItems: MenuItem[];
}

export interface MenuItem {
  id: string;
  restaurantId: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
}

export interface CreateRestaurantRequest {
  name: string;
  description: string;
  address: string;
}

export interface UpdateRestaurantRequest {
  name: string;
  description: string;
  address: string;
}

export interface CreateMenuItemRequest {
  restaurantId: string;
  name: string;
  description: string;
  price: number;
}

export interface UpdateMenuItemRequest {
  name: string;
  description: string;
  price: number;
}

export const restaurantService = {
  async getAll(token?: string): Promise<Restaurant[]> {
    return api.get<Restaurant[]>("/restaurants", token);
  },

  async getMyRestaurants(token: string): Promise<Restaurant[]> {
    return api.get<Restaurant[]>("/restaurants/my-restaurants", token);
  },

  async getById(id: string, token?: string): Promise<Restaurant> {
    return api.get<Restaurant>(`/restaurants/${id}`, token);
  },

  async create(
    data: CreateRestaurantRequest,
    token: string
  ): Promise<Restaurant> {
    return api.post<Restaurant>("/restaurants", data, token);
  },

  async update(
    id: string,
    data: UpdateRestaurantRequest,
    token: string
  ): Promise<Restaurant> {
    return api.put<Restaurant>(`/restaurants/${id}`, data, token);
  },

  async delete(id: string, token: string): Promise<void> {
    return api.delete<void>(`/restaurants/${id}`, token);
  },

  async getMenuItems(
    restaurantId: string,
    token?: string
  ): Promise<MenuItem[]> {
    return api.get<MenuItem[]>(
      `/restaurants/${restaurantId}/menu-items`,
      token
    );
  },

  async createMenuItem(
    restaurantId: string,
    data: CreateMenuItemRequest,
    token: string
  ): Promise<MenuItem> {
    return api.post<MenuItem>(
      `/restaurants/${restaurantId}/menu-items`,
      data,
      token
    );
  },

  async updateMenuItem(
    restaurantId: string,
    menuItemId: string,
    data: UpdateMenuItemRequest,
    token: string
  ): Promise<MenuItem> {
    return api.put<MenuItem>(
      `/restaurants/${restaurantId}/menu-items/${menuItemId}`,
      data,
      token
    );
  },

  async deleteMenuItem(
    restaurantId: string,
    menuItemId: string,
    token: string
  ): Promise<void> {
    return api.delete<void>(
      `/restaurants/${restaurantId}/menu-items/${menuItemId}`,
      token
    );
  },
};
