import { DataProduct, PurchaseOrder, Purchase, Sale, Branch, StockTransfer, Repair } from './types';

export const mockBranches: Branch[] = [
    { id: 'b001', name: 'Main Warehouse', location: '123 Warehouse St.' },
    { id: 'b002', name: 'Downtown Store', location: '456 Main St.' },
    { id: 'b003', name: 'Uptown Store', location: '789 Broadway Ave.' },
];

export const mockProducts: DataProduct[] = [
    { id: 'p001', name: 'Quantum Laptop Pro', sku: 'QLP-2024-BLK', category: 'Electronics', stockByLocation: { 'b001': 30, 'b002': 15 }, 
      serialNumbersByLocation: { 'b002': ['SN-QLP-002'] },
      price: 1499.99, status: 'In Stock', history: [
        { date: '2023-10-01', action: 'Initial Stock', change: 50, newStock: 50, branch: 'Main Warehouse' },
        { date: '2023-10-15', action: 'Sale', change: -5, newStock: 45, branch: 'Downtown Store' },
        { date: '2023-11-20', action: 'Transfer Out', change: -10, newStock: 40, branch: 'Main Warehouse' },
        { date: '2023-11-20', action: 'Transfer In', change: 10, newStock: 10, branch: 'Downtown Store' },
    ]},
    { id: 'p002', name: 'Nova Smartphone X', sku: 'NSX-2024-WHT', category: 'Electronics', stockByLocation: { 'b001': 80, 'b002': 40 }, price: 899.00, status: 'In Stock', history: [
        { date: '2023-10-02', action: 'Purchase', change: 150, newStock: 150, branch: 'Main Warehouse' },
        { date: '2023-10-10', action: 'Sale', change: -20, newStock: 20, branch: 'Downtown Store' },
        { date: '2023-10-20', action: 'Sale', change: -10, newStock: 10, branch: 'Downtown Store' },
    ]},
    { id: 'p003', name: 'Ergo-Mechanical Keyboard', sku: 'EMK-2024-RGB', category: 'Accessories', stockByLocation: { 'b002': 8 }, price: 179.50, status: 'Low Stock', history: [
        { date: '2023-09-15', action: 'Initial Stock', change: 10, newStock: 10, branch: 'Downtown Store' },
        { date: '2023-10-18', action: 'Sale', change: -2, newStock: 8, branch: 'Downtown Store' },
    ]},
    { id: 'p004', name: 'AcousticBliss Headphones', sku: 'ABH-2023-RED', category: 'Audio', stockByLocation: {}, price: 249.00, status: 'Out of Stock', history: [
         { date: '2023-09-20', action: 'Initial Stock', change: 20, newStock: 20, branch: 'Main Warehouse' },
         { date: '2023-10-25', action: 'Sale', change: -20, newStock: 0, branch: 'Main Warehouse' },
    ]},
    { id: 'p005', name: '4K UltraWide Monitor', sku: 'UWM-2024-34', category: 'Peripherals', stockByLocation: { 'b001': 22 }, price: 750.00, status: 'In Stock', history: [
        { date: '2023-09-01', action: 'Purchase', change: 30, newStock: 30, branch: 'Main Warehouse' },
        { date: '2023-09-30', action: 'Sale', change: -8, newStock: 22, branch: 'Main Warehouse' },
    ]},
    { id: 'p006', name: 'Gaming Mouse G-Pro', sku: 'GMG-PRO-BLK', category: 'Accessories', stockByLocation: { 'b001': 30, 'b002': 25 }, price: 89.99, status: 'In Stock', history: [
        { date: '2023-10-05', action: 'Purchase', change: 60, newStock: 60, branch: 'Main Warehouse' },
        { date: '2023-10-22', action: 'Sale', change: -5, newStock: 55, branch: 'Main Warehouse' },
    ]},
];

export const mockStockTransfers: StockTransfer[] = [
    { id: 'ST-001', fromBranchId: 'b001', toBranchId: 'b002', productId: 'p001', quantity: 10, date: '2023-11-20' },
    { id: 'ST-002', fromBranchId: 'b001', toBranchId: 'b003', productId: 'p002', quantity: 20, date: '2023-11-22' },
];

export const mockPurchaseOrders: PurchaseOrder[] = [
    { 
        id: 'PO-001', 
        supplier: 'LH Main Supplier', 
        orderDate: '2023-11-01', 
        expectedDate: '2023-11-15',
        items: [
            { productId: 'p001', productName: 'iPhone 11 64GB Black USA USED', quantity: 10, price: 189.00 },
            { productId: 'p005', productName: 'iPhone 12 Pro Max 128GB Gold USA USED', quantity: 15, price: 349.00 },
        ],
        total: 7125.00,
        status: 'Completed'
    },
    { 
        id: 'PO-002', 
        supplier: 'AudioVibes Ltd.', 
        orderDate: '2023-11-05', 
        expectedDate: '2023-11-20',
        items: [
            { productId: 'p004', productName: 'AcousticBliss Headphones', quantity: 50, price: 180.00 },
        ],
        total: 9000.00,
        status: 'Pending'
    },
];

export const mockPurchases: Purchase[] = [
    {
        id: 'PUR-001',
        branchId: 'b001',
        supplier: 'LH Main Supplier',
        purchaseDate: '2023-11-15',
        items: [
            { productId: 'p001', productName: 'iPhone 11 64GB Black USA USED', quantity: 2, price: 189.00, serialNumbers: ['SN-I11-001', 'SN-I11-002'] },
        ],
        total: 378.00,
        poId: 'PO-001',
        status: 'Received'
    },
];

export const mockSales: Sale[] = [
    {
        id: 'S-001',
        branchId: 'b002',
        customer: 'Alice Johnson',
        saleDate: '2023-11-16',
        items: [
            { productId: 'p001', productName: 'Quantum Laptop Pro', quantity: 1, price: 1499.99, serialNumbers: ['SN-QLP-001'] },
        ],
        total: 2999.98,
        status: 'Completed'
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
        status: 'Completed'
    },
    { id: 'S-003', branchId: 'b002', customer: 'Charlie Davis', saleDate: '2023-11-19', items: [
        { productId: 'p003', productName: 'Ergo-Mechanical Keyboard', quantity: 2, price: 179.50 },
    ], total: 359.00, status: 'Completed' },
];

export const mockRepairs: Repair[] = [
    {
        id: 'R-001',
        branchId: 'b002',
        customer: 'Alice Johnson',
        phone: '555-1234',
        device: 'Quantum Laptop Pro',
        serialNumber: 'SN12345678',
        repairIssue: 'Screen flickering',
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
];