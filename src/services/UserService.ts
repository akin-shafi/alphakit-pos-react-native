import apiClient from "./ApiClient";
import { API_ENDPOINTS } from "../config/api";
import type { User } from "../types";

export const UserService = {
  /**
   * Fetch all users for the current tenant
   */
  getUsers: async (): Promise<User[]> => {
    const res = await apiClient.get(API_ENDPOINTS.users.base);
    return res.data;
  },

  /**
   * Create a new user
   */
  createUser: async (user: Partial<User>): Promise<User> => {
    const res = await apiClient.post(API_ENDPOINTS.users.base, user);
    return res.data;
  },

  /**
   * Update an existing user
   */
  updateUser: async (userId: string, updates: Partial<User>): Promise<User> => {
    const res = await apiClient.put(API_ENDPOINTS.users.byId(userId), updates);
    return res.data;
  },

  /**
   * Delete a user
   */
  deleteUser: async (userId: string): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.users.byId(userId));
  },
};

export default UserService;
