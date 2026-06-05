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
    created_at?: string;
    updated_at?: string;
    is_active?: boolean;
}

/* =========================================================
   MASTER ATTRIBUTE TABLES
========================================================= */

export interface MasterAttribute extends BaseEntity {
    name: string;
    code?: string;
    description?: string;
    is_active?: boolean;
    created_at?: string;
    updated_at?: string;

}

/* =========================================================
   SPEC & VARIANT SYSTEM
========================================================= */

export interface ProductSpec extends BaseEntity {
    name: string;
    brand_id: string;
    type_id: string;
    category_id: string;
    sub_category_id?: string;
    short_model?: string;
    model?: string;
    display_size?: string;
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
    product_id: string;
    sku: string;
    name?: string;
    price?: number;
    cost?: number;
    stock_quantity?: number;
    barcode?: string;
    processor_id?: string;
    ram_id?: string;
    storage_id?: string;
    color_id?: string;
    region_id?: string;
    condition_id?: string;
    is_active?: boolean; // This is already snake_case
    created_at?: string;
    updated_at?: string;
    
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


// that might aggregate attributes from ProductType.ts

// For now, they stay here as they are not just "attributes".

export interface Product extends BaseEntity {
    [x: string]: any;
    product_number: string;
    sku: string;
    barcode?: string;
    short_name?: string;
    name: string;
    description?: string;
    type_id?: string;
    category_id: string;
    sub_category_id?: string;
    brand_id?: string;
    brand?: string;
    model?: string;
    product_spec_id?: string;
    processor_id?: string;
    ram_id?: string;
    storage_id?: string;
    color_id?: string;
    region_id?: string;
    condition_id?: string;
    variation?: string;
    color?: string;
    display_size?: string;
    storage?: string;
    ram?: string;
    cost_price: number;
    sale_price: number;
    wholesale_price?: number;
    reorder_level?: number;
    has_serial_number: boolean;
    has_imei: boolean;
    warranty_days?: number;
    image_url?: string;
    tags?: string[];
    attributes?: ProductAttribute[];
    initial_stock: number; // This is already snake_case
    stock_quantity?: number;
    stock_by_location: Record<string, number>;
    serial_numbers_by_location?: Record<
        string,
        string[]
    >;
    short_model?: string;
    processor_codes?: { [key: string]: string };
    ram_codes?: { [key: string]: string };
    storage_codes?: { [key: string]: string };
    color_codes?: { [key: string]: string };
    region_codes?: { [key: string]: string };
    condition_codes?: { [key: string]: string };
    status: ProductStatus;
    history?: StockHistoryItem[];
}

export type ProductForm = Omit<
    Product,
    | 'id'
    | 'created_at'
    | 'updated_at'
    | 'stock_by_location'
    | 'status'
    | 'history'
    | 'stock_quantity'
    | 'serial_numbers_by_location'
    | 'product_spec_id'
    | 'product_number'

>;


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
    product_id: string;
    branch_id: string;

    serial_number?: string;
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

    cost_price: number;
    sale_price?: number;

    purchase_id?: string;
    saleId?: string;

    supplier_d?: string;
    customer_id?: string;

    repair_id?: string;

    status: ProductUnitStatus;
}

export type ProductUnitForm = Omit<
    ProductUnit,
    | 'status'
>;


/* =========================================================
   STOCK HISTORY
========================================================= */

export interface StockHistory {
    date: string;

    product_id: string;

    branch_id: string;

    action: StockAction;

    change: number;

    previousStock?: number;

    newStock: number;

    branch: string;

    reference_id?: string;

    reason?: string;
    note?: string;

    created_by?: string;
    updated_by?: string;
    created_at?: string;
    updated_at?: string;
    history?: StockHistoryItem[];
}

/* =========================================================
   INVENTORY SUMMARY
========================================================= */

export interface InventoryStock {
    product_id: string;
    branch_id: string;
    quantity: number;
}

/* =========================================================
   LINE ITEM
========================================================= */

export interface LineItem {
    sku?: string;

    product_id: string;

    product_name: string;

    quantity: number;

    price: number;

    discount?: number;

    total?: number;

