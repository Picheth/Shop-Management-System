import React from 'react';

/* =======================
   PAGE ENUM
======================= */
export enum Page {
  Dashboard = 'Dashboard',
  PurchaseOrder = 'PurchaseOrder',
  Purchase = 'Purchase',
  Sale = 'Sale',
  RepairCenter = 'RepairCenter',
  Settlement = 'Settlement',
  Inventory = 'Inventory',
  Product = 'Product',
  Variation = 'Variation',
  BranchLocation = 'BranchLocation',
  StockTransfer = 'StockTransfer',
  AccountsPayable = 'AccountsPayable',
  AccountsReceivable = 'AccountsReceivable',
  CashFlow = 'CashFlow',
  Expense = 'Expense',
  TaxPayment = 'TaxPayment',
  SummaryReport = 'SummaryReport',
  BalanceSheet = 'BalanceSheet',
  IncomeStatement = 'IncomeStatement',
  ProfitAndLoss = 'ProfitAndLoss',
  Report = 'Report',
  ChartOfAccount = 'ChartOfAccount',
  Supplier = 'Supplier',
  Contact = 'Contact',
  ExpenseCategory = 'ExpenseCategory',
  Staff = 'Staff',
  Payroll = 'Payroll',
}

/* =======================
   NAV TYPES
======================= */
export interface NavItem {
  label: string;
  page: Page;
  icon: React.ReactElement;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

/* =======================
   CORE TYPES
======================= */
export interface Branch {
  id: string;
  name: string;
  location: string;
}

export interface StockHistory {
  date: string;
  action: 'Initial Stock' | 'Sale' | 'Purchase' | 'Adjustment' | 'Transfer In' | 'Transfer Out';
  change: number;
  newStock: number;
  branch: string;
  reason?: string;
}

export interface DataProduct {
  id: string;
  name: string;
  sku: string;
  category: string;
  stockByLocation: Record<string, number>;
  price: number;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
  imageUrl?: string;
  history: StockHistory[];
}

export interface Variation {
  id: string;
  name: string;
  type: string;
  attributes: Record<string, string>;
}
export interface LineItem {
    sku?: string;
    productId: string;
    productName: string;
    quantity: number;
    price: number;
    serialNumbers?: string[];
    imeis?: string[];
}
export interface ProductUnit {
    id: string;
    productId: string;
    serialNumber?: string;
    imei?: string;
    barcode?: string;
    purchaseId?: string;
    saleId?: string;
    branchId: string;
    status:
        | 'In Stock'
        | 'Sold'
        | 'Repair'
        | 'Returned'
        | 'Reserved';

    costPrice: number;
    salePrice?: number;
    createdAt: string;
}

/* =======================
   BUSINESS TYPES
======================= */
export interface PurchaseOrder {
  id: string;
  supplier: string;
  orderDate: string;
  expectedDate: string;
  items: LineItem[];
  total: number;
  status: 'Pending' | 'Approved' | 'Completed' | 'Cancelled';
}

export interface Purchase {
  id: string;
  branchId: string;
  poId?: string;
  supplier: string;
  purchaseDate: string;
  items: LineItem[];
  total: number;
  status: string;
}
export interface PurchaseItem extends LineItem {
    serialNumbers?: string[];
    imeis?: string[];
    items: LineItem[];
    total: number;
}

/* =======================
   SALES (FIXED CONSISTENT)
======================= */
export interface Sale {
  id: string;
  branchId: string;
  customer: string;
  saleDate: string;
  items: LineItem[];
  total: number;
  status: string;
}

/* =======================
   REPAIR (FIXED CONSISTENT)
======================= */
export interface Repair {
  id: string;
  branchId: string;
  customer: string;
  phone: string;
  device: string;
  serialNumber: string;
  repairIssue: string;
  items: LineItem[];
  total: number;
  repairCost: number;
  estimatedCost: number;
  technician: string;
  entryDate: string;
  status: RepairStatus;
}

export type RepairStatus =
  | 'Pending'
  | 'In Progress'
  | 'Completed'
  | 'Cancelled';

export const repairStatuses: RepairStatus[] = [
  'Pending',
  'In Progress',
  'Completed',
  'Cancelled',
];

export const repairStatusColors: Record<RepairStatus, string> = {
  'Pending': 'bg-yellow-100 text-yellow-800',
  'In Progress': 'bg-blue-100 text-blue-800',
  'Completed': 'bg-green-100 text-green-800',
  'Cancelled': 'bg-red-100 text-red-800',
};
/* =======================
   FINANCE TYPES
======================= */
export interface Settlement {
  id: string;
  branchId: string;
  customer: string;
  settlementDate: string;
  items: LineItem[];
  total: number;
}

export interface StockTransfer {
  id: string;
  fromBranchId: string;
  toBranchId: string;
  productId: string;
  quantity: number;
  date: string;
}

export interface AccountsPayable {
  id: string;
  supplier: string;
  paymentDate: string;
  items: LineItem[];
  total: number;
  status: 'Pending' | 'Paid';
}

export interface AccountsReceivable {
  id: string;
  customer: string;
  paymentDate: string;
  items: LineItem[];
  total: number;
  status: 'Pending' | 'Received';
}

export interface Expense {
  id: string;
  category: string;
  amount: number;
  expenseDate: string;
  description?: string;
}

export interface TaxPayment {
  id: string;
  taxType: string;
  amount: number;
  paymentDate: string;
}

export interface Report {
  id: string;
  title: string;
  generatedDate: string;
  data: any;
}

export interface ChartOfAccount {
  id: string;
  name: string;
  type: 'Asset' | 'Liability' | 'Equity' | 'Revenue' | 'Expense';
}

export interface Supplier {
  id: string;
  name: string;
  contactInfo: string;
}

export interface Contact {
  id: string;
  name: string;
  phone: string;
  email: string;
}

export interface ExpenseCategory {
  id: string;
  name: string;
}

export interface Staff {
  id: string;
  name: string;
  role: string;
  contactInfo: string;
}

export interface Payroll {
  id: string;
  staffId: string;
  month: string;
  salary: number;
  deductions: number;
  netPay: number;
}