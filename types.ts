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
   PRODUCT TYPE
========================================================= */

export interface ProductType extends BaseEntity {
    code: string;

    name: string;

    description?: string;
}

/* =========================================================
   CATEGORY
========================================================= */

export interface Category extends BaseEntity {
    code: string;

    typeId: string;

    name: string;

    description?: string;
}

/* =========================================================
   SUB CATEGORY
========================================================= */

export interface SubCategory extends BaseEntity {
    code: string;

    categoryId: string;

    name: string;

    description?: string;
}

/* =========================================================
   BRAND
========================================================= */

export interface Brand extends BaseEntity {
    code: string;

    name: string;

    shortName?: string;

    country?: string;
}

/* =========================================================
   VARIATION
========================================================= */

export interface Variation extends BaseEntity {
    name: string;
    type: string;
    value: string;
}

/* =========================================================
   PRODUCT
========================================================= */

export interface Product extends BaseEntity {
    productNumber: string;
    sku: string;
    barcode?: string;
    shortName?: string;
    name: string;
    description?: string;
    typeId: string;
    categoryId: string;
    subCategoryId?: string;
    brandId?: string;
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
    status:
        | 'Active'
        | 'Inactive'
        | 'Discontinued';
}

/* =========================================================
   PRODUCT UNIT (IMEI / SERIAL TRACKING)
========================================================= */
export type productData = {
    id: string;
    sku?: string;
    productNumber?: string;
    barcode?: string;
    shortName?: string;
    model?: string;
    name: string;
    category: string;
    brand: string;
    variation: string;
    costPrice: number;
    hasSerialNumber: boolean;
    hasIMEI: boolean;
    price: number;
    stockByLocation: Record<string, number>;
    serialNumbersByLocation?: Record<string, string[]>;
    status: 'In Stock' | 'Low Stock' | 'Out of Stock';
    history: {
        date: string;
        action: StockAction;
        change: number;
        newStock: number;
        branch: string;
        reason?: string;
    }[];
};

export type DataProduct = productData;

export type ProductUnitStatus =
    | 'In Stock'
    | 'Sold'
    | 'Repair'
    | 'Returned'
    | 'Reserved'
    | 'Damaged';

export interface ProductUnit extends BaseEntity {
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

export interface StockHistory extends BaseEntity {
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
   PURCHASE ORDER
========================================================= */
export interface PurchaseOrder {
    id: string;
    poNumber: string;
    branchId: string;
    supplier: string;
    orderDate: string;
    expectedDate?: string;
    items: LineItem[];
    subtotal: number;
    total: number;
    status:
    | 'Draft'
    | 'Pending'
    | 'Approved'
    | 'Completed'
    | 'Cancelled'
    | 'Paid'
    | 'Partial'
    | 'Unpaid';
}

/* =========================================================
   PURCHASE
========================================================= */

export interface Purchase extends BaseEntity {
    purchaseNumber?: string;
    poId?: string;
    supplier: string;
    branchId: string;
    purchaseDate: string;
    invoiceNumber?: string;
    items: LineItem[];
    subtotal: number;
    discount?: number;
    tax?: number;
    total: number;
    status:
        | 'Unpaid'
        | 'Partial'
        | 'Paid'
        | 'Received'
        | 'Completed';
    note?: string;
}

/* =========================================================
   SALE
========================================================= */

export interface Sale extends BaseEntity {
    saleNumber?: string;

    branchId: string;

    customerId?: string;

    customer: string;

    saleDate: string;

    items: LineItem[];

    subtotal?: number;

    discount?: number;

    tax?: number;

    total: number;

    paymentMethod?: // This was already optional, keeping it as is
        | 'Cash'
        | 'Card'
        | 'Bank Transfer'
        | 'ABA'
        | 'Credit';

    status:
        | 'Pending'
        | 'Paid'
        | 'Completed';

    note?: string;
}

/* =========================================================
   REPAIR
========================================================= */

export type RepairStatus =
    | 'Pending'
    | 'In Progress'
    | 'Completed'
    | 'Cancelled';

export interface Repair extends BaseEntity {
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
    
