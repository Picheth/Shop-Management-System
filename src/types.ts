import React from 'react';
import { ProductAttribute } from './Types/ProductSpecs';
export type { ProductAttribute } from './Types/ProductSpecs';
 
/* =========================================================
   ENUMS
========================================================= */

export enum Page {
    Dashboard = 'Dashboard',
    Product = 'Product',
    ProductAttributes = 'ProductAttributes',
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
    ErrorDashboard = 'ErrorDashboard',
    CompanySettings = 'CompanySettings'
}

/* =========================================================
   NAVIGATION
========================================================= */

export interface NavItem {
    label: string;
    page: Page;
    icon: React.ReactElement;
    disabled?: boolean;
    children?: NavItem[];
    onClick?: () => void;
    href?: string;
    external?: boolean;
    active?: boolean;
}

export interface NavSection {
    title: string;
    items: NavItem[];
    disabled?: boolean;
    icon?: React.ReactElement;
    children?: NavSection[];
    onClick?: () => void;
    href?: string;
    external?: boolean;
    active?: boolean;
    id?: string;
    className?: string;
    style?: React.CSSProperties;
}

export type NavConfig = NavSection[];

export interface NavContextType {
    currentPage: Page;
    setCurrentPage: (page: Page) => void;
}

export interface SidebarProps {
    currentPage: Page;
    setCurrentPage: (page: Page) => void;
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    handleNavigation?: (page: Page) => void;
    children?: React.ReactNode;
    pendingTransfersCount?: number;
    pendingRepairsCount?: number;
        userRole?: string;
    className?: string;
    style?: React.CSSProperties;
    ariaLabel?: string;
    ariaExpanded?: boolean;
    ariaControls?: string;
    ariaHasPopup?: boolean;
    onClick?: () => void;
    onKeyDown?: (event: React.KeyboardEvent) => void;
    onKeyUp?: (event: React.KeyboardEvent) => void;
    onKeyPress?: (event: React.KeyboardEvent) => void;
    onToggle?: () => void;
    onOpen?: () => void;
    onClose?: () => void;
}

/* =========================================================
   TYPES
========================================================= */
export * from './utils/ProductType'; // Re-exporting types from ProductType.ts for easier imports in components

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
   MASTER ATTRIBUTE TABLES
========================================================= */

export interface MasterAttribute extends BaseEntity {
    name: string;
    code?: string;
}

/* =========================================================
   SPEC & VARIANT SYSTEM
========================================================= */

export interface ProductSpec extends BaseEntity {
    name: string;
    brandId: string;
    typeId: string;
    categoryId: string;
    subCategoryId?: string;
    shortModel?: string;
    model?: string;
    displaySize?: string;
    status: 'active' | 'inactive';
}

export interface AddProductFormProps {
    productSpecs: ProductSpec[];
    brands: MasterAttribute[];
    types: MasterAttribute[];
    categories: MasterAttribute[];
    subCategories: MasterAttribute[];
    processors: MasterAttribute[];
    rams: MasterAttribute[];
    storages: MasterAttribute[];
    colors: MasterAttribute[];
    regions: MasterAttribute[];
    conditions: MasterAttribute[];
}

export interface ProductVariant {
  id: string;
  productId: string;
  sku: string;
  name?: string; // optional display name (e.g. "128GB Black USA NEW")
  price?: number;
  cost?: number;
  stockQuantity?: number;
  barcode?: string;
  // Optional references (for master data relations)
  processorId?: string;
  ramId?: string;
  storageId?: string;
  colorId?: string;
  regionId?: string;
  conditionId?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}


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

// Product and DataProduct interfaces remain here as they are core entities
// that might aggregate attributes from ProductType.ts
// If Product and DataProduct also move to ProductType.ts, they would need to be re-exported from there.
// For now, they stay here as they are not just "attributes".

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
    productSpecId?: string;
    processorId?: string;
    ramId?: string;
    storageId?: string;
    colorId?: string;
    regionId?: string;
    conditionId?: string;
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
    attributes?: ProductAttribute[];
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

