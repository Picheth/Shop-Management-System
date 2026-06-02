import React from 'react';
import {
    Page,
    Branch,
    DataProduct,
    Category,
    SubCategory,
    Brand,
    ProductType,
    Supplier,
    Staff,
    ExpenseCategory,
    Purchase,
    Sale,
    StockTransfer,
    Repair,
    LineItem,
    StockHistoryItem,
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
        active: true,
    },
    {
        id: 'B2',
        code: 'SR',
        name: 'Siem Reap Branch',
        location: 'Siem Reap',
        phone: '098765432',
        email: 'sr@store.com',
        active: true,
    },
];

/* =========================================================
   PRODUCTS
========================================================= */

export const mockProducts: DataProduct[] =
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
        purchaseNumber: 'PUR-001',
        supplier: 'Default Supplier',
        branchId: 'B1',
        purchaseDate: '2026-05-01',
        total: 950,
        items: [
            {
                sku: 'IPHONE15-128',
                productId: 'P1',
                productName: 'iPhone 15 128GB',
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
        branchId: 'B1',
        saleDate: '2026-05-02',
        total: 950,
        items: [
            {
                sku: 'IPHONE15-128',
                productId: 'P1',
                productName: 'iPhone 15 128GB',
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
        transferNumber: 'TRF-001',
        fromBranchId: 'B1',
        toBranchId: 'B2',
        transferDate: '2026-05-01',
        total: 950,
        items: [
            {
                sku: 'IPHONE15-128',
                productId: 'P1',
                productName: 'iPhone 15 128GB',
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
        repairNumber: 'REP-001',
        branchId: 'B1',
        customer: 'John Doe',
        issue: 'Screen broken',
        entryDate: '2026-05-01',
        total: 50,
        status: 'Pending',
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
