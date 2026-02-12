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
   * @param reason - Reason for voiding
   * @returns Updated (voided) sale
   */
  voidSale: async (saleId: string | number, reason: string): Promise<Sale> => {
    const endpoint = API_ENDPOINTS.sales.void(saleId.toString());
    const res = await apiClient.post(endpoint, { reason });
    return res.data;
  },

  /**
   * Update the preparation status of an entire sale (KDS)
   */
  updatePreparationStatus: async (saleId: string | number, status: string): Promise<any> => {
    const res = await apiClient.patch(`/sales/${saleId}/preparation`, { status });
    return res.data;
  },

  /**
   * Update the preparation status of a specific item (KDS)
   */
  updateItemPreparationStatus: async (saleId: string | number, itemId: string | number, status: string): Promise<any> => {
    const res = await apiClient.patch(`/sales/${saleId}/items/${itemId}/preparation`, { status });
    return res.data;
  },
};

export default SalesService;