import { DataProduct, PurchaseOrder, Purchase, Sale, Branch, StockTransfer, Repair } from './types';

export const mockBranches: Branch[] = [
    { id: 'b001', code: 'MAIN', name: 'Main Warehouse', location: 'City Center', address: '123 Main St, Cityville', phone: '555-0001', email: 'main@example.com' },
    { id: 'b002', code: 'STORE', name: 'Downtown Store', location: 'Downtown', address: '456 Market St, Cityville', phone: '555-0002', email: 'store@example.com' },
    { id: 'b003', code: 'SUB', name: 'Suburban Outlet', location: 'Suburbs', address: '789 Suburb Rd, Cityville', phone: '555-0003', email: 'sub@example.com' },
];

export const mockProducts: DataProduct[] = [
    { 
        id: 'p001', name: 'iPhone 11 64GB Black USA USED', category: 'Smartphones', brand: 'Apple', variation: '64GB', 
        costPrice: 150.00, price: 189.00, hasSerialNumber: true, hasIMEI: true,
        stockByLocation: { b001: 20, b002: 15, b003: 10 }, 
        status: 'In Stock', history: [] 
    },
];

export const mockStockTransfers: StockTransfer[] = [
    { id: 'ST-001', transferNumber: 'ST-001', fromBranchId: 'b001', toBranchId: 'b002', transferDate: '2023-11-20', items: [
        { productId: 'p001', productName: 'iPhone 11 64GB Black USA USED', quantity: 5, price: 189.00 },
    ], note: 'Restocking Downtown Store', status: 'Completed' },
];

export const mockPurchaseOrders: PurchaseOrder[] = [
    { id: 'PO-001', poNumber: 'PO-001', supplier: 'LH Main Supplier', branchId: 'b001', orderDate: '2023-11-10', expectedDate: '2023-11-15', items: [
        { productId: 'p001', productName: 'iPhone 11 64GB Black USA USED', quantity: 2, price: 189.00, serialNumbers: ['SN-I11-001', 'SN-I11-002'] },
    ], subtotal: 378.00, total: 378.00, status: 'Paid' },
];

export const mockPurchases: Purchase[] = [
    { id: 'PUR-001', purchaseNumber: 'PUR-001', poId: 'PO-001', supplier: 'LH Main Supplier', branchId: 'b001', purchaseDate: '2023-11-15', invoiceNumber: 'INV-001', items: [
        { productId: 'p001', productName: 'iPhone 11 64GB Black USA USED', quantity: 2, price: 189.00, serialNumbers: ['SN-I11-001', 'SN-I11-002'] },
    ], subtotal: 378.00, total: 378.00, status: 'Paid' },
];

export const mockSales: Sale[] = [
    {
        id: 'S-001',
        branchId: 'b002',
        customer: 'Alice Johnson',
        saleDate: '2023-11-16',
        items: [
            { productId: 'p001', productName: 'iPhone 11 64GB Black USA USED', quantity: 1, price: 189.00, serialNumbers: ['SN-I11-001'] },
        ],
        total: 2999.98,
        status: 'Paid'
    },
    {
        id: 'S-002',
        branchId: 'b001',
        customer: 'Bob Smith',
        saleDate: '2023-11-18',
        items: [
            { productId: 'p005', productName: '4K UltraWide Monitor', quantity: 1, price: 750.00 },
        ],
        total: 750.00,
        status: 'Paid'
    },
    { id: 'S-003', branchId: 'b002', customer: 'Charlie Davis', saleDate: '2023-11-19', items: [
        { productId: 'p003', productName: 'Ergo-Mechanical Keyboard', quantity: 2, price: 179.50 },
    ], total: 359.00, status: 'Paid' },
];

export const mockRepairs: Repair[] = [
    {
        id: 'R-001',
        repairNumber: 'REP-001',
        branchId: 'b002',
        customer: 'Alice Johnson',
        phone: '555-1234',
        device: 'Quantum Laptop Pro',
        serialNumber: 'SN12345678',
        issue: 'Screen flickering',
        items: [
            { productId: 'p001', productName: 'iPhone 11 64GB Black USA USED', quantity: 1, price: 189.00 },
        ],
        total: 189.00,
        repairCost: 200.00,
        estimatedCost: 250.00,
        technician: 'Tech Mike',
        entryDate: '2023-11-17',
        status: 'In Progress',
    },
    {
        id: 'R-002',
        repairNumber: 'REP-002',
        branchId: 'b001',
        customer: 'Bob Smith',
        phone: '555-5678',
        device: '4K UltraWide Monitor',
        serialNumber: 'SN-MON-001',
        issue: 'No display output',
        items: [
            { productId: 'p005', productName: '4K UltraWide Monitor', quantity: 1, price: 750.00 },
        ],
        total: 750.00,
        repairCost: 150.00,
        estimatedCost: 150.00,
        technician: 'Tech Sarah',
        entryDate: '2023-11-18',
        status: 'Completed',
    },
];