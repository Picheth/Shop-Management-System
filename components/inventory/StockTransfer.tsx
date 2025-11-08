import React, { useState } from 'react';
import { StockTransfer as StockTransferType, DataProduct, Branch } from '../../types';
import Placeholder from '../ui/Placeholder';
import Modal from '../ui/Modal';
import StockTransferForm from './StockTransferForm';

interface StockTransferProps {
    products: DataProduct[];
    setProducts: React.Dispatch<React.SetStateAction<DataProduct[]>>;
    branches: Branch[];
    stockTransfers: StockTransferType[];
    setStockTransfers: React.Dispatch<React.SetStateAction<StockTransferType[]>>;
}

const StockTransfer: React.FC<StockTransferProps> = ({ products, setProducts, branches, stockTransfers, setStockTransfers }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleAddTransfer = (transferData: Omit<StockTransferType, 'id' | 'date'>) => {
        const newTransfer: StockTransferType = {
            ...transferData,
            id: `ST-${String(stockTransfers.length + 1).padStart(3, '0')}`,
            date: new Date().toISOString().split('T')[0],
        };

        setStockTransfers(prev => [newTransfer, ...prev]);

        const fromBranchName = branches.find(b => b.id === newTransfer.fromBranchId)?.name || 'Unknown';
        const toBranchName = branches.find(b => b.id === newTransfer.toBranchId)?.name || 'Unknown';

        const updatedProducts = products.map(p => {
            if (p.id === newTransfer.productId) {
                const fromStock = p.stockByLocation[newTransfer.fromBranchId] || 0;
                const toStock = p.stockByLocation[newTransfer.toBranchId] || 0;

                const newFromStock = fromStock - newTransfer.quantity;
                const newToStock = toStock + newTransfer.quantity;

                const newHistory = [
                    ...p.history,
                    {
                        date: newTransfer.date,
                        action: 'Transfer Out' as const,
                        change: -newTransfer.quantity,
                        newStock: newFromStock,
                        branch: fromBranchName
                    },
                    {
                        date: newTransfer.date,
                        action: 'Transfer In' as const,
                        change: newTransfer.quantity,
                        newStock: newToStock,
                        branch: toBranchName
                    }
                ];

                return {
                    ...p,
                    stockByLocation: {
                        ...p.stockByLocation,
                        [newTransfer.fromBranchId]: newFromStock,
                        [newTransfer.toBranchId]: newToStock
                    },
                    history: newHistory
                };
            }
            return p;
        });

        setProducts(updatedProducts);
        setIsModalOpen(false);
    };

    const getBranchName = (id: string) => branches.find(b => b.id === id)?.name || 'N/A';
    const getProductName = (id: string) => products.find(p => p.id === id)?.name || 'N/A';

    return (
        <Placeholder title="Stock Transfers">
            <div className="flex justify-end mb-4">
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="bg-sky-600 text-white px-4 py-2 rounded-md hover:bg-sky-700 transition-colors"
                >
                    New Stock Transfer
                </button>
            </div>
             <div className="overflow-x-auto">
                <table className="min-w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Transfer ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">From</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">To</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Product</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Quantity</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                        {stockTransfers.map(t => (
                             <tr key={t.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{t.id}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{t.date}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{getBranchName(t.fromBranchId)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{getBranchName(t.toBranchId)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{getProductName(t.productId)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500 dark:text-gray-300">{t.quantity}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {isModalOpen && (
                <Modal title="New Stock Transfer" onClose={() => setIsModalOpen(false)}>
                    <StockTransferForm
                        products={products}
                        branches={branches}
                        onAdd={handleAddTransfer}
                        onCancel={() => setIsModalOpen(false)}
                    />
                </Modal>
            )}
        </Placeholder>
    );
};

export default StockTransfer;