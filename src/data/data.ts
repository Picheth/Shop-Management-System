import React from 'react';
import {
    Page,
    Branch,
    Product,
    Supplier,
    Staff,
    ExpenseCategory,
    Purchase,
    Sale,
    StockTransfer,
    Repair,
    NavSection,
} from './types';
import { 
    DashboardIcon, 
    ProductIcon, 
    AttributesIcon, 
    PurchaseIcon, 
    SaleIcon, 
    TransferIcon, 
    InventoryIcon 
} from './components/ui/Icons';

/* =========================================================
   BRANCHES
========================================================= */

export const mockBranches: Branch[] = [
    {
        id: 'B1',
        code: 'HQ',
        name: 'Head Office',
        location: 'Phnom Penh',
        phone: '012345678',
        email: 'hq@store.com',
        is_active: true,
    },
    {
        id: 'B2',
        code: 'SR',
        name: 'Siem Reap Branch',
        location: 'Siem Reap',
        phone: '098765432',
        email: 'sr@store.com',
        is_active: true,
    },
];

/* =========================================================
   PRODUCTS
========================================================= */

export const mockProducts: Product[] =
    [
        
    ];


/* =========================================================
   SUPPLIERS
========================================================= */

export const mockSuppliers: Supplier[] = [
    {
        id: 'S1',
        code: 'SUP-001',
        name: 'Default Supplier',
        phone: '011223344',
    },
];

/* =========================================================
   STAFF
========================================================= */

export const mockStaff: Staff[] = [
    {
        id: 'ST1',
        code: 'EMP-001',
        name: 'Admin',
        role: 'Manager',
    },
];

/* =========================================================
   EXPENSE CATEGORIES
========================================================= */

export const mockExpenseCategories: ExpenseCategory[] = [
    {
        id: 'EX1',
        code: 'RENT',
        name: 'Rent',
    },
];

/* =========================================================
   PURCHASES
========================================================= */

export const Purchases: Purchase[] = [
    {
        id: 'P1',
        purchase_number: 'PUR-001',
        supplier_id: 'Default Supplier',
        branch_id: 'B1',
        purchase_date: '2026-05-01',
        total: 950,
        items: [
            {
                sku: 'IPHONE15-128',
                product_id: 'P1',
                product_name: 'iPhone 15 128GB',
                quantity: 1,
                price: 950,
            },
        ],
        history: [
            {
                date: '2026-01-01',
                action: 'Initial Stock',
                change: 10,
                newStock: 10,
                branch: 'Head Office'
            },
        ],
    },
];


/* =========================================================
   SALES
========================================================= */

export const mockSales: Sale[] = [
    {
        id: 'SAL-001',
        customer: 'Walk-in Customer',
        branch_id: 'B1',
        sale_date: '2026-05-02',
        total: 950,
        items: [
            {
                sku: 'IPHONE15-128',
                product_id: 'P1',
                product_name: 'iPhone 15 128GB',
                quantity: 1,
                price: 950,
            },
        ],
    },
];

/* =========================================================
   STOCK TRANSFERS
========================================================= */

export const mockStockTransfers: StockTransfer[] = [
    {
        id: 'ST-001',
        transfer_number: 'TRF-001',
        from_branch_id: 'B1',
        to_branch_id: 'B2',
        transfer_date: '2026-05-01',
        total: 950,
        items: [
            {
                sku: 'IPHONE15-128',
                product_id: 'P1',
                product_name: 'iPhone 15 128GB',
                quantity: 1,
                price: 950,
            },
        ],
        status: 'Pending',
        quantity: undefined,
    },
];

/* =========================================================
   REPAIRS
========================================================= */

export const mockRepairs: Repair[] = [
    {
        id: 'R1',
        repair_number: 'REP-001',
        branch_id: 'B1',
        customer_id: 'C1',
        customer: 'Walk-in Customer',
        product_id: 'P1',
        product_name: 'iPhone 15 128GB',
        serial_number: 'SN1',
        
    },
];

/* =========================================================
   NAVIGATION MENU
========================================================= */

export const navItems = [
    {
        label: 'Dashboard',
        page: Page.Dashboard,
        icon: DashboardIcon,
    },
    {
        label: 'Product',
        page: Page.Product,
        icon: ProductIcon,
    },
    {
        label: 'Attributes',
        page: Page.ProductAttributes,
        icon: AttributesIcon,
    },
    {
        label: 'Purchase',
        page: Page.Purchase,
        icon: PurchaseIcon,
    },
    {
        label: 'Sale',
        page: Page.Sale,
        icon: SaleIcon,
    },
    {
        label: 'Stock Transfer',
        page: Page.StockTransfer,
        icon: TransferIcon,
    },
    {
        label: 'Inventory',
        page: Page.Inventory,
        icon: InventoryIcon,
    },
];

export const navSections: NavSection[] = [
    
];

/* =========================================================
   OTHER CONSTANTS
========================================================= */

export const lowStockThreshold = 10;
