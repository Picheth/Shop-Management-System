import React from 'react';

/* =========================================================
   ENUMS
========================================================= */

export enum Page {
    Dashboard = 'Dashboard',
    Product = 'Product',
    ProductType = 'ProductType',
    Category = 'Category',
    SubCategory = 'SubCategory',
    Brand = 'Brand',
    Variation = 'Variation',
    PurchaseOrder = 'PurchaseOrder',
    Purchase = 'Purchase',
    Sale = 'Sale',
    Settlement = 'Settlement',
    RepairCenter = 'RepairCenter',
    Inventory = 'Inventory',
    StockTransfer = 'StockTransfer',
    BranchLocation = 'BranchLocation',
    Supplier = 'Supplier',
    Contact = 'Contact',
    Expense = 'Expense',
    ExpenseCategory = 'ExpenseCategory',
    AccountsPayable = 'AccountsPayable',
    AccountsReceivable = 'AccountsReceivable',
    CashFlow = 'CashFlow',
    TaxPayment = 'TaxPayment',
    Staff = 'Staff',
    Payroll = 'Payroll',
    Report = 'Report',
    SummaryReport = 'SummaryReport',
    BalanceSheet = 'BalanceSheet',
    IncomeStatement = 'IncomeStatement',
    ProfitAndLoss = 'ProfitAndLoss',
    ChartOfAccount = 'ChartOfAccount',
}

/* =========================================================
   NAVIGATION
========================================================= */

export interface NavItem {
    label: string;
    page: Page;
    icon: React.ReactElement;
}

export interface NavSection {
    title: string;
    items: NavItem[];
}

/* =========================================================
   COMMON
========================================================= */

export interface BaseEntity {
    id: string;
    createdAt?: string;
    updatedAt?: string;
    active?: boolean;
}

/* =========================================================
   BRANCH
========================================================= */

export interface Branch extends BaseEntity {
    code: string;
    name: string;
    location?: string;
    address?: string;
    phone?: string;
    email?: string;
}

/* =========================================================
   PRODUCT
========================================================= */

export type ProductStatus =
    | 'In Stock'
    | 'Low Stock'
    | 'Out of Stock';

export type StockAction =
    | 'Initial Stock'
    | 'Purchase'
    | 'Sale'
    | 'Adjustment'
    | 'Stock Adjustment'
    | 'Transfer In'
    | 'Transfer Out'
    | 'Repair'
    | 'Repair Used'
    | 'Repair Returned'
    | 'Return';

export interface StockHistoryItem {
    date: string;
    action: StockAction;
    change: number;
    newStock: number;
    branch: string;
    reason?: string;
}

export interface Product extends BaseEntity {
    productNumber: string;

    sku: string;
    barcode?: string;

    shortName?: string;

    name: string;
    description?: string;

    typeId?: string;
    categoryId: string;
    subCategoryId?: string;

    brandId?: string;
    brand?: string;

    model?: string;
    variation?: string;

    color?: string;
    size?: string;
    storage?: string;
    ram?: string;

    costPrice: number;
    salePrice: number;

    wholesalePrice?: number;

    reorderLevel?: number;

    hasSerialNumber: boolean;
    hasIMEI: boolean;

    warrantyDays?: number;

    imageUrl?: string;

    tags?: string[];

    stockByLocation: Record<string, number>;

    serialNumbersByLocation?: Record<
        string,
        string[]
    >;

    status: ProductStatus;

    history?: StockHistoryItem[];
}

export type ProductForm = Omit<
    Product,
    | 'id'
    | 'createdAt'
    | 'updatedAt'
    | 'stockByLocation'
    | 'status'
    | 'history'
>;

export interface DataProduct extends Product {
    stockByLocation: Record<string, number>;
    history?: StockHistoryItem[];
    status: ProductStatus;
    serialNumbersByLocation?: Record<
        string,
        string[]
    >;
    imageUrl?: string;
    tags?: string[];
    hasSerialNumber: boolean;
    hasIMEI: boolean;
    salePrice: number;
    costPrice: number;
}

/* =========================================================
   PRODUCT TYPE
========================================================= */

