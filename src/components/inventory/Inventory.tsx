import React, { useState, useMemo } from 'react';
import { DataProduct, Branch } from '../../types';
import Placeholder from '../ui/Placeholder';
import Modal from '../ui/Modal';
import StockAdjustmentForm from './StockAdjustmentForm';

interface InventoryProps {
    products: DataProduct[];
    setProducts: React.Dispatch<React.SetStateAction<DataProduct[]>>;
    branches: Branch[];
}

const Inventory: React.FC<InventoryProps> = ({ products, setProducts, branches }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [productToAdjust, setProductToAdjust] = useState<DataProduct | null>(null);
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
    const [selectedBranchId, setSelectedBranchId] = useState<string>('all');

    const processedProducts = useMemo(() => {
        return products.map(p => {
            const displayStock = selectedBranchId === 'all'
                ? Object.values(p.stockByLocation).reduce((sum, count) => sum + count, 0)
                : p.stockByLocation[selectedBranchId] || 0;
            return {
                ...p,
                displayStock: displayStock,
            };
        });
    }, [products, selectedBranchId]);
    
    const stockColumnHeader = useMemo(() => {
        if (selectedBranchId === 'all') {
            return 'Total Stock';
        }
        const branch = branches.find(b => b.id === selectedBranchId);
        return branch ? `Stock at ${branch.name}` : 'Stock';
    }, [selectedBranchId, branches]);

    const handleOpenModal = (product: DataProduct) => {
        setProductToAdjust(product);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setProductToAdjust(null);
        setIsModalOpen(false);
    };
    
    const toggleRowExpansion = (productId: string) => {
        const newExpandedRows = new Set(expandedRows);
        if (newExpandedRows.has(productId)) {
            newExpandedRows.delete(productId);
        } else {
            newExpandedRows.add(productId);
        }
        setExpandedRows(newExpandedRows);
    };

    const handleStockAdjustment = (productId: string, branchId: string, newQuantity: number, reason: string) => {
        const branchName = branches.find(b => b.id === branchId)?.name || 'Unknown Branch';

        const updatedProducts = products.map(p => {
            if (p.id === productId) {
                const currentStock = p.stockByLocation[branchId] || 0;
                const change = newQuantity - currentStock;

                if (change === 0) return p;

                const newStockByLocation = { ...p.stockByLocation, [branchId]: newQuantity };
                const totalStock = Object.values(newStockByLocation).reduce((sum, count) => sum + count, 0);
                const newStatus: 'In Stock' | 'Low Stock' | 'Out of Stock' = totalStock > 10 ? 'In Stock' : (totalStock > 0 ? 'Low Stock' : 'Out of Stock');

                return {
                    ...p,
                    stockByLocation: newStockByLocation,
                    status: newStatus,
                    history: [
                        ...p.history,
                        {
                            date: new Date().toISOString().split('T')[0],
                            action: 'Adjustment' as const,
                            change: change,
                            newStock: newQuantity,
                            branch: branchName,
                            reason: reason,
                        }
                    ]
                };
            }
            return p;
        });

        setProducts(updatedProducts);
        handleCloseModal();
    };

    return (
        <Placeholder title="Inventory Management">
            <div className="mb-4">
                <label htmlFor="branch-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Filter by Branch
                </label>
                <select
                    id="branch-filter"
                    value={selectedBranchId}
                    onChange={(e) => setSelectedBranchId(e.target.value)}
                    className="mt-1 block w-full sm:w-64 pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"
                >
                    <option value="all">All Branches</option>
                    {branches.map(branch => (
                        <option key={branch.id} value={branch.id}>
                            {branch.name}
                        </option>
                    ))}
                </select>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="px-4 py-3 w-12 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"></th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Product Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">SKU</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{stockColumnHeader}</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                        {processedProducts.map(product => {
                            const isExpanded = expandedRows.has(product.id);
                            const selectedBranchName = branches.find(b => b.id === selectedBranchId)?.name;

                            const sortedHistory = [...product.history]
                                .filter(item => selectedBranchId === 'all' || item.branch === selectedBranchName)
                                .sort((a, b) => b.date.localeCompare(a.date));

                            return (
                                <React.Fragment key={product.id}>
                                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer" onClick={() => toggleRowExpansion(product.id)}>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transition-transform ${isExpanded ? 'rotate-90' : ''}`} fill="none" viewBox="http://www.w3.org/2000/svg" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{product.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{product.sku}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500 dark:text-gray-300">{product.displayStock}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-medium">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleOpenModal(product);
                                                }}
                                                className="text-sky-600 hover:text-sky-800 dark:text-sky-400 dark:hover:text-sky-300 transition-colors"
                                                aria-label={`Adjust stock for ${product.name}`}
                                            >
                                                Adjust Stock
                                            </button>
                                        </td>
                                    </tr>
                                    {isExpanded && (
                                        <tr>
                                            <td colSpan={5} className="p-0">
                                                <div className="p-4 bg-gray-50 dark:bg-gray-900/50">
                                                    <h4 className="text-md font-semibold mb-3 text-gray-700 dark:text-gray-200">Stock History {selectedBranchName ? `for ${selectedBranchName}` : ''}</h4>
                                                    {sortedHistory.length > 0 ? (
                                                        <div className="overflow-x-auto">
                                                            <table className="min-w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md">
                                                                <thead className="bg-gray-100 dark:bg-gray-700">
                                                                    <tr>
                                                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                                                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Branch</th>
                                                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Action</th>
                                                                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Change</th>
                                                                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">New Stock @ Branch</th>
                                                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Reason</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                                                                    {sortedHistory.map((item, index) => (
                                                                        <tr key={index}>
                                                                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{item.date}</td>
                                                                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{item.branch}</td>
                                                                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white">{item.action}</td>
                                                                            <td className={`px-4 py-2 whitespace-nowrap text-sm text-right font-medium ${item.change > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                                                                {item.change > 0 ? `+${item.change}` : item.change}
                                                                            </td>
                                                                            <td className="px-4 py-2 whitespace-nowrap text-sm text-right text-gray-500 dark:text-gray-300">{item.newStock}</td>
                                                                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 italic">{item.reason || 'N/A'}</td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    ) : (
                                                        <p className="text-sm text-center text-gray-500 dark:text-gray-400 py-4">No history available for this branch.</p>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </tbody>
                </table>
            </div>
            {isModalOpen && productToAdjust && (
                <Modal title={`Stock Adjustment for ${productToAdjust.name}`} onClose={handleCloseModal}>
                    <StockAdjustmentForm
                        product={productToAdjust}
                        branches={branches}
                        onAdjust={handleStockAdjustment}
                        onCancel={handleCloseModal}
                    />
                </Modal>
            )}
        </Placeholder>
    );
};

export default Inventory;