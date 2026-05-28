
import React from 'react';
import { Page, NavSection } from './src/types';

const Icon = ({ path }: { path: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d={path} />
  </svg>
);

export const NAV_SECTIONS: NavSection[] = [
  {
    title: 'CORE',
    items: [
      { label: 'Dashboard', page: Page.Dashboard, icon: <Icon path="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0h6" /> },
    ],
  },
  {
    title: 'OPERATIONS',
    items: [
      { label: 'Purchase Order', page: Page.PurchaseOrder, icon: <Icon path="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /> },
      { label: 'Purchase', page: Page.Purchase, icon: <Icon path="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /> },
      { label: 'Sale', page: Page.Sale, icon: <Icon path="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /> },
      { label: 'Repair Center', page: Page.RepairCenter, icon: <Icon path="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" /> },
      { label: 'Settlement', page: Page.Settlement, icon: <Icon path="M8 7h.01M12 7h.01M16 7h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /> },
    ],
  },
  {
    title: 'INVENTORY',
    items: [
      { label: 'Inventory', page: Page.Inventory, icon: <Icon path="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /> },
      { label: 'Product', page: Page.Product, icon: <Icon path="M16 4v12l-4-2-4 2V4M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /> },
      { label: 'Variation', page: Page.Variation, icon: <Icon path="M8.684 13.342C8.862 12.928 9 12.474 9 12c0-.474-.138-.928-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.368a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" /> },
      { label: 'Branch & Location', page: Page.BranchLocation, icon: <Icon path="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z" /> },
      { label: 'Stock Transfer', page: Page.StockTransfer, icon: <Icon path="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /> },
    ],
  },
  {
    title: 'FINANCE',
    items: [
      { label: 'Accounts Payable', page: Page.AccountsPayable, icon: <Icon path="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" /> },
      { label: 'Accounts Receivable', page: Page.AccountsReceivable, icon: <Icon path="M13 7h8m0 0V15m0-8l-8 8-4-4-6 6" /> },
      { label: 'Cash Flow', page: Page.CashFlow, icon: <Icon path="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01" /> },
      { label: 'Expense', page: Page.Expense, icon: <Icon path="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /> },
      { label: 'Tax Payment', page: Page.TaxPayment, icon: <Icon path="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2" /> },
    ],
  },
  {
    title: 'REPORTS',
    items: [
      { label: 'Summary Report', page: Page.SummaryReport, icon: <Icon path="M9 17v-2m3 2v-4m3 4v-6m2 10H5a2 2 0 01-2-2V7a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /> },
      { label: 'Balance Sheet', page: Page.BalanceSheet, icon: <Icon path="M3 6a3 3 0 116 0 3 3 0 01-6 0zM15.75 5.25a3 3 0 116 0 3 3 0 01-6 0zM6 18a3 3 0 100-6 3 3 0 000 6zM21.75 12.75a3 3 0 100-6 3 3 0 000 6z" /> },
      { label: 'Income Statement', page: Page.IncomeStatement, icon: <Icon path="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055zM13 21.945A9.001 9.001 0 0013 2.055V13h8.945a9.004 9.004 0 00-8.945 8.945z" /> },
      { label: 'Profits & Loss', page: Page.ProfitAndLoss, icon: <Icon path="M13 10V3L4 14h7v7l9-11h-7z" /> },
      { label: 'Report', page: Page.Report, icon: <Icon path="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /> },
    ],
  },
  {
    title: 'SETTINGS',
    items: [
      { label: 'Chart of Account', page: Page.ChartOfAccount, icon: <Icon path="M4 6h16M4 10h16M4 14h16M4 18h16" /> },
      { label: 'Supplier', page: Page.Supplier, icon: <Icon path="M8 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-2m-4-1v8m0 0l3-3m-3 3L9 8m-5 5h2.586a1 1 0 01.707.293l2.414 2.414a1 1 0 001.414 0l2.414-2.414a1 1 0 01.707-.293H17" /> },
      { label: 'Contact', page: Page.Contact, icon: <Icon path="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /> },
      { label: 'Expense Category', page: Page.ExpenseCategory, icon: <Icon path="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l-3 3m0 0l-3-3m3 3v12" /> },
    ],
  },
  {
    title: 'HUMAN RESOURCE',
    items: [
      { label: 'Staff', page: Page.Staff, icon: <Icon path="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21v-1a6 6 0 00-1.75-4.472" /> },
      { label: 'Payroll', page: Page.Payroll, icon: <Icon path="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /> },
    ],
  },
];
