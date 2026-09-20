import { api } from "@/lib/api";

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  avatarUrl: string;
}

export interface UserAddress {
  id: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
}

export interface CreateUserAddressRequest {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
}

export const userService = {
  async getAll(token: string): Promise<User[]> {
    return api.get<User[]>("/users", token);
  },

  async getCurrentUser(token: string): Promise<User> {
    return api.get<User>("/users/me", token);
  },

  async getAddresses(token: string): Promise<UserAddress[]> {
    return api.get<UserAddress[]>("/users/addresses", token);
  },

  async addAddress(data: CreateUserAddressRequest, token: string): Promise<UserAddress> {
    return api.post<UserAddress>("/users/addresses", data, token);
  },

  async updateAddress(id: string, data: CreateUserAddressRequest, token: string): Promise<void> {
    return api.put<void>(`/users/addresses/${id}`, data, token);
  },

  async deleteAddress(id: string, token: string): Promise<void> {
    return api.delete<void>(`/users/addresses/${id}`, token);
  }
};
