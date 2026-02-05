import apiClient from "./ApiClient";

export interface Table {
  id: number;
  business_id: number;
  table_number: string;
  section: string;
  capacity: number;
  status: 'available' | 'occupied' | 'reserved';
  created_at: string;
}

export const TableService = {
  listTables: async () => {
    const response = await apiClient.get("/tables");
    return response.data;
  },

  createTable: async (data: Partial<Table>) => {
    const response = await apiClient.post("/tables", data);
    return response.data;
  },

  updateTable: async (id: number, data: Partial<Table>) => {
    const response = await apiClient.put(`/tables/${id}`, data);
    return response.data;
  },

  deleteTable: async (id: number) => {
    const response = await apiClient.delete(`/tables/${id}`);
    return response.data;
  }
};