export interface DataProduct extends Product{
    stockQuantity: number;
    shortModel: string;
    displaySize: string; // only for tablet and laptop
    brand: string;
    model: string;
    color: string;
    storage: string;
    ram: string;
    ondelete: string;
    onupdate: string;
    initialStock: number;
    branchId: string;
    skuSeparator: string;
    skuExcludeSegments: string[];
    processorCodes?: { [key: string]: string };
    ramCodes?: { [key: string]: string };
    storageCodes?: { [key: string]: string };
    colorCodes?: { [key: string]: string };
    regionCodes?: { [key: string]: string };
    conditionCodes?: { [key: string]: string };
    colorId: string;
    conditionId: string;
    isActive?: boolean;
    createdAt?: string;
    updatedAt?: string;
    price?: number;
    stockQuantityByLocation?: Record<string, number>;
    stockHistory?: StockHistoryItem[];
    stockHistoryByLocation?: Record<string, StockHistoryItem[]>;
    stockByLocation: Record<string, number>;
    stock?: number;
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

export interface ProductUnit {
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

export type ProductUnitForm = Omit<
    ProductUnit,
    | 'id'
    | 'createdAt'
    | 'updatedAt'
    | 'status'
>;


/* =========================================================
   STOCK HISTORY
========================================================= */

export interface StockHistory {
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
    dimensions?: string;
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

export interface Purchase extends BaseEntity {
    purchaseNumber?: string;
    id: string;
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

export interface PurchaseOrder {
    poNumber?: string;
    id: string;
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

export interface Sale {
    saleNumber?: string;
    id: string;
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

export interface Settlement extends BaseEntity {
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
    | 'Completed'
    | 'Cancelled';

export interface StockTransfer {
    transferNumber?: string;
    fromBranchId: string;
    toBranchId: string;
    transferDate: string;
    id: string;
    shortCode?: string;
    items: LineItem[];
    total: number;
    note?: string;
    status: StockTransferStatus;
    quantity?: number;
    history?: StockHistoryItem[];
    createdAt?: string;
    updatedAt?: string;
    purpose?: string;
    signatureUrl?: string;
    purposeOptions?: string[];

}

/* =========================================================
   BRANCH LOCATION
========================================================= */

export interface BranchLocation {
    branchId: string;

    name: string;

    address?: string;

    phone?: string;
}

/* =========================================================
   SUPPLIER
========================================================= */

export interface Supplier extends BaseEntity {
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

export interface Contact {
    name: string;

    phone?: string;

    email?: string;

    address?: string;
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
    expenseNumber?: string;

    categoryId: string;

    amount: number;

    date: string;

    note?: string;
}

/* =========================================================
   STAFF
========================================================= */

export interface Staff extends BaseEntity {
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

export interface Payroll extends BaseEntity {
    payrollNumber?: string;
    staffId: string;
    month: string;
    basicSalary: number;
    allowances?: number;
    deductions?: number;
    totalSalary: number;
    paymentDate: string;
    note?: string;
    status: 'Pending' | 'Paid';
}

/* =========================================================
   REPORT
========================================================= */

export interface Report {
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

export interface ChartOfAccount {
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

export interface RepairCenter extends BaseEntity {
    code: string;
    id: string;
    name: string;
    contactPerson?: string;
    phone?: string;
    email?: string;
    address?: string;
    note?: string;
    active: boolean;
    createdAt?: string;
    updatedAt?: string;
    history?: StockHistoryItem[];
    checkStockAvailability?: boolean;
}

/* =========================================================
   REPAIR
========================================================= */

export type RepairStatus =
    | 'Pending'
    | 'In Progress'
    | 'Completed'
    | 'Cancelled';

export interface Repair {
    repairNumber?: string;
    id: string;
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
    laborRate?: number;
    hoursWorked?: number;
    commissionType?: 'Percentage' | 'Fixed';
    commissionRate?: number;
    commissionAmount?: number;
    estimatedCost?: number;
    repairCost?: number;
    entryDate: string;
    completedDate?: string;
    items?: LineItem[];
    total: number;
    note?: string;
    status: RepairStatus;
    history?: StockHistoryItem[];
    createdAt?: string;
    updatedAt?: string;
    checkStockAvailability?: boolean;
}

/* =========================================================
   CSS MODULE
========================================================= */

export interface CssModule {
    name: string;
    css: string;
}


export interface ErrorLog {
    id: string;
    created_at: string;
    message: string;
    stack: string;
    component_name: string;
    url: string;
    severity: 'critical' | 'warning' | 'info';
    user_id?: string;
}

/* =========================================================
   UI / TOAST
========================================================= */

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
    id: string;
    type: ToastType;
    message: string;
}

export interface Notification {
    id: string;
    type: ToastType;
    message: string;
}

/* =====================================================
COMPANY SETTINGS
===================================================== */

export interface CompanySettings {
    name: string;
    address: string;
    phone: string;
    email: string;
    website: string;
    logo: string;
    currency: string;
    taxRate: number;
}

export interface CompanySettingsForm {
    name: string;
    address: string;
    phone: string;
    email: string;
    website: string;
    currency: string;
    taxRate: number;
}

/* =========================================================
   CONFIRMATION MODAL
========================================================= */

export interface ConfirmationModalProps {
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    confirmText?: string;
    isDanger?: boolean;
}

/* =========================================================
   ERROR BOUNDARY
========================================================= */

export interface ErrorBoundaryProps {
    children: React.ReactNode;
    title?: string;
    skeleton?: React.ReactNode;
}

export interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
    isReporting: boolean;
    retryCount: number;
    retryTimer: any;
    MAX_RETRIES: number;
}

/* =========================================================
   WIDGET ERROR BOUNDARY
========================================================= */

export interface WidgetErrorBoundaryProps {
    children: React.ReactNode;
    title?: string;
}

export interface WidgetErrorBoundaryState {
    hasError: boolean;
    retryCount: number;
    error: Error | null;
    isReporting: boolean;
}

/* =========================================================
   EXPORTS
========================================================= */

export * from './utils/ProductType';