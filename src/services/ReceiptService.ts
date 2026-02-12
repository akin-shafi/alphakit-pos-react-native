
import * as Print from "expo-print";
import { shareAsync } from "expo-sharing";
import { formatCurrency } from "../utils/Formatter";
import type { Sale, Business } from "../types";

export const ReceiptService = {
  /**
   * Generates HTML content for the receipt
   */
  generateReceiptHtml: (sale: Sale, business: Business, paperSize: '58mm' | '80mm' = '80mm'): string => {
    const totalItems = sale.items.reduce((acc, item) => acc + item.quantity, 0);
    const date = new Date(sale.createdAt).toLocaleString();
    const receiptNo = sale.receiptNo || sale.id; 
    const currency = business.currency || "NGN";

    // Adjust width based on paper size
    const width = paperSize === '58mm' ? '200px' : '300px';
    const padding = paperSize === '58mm' ? '10px' : '20px';

    // Generate items rows
    const itemsHtml = sale.items
      .map(
        (item) => `
        <div class="item-row">
            <div class="item-info">
                <div class="item-name">${item.product.name}</div>
                <div class="item-detail">${item.quantity} x ${formatCurrency(item.product.price, currency)}</div>
            </div>
            <div class="item-total">${formatCurrency(item.quantity * item.product.price, currency)}</div>
        </div>
    `
      )
      .join("");

    return `
<!DOCTYPE html>
<html>
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
    <style>
        @page { margin: 0; }
        body {
            font-family: 'Courier New', monospace;
            font-size: 12px;
            color: #000;
            margin: 0;
            padding: ${padding};
            max-width: ${width}; 
            margin: 0 auto;
        }
        .header { text-align: center; margin-bottom: 15px; border-bottom: 1px dashed #000; padding-bottom: 10px; }
        .business-name { font-size: 16px; font-weight: bold; margin-bottom: 4px; text-transform: uppercase; }
        .business-info { font-size: 10px; margin-bottom: 2px; }
        .receipt-title { font-size: 14px; font-weight: bold; margin: 10px 0; text-align: center; }
        .meta-info { display: flex; justify-content: space-between; font-size: 10px; margin-bottom: 4px; }
        .items-container { margin: 10px 0; border-bottom: 1px dashed #000; padding-bottom: 10px; }
        .item-row { display: flex; justify-content: space-between; margin-bottom: 8px; }
        .item-name { font-weight: bold; }
        .item-detail { font-size: 10px; font-style: italic; }
        .totals { margin-top: 10px; }
        .total-row { display: flex; justify-content: space-between; margin-bottom: 4px; }
        .grand-total { font-weight: bold; font-size: 14px; border-top: 1px dashed #000; border-bottom: 1px dashed #000; padding: 8px 0; margin-top: 5px; }
        .footer { text-align: center; margin-top: 20px; font-size: 10px; }
    </style>
</head>
<body>
    <div class="header">
        <div class="business-name">${business.name}</div>
        ${business.address ? `<div class="business-info">${business.address}</div>` : ""}
        ${business.city ? `<div class="business-info">${business.city}</div>` : ""}
        ${business.phone ? `<div class="business-info">Tel: ${business.phone}</div>` : ""}
    </div>

    <div class="receipt-title">SALES RECEIPT</div>

    <div class="meta-info">
        <span>Date:</span>
        <span>${date}</span>
    </div>
    <div class="meta-info">
        <span>Receipt No:</span>
        <span>${receiptNo}</span>
    </div>
     <div class="meta-info">
        <span>Cashier:</span>
        <span>${sale.cashierName || "Staff"}</span>
    </div>

    <div class="items-container">
        ${itemsHtml}
    </div>

    <div class="totals">
        <div class="total-row">
            <span>Subtotal</span>
            <span>${formatCurrency(sale.subtotal, currency)}</span>
        </div>
        ${
          sale.discount > 0
            ? `
        <div class="total-row">
            <span>Discount</span>
            <span>- ${formatCurrency(sale.discount, currency)}</span>
        </div>`
            : ""
        }
        <div class="total-row grand-total">
            <span>TOTAL</span>
            <span>${formatCurrency(sale.total, currency)}</span>
        </div>
    </div>

    <div class="meta-info" style="margin-top: 10px; justify-content: center;">
        <span>Payment Method: <strong>${sale.paymentMethod.toUpperCase()}</strong></span>
    </div>

    <div class="footer">
        <div>Thank you for your patronage!</div>
        <div>Please come again</div>
    </div>
</body>
</html>
    `;
  },

  /**
   * Prints the receipt using system print dialog or direct ESC/POS (placeholder)
   */
  printReceipt: async (sale: Sale, business: Business, settings?: { paperSize?: '58mm' | '80mm', type?: string, address?: string }) => {
    try {
      const paperSize = settings?.paperSize || '80mm';
      const html = ReceiptService.generateReceiptHtml(sale, business, paperSize);
      
      // If network/bluetooth printer is set, specialized logic would go here
      // For now, we use expo-print for compatibility while providing the hooks
      
      console.log(`Printing to ${settings?.type || 'system'} @ ${settings?.address || 'default'}`);

      await Print.printAsync({
        html,
      });
    } catch (error) {
      console.error("Printing failed:", error);
      throw error;
    }
  },

  /**
   * Generates a PDF and allows sharing/saving
   */
  shareReceipt: async (sale: Sale, business: Business, paperSize: '58mm' | '80mm' = '80mm') => {
     try {
      const html = ReceiptService.generateReceiptHtml(sale, business, paperSize);
      const { uri } = await Print.printToFileAsync({ html });
      await shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
    } catch (error) {
      console.error("Sharing failed:", error);
      throw error;
    }
  }
};
