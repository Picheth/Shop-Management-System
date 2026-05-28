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
} from './types';

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

export const mockProducts: DataProduct[] = [
    {
        id: 'P1',
        productNumber: 'PRD-001',
        sku: 'IPHONE15-128',
        name: 'iPhone 15 128GB',
        categoryId: 'C1',
        costPrice: 800,
        salePrice: 950,
        hasSerialNumber: true,
        hasIMEI: true,
        status: 'In Stock',

        stockByLocation: {
            B1: 10,
            B2: 5,
        },

        serialNumbersByLocation: {
            B1: ['SN001', 'SN002'],
            B2: ['SN003'],
        },

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
    {
        id: 'P2',
        productNumber: 'PRD-002',
        sku: 'SAMSUNG-S24',
        name: 'Samsung S24',
        categoryId: 'C1',
        costPrice: 700,
        salePrice: 850,
        hasSerialNumber: true,
        hasIMEI: true,
        status: 'Low Stock',

        stockByLocation: {
            B1: 3,
            B2: 2,
        },

        history: [],
    },
];

/* =========================================================
   CATEGORIES
========================================================= */

export const mockCategories: Category[] = [
    {
        id: 'C1',
        code: 'PHONE',
        typeId: 'T1',
        name: 'Smartphones',
        active: true,
    },
];

/* =========================================================
   SUB CATEGORIES
========================================================= */

export const mockSubCategories: SubCategory[] = [
    {
        id: 'SC1',
        code: 'IOS',
        categoryId: 'C1',
        name: 'iOS Phones',
        active: true,
    },
];

/* =========================================================
   BRANDS
========================================================= */

export const mockBrands: Brand[] = [
    {
        id: 'BR1',
        code: 'APL',
        name: 'Apple',
    },
    {
        id: 'BR2',
        code: 'SAM',
        name: 'Samsung',
    },
];

/* =========================================================
   PRODUCT TYPES
========================================================= */

export const mockProductTypes: ProductType[] = [
    {
        id: 'T1',
        code: 'ELEC',
        name: 'Electronics',
        active: true,
    },
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
        transferNumber: 'TRF-2026-001',
        fromBranchId: 'B1',
        toBranchId: 'B2',
        transferDate: '2026-05-03',
        items: [],
        total: 0,
        status: 'Pending',
        note: 'Initial transfer',
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
    { label: 'Dashboard', page: Page.Dashboard },
    { label: 'Products', page: Page.Product },
    { label: 'Purchase', page: Page.Purchase },
    { label: 'Sales', page: Page.Sale },
    { label: 'Stock Transfer', page: Page.StockTransfer },
    { label: 'Inventory', page: Page.Inventory },
];

/* =========================================================
   OTHER CONSTANTS
========================================================= */

export const lowStockThreshold = 10;