import React from 'react';

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

export interface NavItem {
  label: string;
  page: Page;
  // FIX: Changed JSX.Element to React.ReactElement to resolve the 'Cannot find namespace JSX' error.
  icon: React.ReactElement;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

export interface StockHistory {
  date: string;
  action: 'Initial Stock' | 'Sale' | 'Purchase' | 'Adjustment' | 'Transfer In' | 'Transfer Out';
  change: number;
  newStock: number;
}

export interface DataProduct {
  id: string;
  name: string;
  sku: string;
  category: string;
  stock: number;
  price: number;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
  imageUrl?: string;
  history: StockHistory[];
}

export interface LineItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

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
  poId?: string;
  supplier: string;
  purchaseDate: string;
  items: LineItem[];
  total: number;
}

export interface Sale {
  id: string;
  customer: string;
  saleDate: string;
  items: LineItem[];
  total: number;
}