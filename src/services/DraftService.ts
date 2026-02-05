import apiClient from "./ApiClient";

export interface DraftOrder {
  id: number;
  table_number: string | null;
  customer_name: string | null;
  total: number;
  items: any[];
  status: string;
  cashier_id: number;
  cashier_name: string | null;
  created_at: string;
}

export const DraftService = {
  createDraft: async (items: any[], tableNumber?: string, customerName?: string) => {
    const payload = {
      items: items.map((item) => ({
        product_id: item.product.id,
        quantity: item.quantity,
      })),
      table_number: tableNumber || "",
      customer_name: customerName || "",
    };
    const response = await apiClient.post("/sales/draft", payload);
    return response.data;
  },

  listDrafts: async () => {
    const response = await apiClient.get("/sales/drafts");
    return response.data.data || [];
  },

  resumeDraft: async (id: number) => {
    const response = await apiClient.post(`/sales/${id}/resume`);
    return response.data;
  },
  
  deleteDraft: async(id: number) => {
      const response = await apiClient.delete(`/sales/${id}/draft`);
      return response.data;
  }
};