export interface ProductType
    extends BaseEntity {
    code: string;
    name: string;
    description?: string;
    active: boolean;
}

/* =========================================================
   CATEGORY
========================================================= */

export interface Category
    extends BaseEntity {
    code: string;
    typeId: string;
    name: string;
    description?: string;
    active: boolean;
}

/* =========================================================
   SUB CATEGORY
========================================================= */

export interface SubCategory
    extends BaseEntity {
    code: string;
    categoryId: string;
    name: string;
    description?: string;
    active: boolean;
}

/* =========================================================
   BRAND
========================================================= */

export interface Brand
    extends BaseEntity {
    code: string;
    name: string;
    shortName?: string;
    country?: string;
}

/* =========================================================
   VARIATION
========================================================= */

export interface Variation
    extends BaseEntity {
    name: string;
    type: string;
    value: string;
}

/* =========================================================
   PRODUCT UNIT
========================================================= */

export type ProductUnitStatus =
    | 'In Stock'
    | 'Sold'
    | 'Repair'
    | 'Returned'
    | 'Reserved'
    | 'Damaged';

export interface ProductUnit
    extends BaseEntity {
    productId: string;
    branchId: string;

    serialNumber?: string;
    imei?: string;

    barcode?: string;
    qrCode?: string;

    condition?:
        | 'New'
        | 'Used'
        | 'Refurbished';

    batteryHealth?: number;

    color?: string;
    storage?: string;
    ram?: string;

    costPrice: number;
    salePrice?: number;

    purchaseId?: string;
    saleId?: string;

    supplierId?: string;
    customerId?: string;

    repairId?: string;

    status: ProductUnitStatus;
}

/* =========================================================
   STOCK HISTORY
========================================================= */

export interface StockHistory
    extends BaseEntity {
    date: string;

    productId: string;

    branchId: string;

    action: StockAction;

    change: number;

    previousStock?: number;

    newStock: number;

    branch: string;

    referenceId?: string;

    reason?: string;
    note?: string;

    createdBy?: string;
}

/* =========================================================
   INVENTORY SUMMARY
========================================================= */

export interface InventoryStock {
    productId: string;
    branchId: string;
    quantity: number;
}

/* =========================================================
   LINE ITEM
========================================================= */

export interface LineItem {
    sku?: string;

    productId: string;

    productName: string;

    quantity: number;

    price: number;

    discount?: number;

    total?: number;

    serialNumbers?: string[];
    imeis?: string[];
}

/* =========================================================
   PURCHASE
========================================================= */

export type PurchaseStatus =
    | 'Pending'
    | 'Ordered'
    | 'Received'
    | 'Cancelled';

export interface Purchase
    extends BaseEntity {
    purchaseNumber?: string;

    supplier: string;

    branchId: string;

    purchaseDate: string;

    expectedDate?: string;

    items: LineItem[];

    total: number;

    status?: PurchaseStatus;

    history?: StockHistoryItem[];

    note?: string;
}

/* =========================================================
   PURCHASE ORDER
========================================================= */

export type PurchaseOrderStatus =
    | 'Pending'
    | 'Ordered'
    | 'Received'
    | 'Cancelled';

export interface PurchaseOrder
    extends BaseEntity {
    poNumber?: string;

    supplier: string;

    branchId: string;

    orderDate: string;

    expectedDate: string;

    items: LineItem[];

    total: number;

    status: PurchaseOrderStatus;
}

/* =========================================================
   SALE
========================================================= */

export type SaleStatus = 'Pending' | 'Completed' | 'Cancelled';

export interface Sale
    extends BaseEntity {
    saleNumber?: string;

    customer: string;

    branchId: string;

    saleDate: string;

    items: LineItem[];

    total: number;

    status?: SaleStatus;
}

/* =========================================================
   SETTLEMENT
========================================================= */

export interface Settlement
    extends BaseEntity {
    settlementNumber?: string;

    branchId: string;

    date: string;

    totalIn: number;

    totalOut: number;

    note?: string;
}

/* =========================================================
   STOCK TRANSFER
========================================================= */

export type StockTransferStatus =
    | 'Pending'
    | 'In Transit'
    | 'Completed'
    | 'Cancelled';