    serial_numbers?: string[];
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
    purchase_number?: string;
    id: string;
    supplier_id: string;
    branch_id: string;
    purchase_date: string;
    expected_date?: string;
    items: LineItem[];
    total: number;
    status?: PurchaseStatus;
    history?: StockHistoryItem[];
    note?: string;
    signature_url?: string;
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
    po_number?: string;
    id: string;
    supplier: string;
    branch_id: string;
    order_date: string;
    expected_date: string;
    items: LineItem[];
    total: number;
    status: PurchaseOrderStatus;
}

/* =========================================================
   SALE
========================================================= */

export type SaleStatus = 'Pending' | 'Completed' | 'Cancelled';

export interface Sale {
    sale_number?: string;
    id: string;
    customer: string;
    branch_id: string;
    sale_date: string;
    items: LineItem[];
    total: number;
    status?: SaleStatus;
}

/* =========================================================
   SETTLEMENT
========================================================= */

export interface Settlement extends BaseEntity {
    settlement_number?: string;

    branch_id: string;

    date: string;

    total_in: number;

    total_out: number;

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
    transfer_number?: string;
    from_branch_id: string;
    to_branch_id: string;
    transfer_date: string;
    id: string;
    short_code?: string;
    items: LineItem[];
    total: number;
    note?: string;
    status: StockTransferStatus;
    quantity?: number;
    history?: StockHistoryItem[];
    created_at?: string;
    updated_at?: string;
    purpose?: string;
    signature_url?: string;
    purpose_options?: string[];

}

/* =========================================================
   BRANCH LOCATION
========================================================= */

export interface BranchLocation {
    branch_id: string;

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

    contact_person?: string;

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
    expense_number?: string;

    category_id: string;

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
    payroll_number?: string;
    staff_id: string;
    month: string;
    basic_salary: number;
    allowances?: number;
    deductions?: number;
    total_salary: number;
    payment_date: string;
    note?: string;
    status: 'Pending' | 'Paid';
}

/* =========================================================
   REPORT
========================================================= */

export interface Report {
    title: string;

    description?: string;

    generated_at?: string;

    generated_by: string;
}

/* =========================================================
   SUMMARY REPORT
========================================================= */

export interface SummaryReport
    extends Report {
    period_start: string;

    period_end: string;
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

    gross_profit: number;

    operating_expenses: number;

    net_income: number;
}

/* =========================================================
   PROFIT AND LOSS
========================================================= */

export interface ProfitAndLoss
    extends Report {
    total_revenue: number;

    total_expenses: number;

    net_profit: number;
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
    contact_person?: string;
    phone?: string;
    email?: string;
    address?: string;
    note?: string;
    active: boolean;
    created_at?: string;
    updated_at?: string;
    history?: StockHistoryItem[];
    check_stock_availability?: boolean;
}



export type RepairStatus =
    | 'Pending'
    | 'In Progress'
    | 'Completed'
    | 'Cancelled';

export interface Repair {
    repair_number?: string;
    id: string;
    branch_id: string;
    customer_id?: string;
    customer: string;
    phone?: string;
    product_id?: string;
    product_name?: string;
    serial_number?: string;
    imei?: string;
    device?: string;
    issue: string;
    diagnosis?: string;
    solution?: string;
    technician?: string;
    labor_rate?: number; // This is already snake_case
    hours_worked?: number; // This is already snake_case
    commission_type?: 'Percentage' | 'Fixed';
    commission_rate?: number;
    commission_amount?: number;
    estimated_cost?: number;
    repair_cost?: number;
    repair_date?: string; // Made optional as it's not always present in form
    repair_data?: string; // Made optional as it's not always present in form
    completion_date?: string; // This is already snake_case
    editing_id?: string; // Made optional as it's not always present in form
    entry_date: string; // This is already snake_case
    completed_date?: string; // This is already snake_case
    items?: LineItem[];
    total: number;
    note?: string;
    status: RepairStatus;
    history?: StockHistoryItem[];
    items_per_page?: number;
    items_per_page_options?: number[];
    created_at?: string;
    updated_at?: string;
    check_stock_availability?: boolean;
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