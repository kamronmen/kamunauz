export interface Product {
  id: string;
  barcode: string | null;
  name: string;
  costPrice: number;
  sellingPrice: number;
  stockQuantity: number;
  minStockAlert: number;
  category: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface CartItem {
  product: Product;
  quantity: number;
  subtotal: number;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address?: string | null;
  notes?: string | null;
  totalDebt: number;
  createdAt: string | Date;
  updatedAt: string | Date;
  debts?: DebtTransaction[];
  sales?: Sale[];
}

export interface DebtTransaction {
  id: string;
  customerId: string;
  customer?: Customer;
  type: "BORROW" | "PAYMENT";
  amount: number;
  description?: string | null;
  createdAt: string | Date;
}

export interface SaleItem {
  id: string;
  saleId: string;
  productId: string;
  product?: Product;
  quantity: number;
  costPrice: number;
  sellingPrice: number;
  subtotal: number;
}

export interface Sale {
  id: string;
  receiptNo: string;
  totalAmount: number;
  totalCost: number;
  netProfit: number;
  paymentType: "CASH" | "CARD" | "DEBT";
  status: "COMPLETED" | "CANCELLED";
  customerId?: string | null;
  customer?: Customer | null;
  items?: SaleItem[];
  createdAt: string | Date;
}

export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: "RENT" | "UTILITIES" | "SALARY" | "PERSONAL" | "OTHER";
  date: string | Date;
}

export interface AuditAlert {
  id: string;
  type: "CANCELLED_SALE" | "SUSPICIOUS_REFUND" | "PRICE_OVERRIDE" | "STOCK_MISMATCH";
  message: string;
  severity: "LOW" | "MEDIUM" | "HIGH";
  createdAt: string | Date;
}

export interface ParsedInvoiceItem {
  name: string;
  quantity: number;
  costPrice: number;
  sellingPrice?: number;
  barcode?: string;
  category?: string;
}

export interface AnalyticsSummary {
  period: string;
  totalSales: number;
  totalCost: number;
  grossProfit: number;
  totalExpenses: number;
  netProfit: number;
  salesCount: number;
  uncollectedDebt: number;
  paymentBreakdown: {
    CASH: number;
    CARD: number;
    DEBT: number;
  };
  dailyTrend: {
    date: string;
    label: string;
    sales: number;
    cost: number;
    profit: number;
    expenses: number;
    netProfit: number;
  }[];
  topProducts: {
    id: string;
    name: string;
    quantity: number;
    revenue: number;
    profit: number;
  }[];
  expenseCategories: {
    category: string;
    label: string;
    total: number;
  }[];
}