export interface StockTransfer
    extends BaseEntity {
    transferNumber?: string;

    fromBranchId: string;

    toBranchId: string;

    transferDate: string;

    items: LineItem[];

    total: number;

    status: StockTransferStatus;

    note?: string;
}

/* =========================================================
   BRANCH LOCATION
========================================================= */

export interface BranchLocation
    extends BaseEntity {
    branchId: string;

    name: string;

    address?: string;

    phone?: string;
}

/* =========================================================
   SUPPLIER
========================================================= */

export interface Supplier
    extends BaseEntity {
    code: string;

    name: string;

    contactPerson?: string;

    phone?: string;

    email?: string;

    address?: string;
}

/* =========================================================
   CONTACT
========================================================= */

export interface Contact
    extends BaseEntity {
    name: string;

    phone?: string;

    email?: string;

    address?: string;
}

/* =========================================================
   EXPENSE CATEGORY
========================================================= */

export interface ExpenseCategory
    extends BaseEntity {
    code: string;

    name: string;

    description?: string;
}

/* =========================================================
   EXPENSE
========================================================= */

export interface Expense
    extends BaseEntity {
    expenseNumber?: string;

    categoryId: string;

    amount: number;

    date: string;

    note?: string;
}

/* =========================================================
   STAFF
========================================================= */

export interface Staff
    extends BaseEntity {
    code: string;

    name: string;

    role?: string;

    phone?: string;

    email?: string;

    address?: string;
}

/* =========================================================
   PAYROLL
========================================================= */

export interface Payroll
    extends BaseEntity {
    payrollNumber?: string;

    staffId: string;

    month: string;

    basicSalary: number;

    allowances?: number;

    deductions?: number;

    totalSalary: number;

    paymentDate: string;

    note?: string;
}

/* =========================================================
   REPORT
========================================================= */

export interface Report
    extends BaseEntity {
    title: string;

    description?: string;

    generatedAt: string;
}

/* =========================================================
   SUMMARY REPORT
========================================================= */

export interface SummaryReport
    extends Report {
    periodStart: string;

    periodEnd: string;
}

/* =========================================================
   BALANCE SHEET
========================================================= */

export interface BalanceSheet
    extends Report {
    assets: number;

    liabilities: number;

    equity: number;
}

/* =========================================================
   INCOME STATEMENT
========================================================= */

export interface IncomeStatement
    extends Report {
    revenue: number;

    costOfGoodsSold: number;

    grossProfit: number;

    operatingExpenses: number;

    netIncome: number;
}

/* =========================================================
   PROFIT AND LOSS
========================================================= */

export interface ProfitAndLoss
    extends Report {
    totalRevenue: number;

    totalExpenses: number;

    netProfit: number;
}

/* =========================================================
   CHART OF ACCOUNT
========================================================= */

export interface ChartOfAccount
    extends BaseEntity {
    code: string;

    name: string;

    type:
        | 'Asset'
        | 'Liability'
        | 'Equity'
        | 'Revenue'
        | 'Expense';
}

/* =========================================================
   REPAIR CENTER
========================================================= */

export interface RepairCenter
    extends BaseEntity {
    code: string;

    name: string;

    contactPerson?: string;

    phone?: string;

    email?: string;

    address?: string;
}

/* =========================================================
   REPAIR
========================================================= */

export type RepairStatus =
    | 'Pending'
    | 'In Progress'
    | 'Completed'
    | 'Cancelled';

export interface Repair
    extends BaseEntity {
    repairNumber?: string;

    branchId: string;

    customerId?: string;

    customer: string;

    phone?: string;

    productId?: string;

    productName?: string;

    serialNumber?: string;

    imei?: string;

    device?: string;

    issue: string;

    diagnosis?: string;

    solution?: string;

    technician?: string;

    estimatedCost?: number;

    repairCost?: number;

    entryDate: string;

    completedDate?: string;

    items?: LineItem[];

    total: number;

    note?: string;

    status: RepairStatus;
}

/* =========================================================
   CSS MODULE
========================================================= */

export interface cssModule {
    name: string;
    css: string;
}