    total: number; // Added total to Repair interface

    note?: string;

    status: RepairStatus;
}

/* =========================================================
   SETTLEMENT
========================================================= */

export interface Settlement extends BaseEntity {
    settlementNumber: string;

    saleId?: string;

    repairId?: string;

    amount: number;

    paymentMethod: string;

    settlementDate: string;

    note?: string;
}

/* =========================================================
   STOCK TRANSFER
========================================================= */

export interface StockTransfer extends BaseEntity {
    transferNumber: string;
    fromBranchId: string;
    toBranchId: string;
    transferDate: string;
    items: LineItem[];
    note?: string;
    status:
        | 'Pending'
        | 'Completed'
        | 'Cancelled';
}

/* =========================================================
   SUPPLIER
========================================================= */

export interface Supplier extends BaseEntity {
    supplierCode: string;

    name: string;

    shortName?: string;

    contactPerson?: string;

    phone?: string;

    email?: string;

    address?: string;

    taxNumber?: string;

    note?: string;
}

/* =========================================================
   CONTACT
========================================================= */

export interface Contact extends BaseEntity {
    name: string;

    company?: string;

    phone?: string;

    email?: string;

    address?: string;

    type:
        | 'Customer'
        | 'Supplier'
        | 'Other';
}

/* =========================================================
   EXPENSE CATEGORY
========================================================= */

export interface ExpenseCategory extends BaseEntity {
    code: string;

    name: string;

    description?: string;
}

/* =========================================================
   EXPENSE
========================================================= */

export interface Expense extends BaseEntity {
    expenseNumber: string;

    branchId?: string;

    categoryId: string;

    amount: number;

    expenseDate: string;

    description?: string;

    paymentMethod?: string;
}

/* =========================================================
   ACCOUNTS PAYABLE
========================================================= */

export interface AccountsPayable extends BaseEntity {
    supplierId: string;

    purchaseId?: string;

    dueDate: string;

    amount: number;

    paidAmount?: number;

    balanceAmount?: number;

    status:
        | 'Pending'
        | 'Partial'
        | 'Paid';
}

/* =========================================================
   ACCOUNTS RECEIVABLE
========================================================= */

export interface AccountsReceivable extends BaseEntity {
    customerId?: string;

    saleId?: string;

    dueDate: string;

    amount: number;

    receivedAmount?: number;

    balanceAmount?: number;

    status:
        | 'Pending'
        | 'Partial'
        | 'Received';
}

/* =========================================================
   CASH FLOW
========================================================= */

export interface CashFlow extends BaseEntity {
    branchId?: string;

    type:
        | 'Income'
        | 'Expense';

    category: string;

    amount: number;

    date: string;

    referenceId?: string;

    note?: string;
}

/* =========================================================
   TAX PAYMENT
========================================================= */

export interface TaxPayment extends BaseEntity {
    taxType: string;

    amount: number;

    paymentDate: string;

    note?: string;
}

/* =========================================================
   CHART OF ACCOUNT
========================================================= */

export interface ChartOfAccount extends BaseEntity {
    code: string;

    name: string;

    type:
        | 'Asset'
        | 'Liability'
        | 'Equity'
        | 'Revenue'
        | 'Expense';

    parentId?: string;
}

/* =========================================================
   STAFF
========================================================= */

export interface Staff extends BaseEntity {
    staffCode: string;

    firstName: string;

    lastName: string;

    gender?: string;

    phone?: string;

    email?: string;

    address?: string;

    role?: string;

    salary?: number;

    joinDate?: string;

    branchId?: string;
}

/* =========================================================
   PAYROLL
========================================================= */

export interface Payroll extends BaseEntity {
    payrollNumber: string;

    staffId: string;

    month: string;

    baseSalary: number;

    allowance?: number;

    deduction?: number;

    overtime?: number;

    netSalary: number;

    paymentDate?: string;

    status:
        | 'Pending'
        | 'Paid';
}

/* =========================================================
   REPORT
========================================================= */

export interface Report extends BaseEntity {
    title: string;

    type: string;

    generatedDate: string;

    generatedBy?: string;

    data?: any;
}