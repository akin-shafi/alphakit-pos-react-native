import apiClient from "./ApiClient";
import { API_ENDPOINTS } from "../config/api";
import type { Sale } from "../types";

export interface DailyReport {
  date: string;
  total_sales: number;
  total_cost: number;
  total_profit: number;
  total_transactions: number;
  cash_sales: number;
  card_sales: number;
  transfer_sales: number;
  total_expenses: number;
  net_profit: number;
  average_sale: number;
  // Bulk Inventory (LPG)
  opening_stock?: number;
  closing_stock?: number;
  stock_purchased?: number;
  stock_sold?: number;
  stock_variance?: number;
}

export interface SalesReport {
  from_date: string;
  to_date: string;
  total_sales: number;
  total_cost: number;
  total_profit: number;
  total_transactions: number;
  cash_sales: number;
  cash_transactions: number;
  card_sales: number;
  card_transactions: number;
  transfer_sales: number;
  transfer_transactions: number;
  mobile_money_sales: number;
  mobile_money_transactions: number;
  other_sales: number;
  other_transactions: number;
  total_expenses: number;
  net_profit: number;
  average_sale: number;
}

export interface ProductProfitStat {
  product_id: number;
  product_name: string;
  total_qty: number;
  revenue: number;
  cost: number;
  profit: number;
}

export interface MonthlySummaryItem {
  month: string;
  revenue: number;
  cost: number;
  expenses: number;
  profit: number;
}

export const ReportService = {
  /**
   * Fetch daily sales report
   * @param date - Optional date string (YYYY-MM-DD)
   */
  getDailyReport: async (date?: string): Promise<DailyReport> => {
    const endpoint = date ? `${API_ENDPOINTS.sales.dailyReport}?date=${date}` : API_ENDPOINTS.sales.dailyReport;
    const res = await apiClient.get(endpoint);
    return res.data;
  },

  /**
   * Fetch sales report for a date range
   * @param startDate - Start date (YYYY-MM-DD)
   * @param endDate - End date (YYYY-MM-DD)
   * @param paymentMethod - Optional payment method filter
   */
  getSalesReport: async (
    startDate: string,
    endDate: string,
    paymentMethod?: string
  ): Promise<SalesReport> => {
    let endpoint = `${API_ENDPOINTS.sales.rangeReport}?start_date=${startDate}&end_date=${endDate}`;
    if (paymentMethod) {
      endpoint += `&payment_method=${paymentMethod}`;
    }
    const res = await apiClient.get(endpoint);
    return res.data;
  },

  /**
   * Fetch product-wise profit report
   */
  getProductProfitReport: async (from?: string, to?: string): Promise<ProductProfitStat[]> => {
    let endpoint = API_ENDPOINTS.sales.productProfit;
    const params: string[] = [];
    if (from) params.push(`from=${from}`);
    if (to) params.push(`to=${to}`);
    if (params.length > 0) endpoint += `?${params.join("&")}`;
    
    const res = await apiClient.get(endpoint);
    return res.data || [];
  },

  /**
   * Fetch monthly financial summary for charting
   */
  getMonthlyReport: async (months: number = 6): Promise<MonthlySummaryItem[]> => {
    const res = await apiClient.get(`${API_ENDPOINTS.sales.monthlyReport}?months=${months}`);
    return res.data || [];
  },

  /**
   * Fetch transaction list with filters
   */
  getSales: async (filters: { status?: string; from?: string; to?: string }): Promise<Sale[]> => {
    let endpoint = `${API_ENDPOINTS.sales.list}?`;
    if (filters.status) endpoint += `status=${filters.status}&`;
    if (filters.from) endpoint += `from=${filters.from}&`;
    if (filters.to) endpoint += `to=${filters.to}&`;
    
    const res = await apiClient.get(endpoint);
    
    // Map backend snake_case to frontend camelCase
    const rawData = res.data;
    const data = Array.isArray(rawData) ? rawData : (rawData?.sales || []);
    
    return data.map((item: any) => ({
      id: item.id.toString(),
      businessId: item.business_id.toString(),
      userId: item.cashier_id.toString(),
      items: (item.items || []).map((saleItem: any) => ({
        product: {
          id: saleItem.product_id,
          name: saleItem.product_name,
          price: saleItem.unit_price,
          // Other fields can be populated if needed, but these are the essentials for receipt
          business_id: item.business_id,
          category_id: 0,
          sku: "",
          description: "",
          cost: 0,
          stock: 0,
          min_stock: 0,
          image_url: "",
          barcode: "",
          active: true,
        },
        quantity: saleItem.quantity,
        discount: 0, // Individual item discount not tracked in backend currently
      })),
      subtotal: item.subtotal,
      tax: item.tax,
      discount: item.discount,
      total: item.total,
      paymentMethod: item.payment_method?.toLowerCase() || "cash",
      status: item.status?.toLowerCase() || "completed",
      createdAt: item.created_at,
      syncStatus: "synced",
      cashierName: item.cashier_name,
      receiptNo: item.daily_sequence 
        ? `${new Date(item.created_at || new Date()).toISOString().slice(0,10).replace(/-/g, "")}-${item.daily_sequence.toString().padStart(3, '0')}`
        : undefined
    }));
  },
};


export default ReportService;
