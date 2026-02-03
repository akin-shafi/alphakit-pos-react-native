// src/services/SalesService.ts

import apiClient from "./ApiClient";
import { API_ENDPOINTS } from "../config/api";
import type { Sale } from "../types";

export const SalesService = {
  /**
   * Create new sale transaction (One-shot)
   * @param payload - Sale creation payload
   * @returns Sale receipt data
   */
  createSale: async (payload: any): Promise<any> => {
    const res = await apiClient.post(API_ENDPOINTS.sales.base, payload);
    return res.data;
  },

  /**
   * Get sales for a date range
   * @param businessId - Business identifier
   * @param startDate - Start date
   * @param endDate - End date
   * @returns List of sales
   */
  getSales: async (
    businessId: string,
    startDate: Date,
    endDate: Date
  ): Promise<Sale[]> => {
    const params = {
      businessId,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    };

    const res = await apiClient.get(API_ENDPOINTS.sales.list, { params });
    return res.data;
  },

  /**
   * Void a sale transaction
   * @param saleId - Sale ID
   * @returns Updated (voided) sale
   */
  voidSale: async (saleId: string): Promise<Sale> => {
    const endpoint = API_ENDPOINTS.sales.void(saleId);
    const res = await apiClient.post(endpoint);
    return res.data;
  },
};

export default SalesService;