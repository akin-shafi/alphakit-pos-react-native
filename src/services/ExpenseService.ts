
import apiClient from "./ApiClient";
import { API_ENDPOINTS } from "../config/api";

export interface Expense {
  id: number;
  amount: number;
  category: string;
  description: string;
  date: string;
}

export const ExpenseService = {
  getExpenses: async (from?: string, to?: string): Promise<Expense[]> => {
    let url = API_ENDPOINTS.expenses.base + "?";
    if (from) url += `from=${from}&`;
    if (to) url += `to=${to}&`;
    const res = await apiClient.get(url);
    return res.data;
  },

  createExpense: async (data: { amount: number; category: string; description: string; date: string }): Promise<Expense> => {
    const res = await apiClient.post(API_ENDPOINTS.expenses.base, data);
    return res.data;
  },

  deleteExpense: async (id: number): Promise<void> => {
    const res = await apiClient.delete(API_ENDPOINTS.expenses.byId(id.toString()));
  }
};

export default ExpenseService;
