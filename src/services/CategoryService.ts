import apiClient from "./ApiClient";
import { API_ENDPOINTS } from "../config/api";
import type { Category } from "../types";

export const CategoryService = {
  /**
   * Fetch all categories
   * @returns List of categories
   */
  getCategories: async (): Promise<Category[]> => {
    const res = await apiClient.get(API_ENDPOINTS.categories.base);
    return res.data;
  },

  /**
   * Create new category
   * @param category - Category data
   * @returns Created category
   */
  createCategory: async (category: Partial<Category>): Promise<Category> => {
    const res = await apiClient.post(API_ENDPOINTS.categories.base, category);
    return res.data;
  },

  /**
   * Update existing category
   * @param id - Category ID
   * @param updates - Fields to update
   * @returns Updated category
   */
  updateCategory: async (
    id: string,
    updates: Partial<Category>
  ): Promise<Category> => {
    const endpoint = API_ENDPOINTS.categories.byId(id);
    const res = await apiClient.put(endpoint, updates);
    return res.data;
  },

  /**
   * Delete category
   * @param id - Category ID
   * @returns Promise resolved when deleted
   */
  deleteCategory: async (id: string): Promise<void> => {
    const endpoint = API_ENDPOINTS.categories.byId(id);
    await apiClient.delete(endpoint);
  },
};

export default CategoryService;
