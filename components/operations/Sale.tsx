import React, { useState } from 'react';
import { Sale as SaleType, DataProduct, Branch } from '../../types';
import { mockSales } from '../../data';
import Placeholder from '../ui/Placeholder';
import Modal from '../ui/Modal';
import SaleForm from './SaleForm';

interface SaleProps {
    products: DataProduct[];
    setProducts: React.Dispatch<React.SetStateAction<DataProduct[]>>;
    branches: Branch[];
}

const Sale: React.FC<SaleProps> = ({ products, setProducts, branches }) => {
    const [sales, setSales] = useState<SaleType[]>(mockSales);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleAddSale = (newSaleData: Omit<SaleType, 'id' | 'total'>) => {
        const total = newSaleData.items.reduce((sum, item) => sum + item.quantity * item.price, 0);
        const newSale: SaleType = {
            ...newSaleData,
            id: `SALE-${String(sales.length + 1).padStart(3, '0')}`,
            total,
        };

        setSales(prev => [newSale, ...prev]);

        const branchName = branches.find(b => b.id === newSale.branchId)?.name || 'Unknown Branch';

        const updatedProducts = products.map(p => {
            const itemSold = newSale.items.find(item => item.productId === p.id);
            if (itemSold) {
                const currentStock = p.stockByLocation[newSale.branchId] || 0;
                const newStock = currentStock - itemSold.quantity;
                const totalStock = Object.values(p.stockByLocation).reduce((s, c) => s + c, 0) - itemSold.quantity;

                const existingSerials = p.serialNumbersByLocation?.[newSale.branchId] || [];
                const soldSerials = itemSold.serialNumbers || [];
                const updatedSerials = existingSerials.filter(sn => !soldSerials.includes(sn));

                const newStatus: 'In Stock' | 'Low Stock' | 'Out of Stock' = totalStock > 10 ? 'In Stock' : (totalStock > 0 ? 'Low Stock' : 'Out of Stock');
                
                return {
                    ...p,
                    stockByLocation: {
                        ...p.stockByLocation,
                        [newSale.branchId]: newStock,
                    },
                    serialNumbersByLocation: {
                        ...(p.serialNumbersByLocation || {}),
                        [newSale.branchId]: updatedSerials,
                    },
                    status: newStatus,
                    history: [
                        ...p.history,
                        {
                            date: newSale.saleDate,
                            // FIX: Added 'as const' to ensure the 'action' property is typed as a literal, not a generic string.
                            action: 'Sale' as const,
                            change: -itemSold.quantity,
                            newStock: newStock,
                            branch: branchName
                        }
                    ]
                };
            }
            return p;
        });
        setProducts(updatedProducts);

        setIsModalOpen(false);
    };

    return (
        <Placeholder title="Sales">
             <div className="flex justify-end mb-4">
                 <button 
                    onClick={() => setIsModalOpen(true)}
                    className="bg-sky-600 text-white px-4 py-2 rounded-md hover:bg-sky-700 transition-colors"
                >
                    New Sale
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Sale ID</th>
                             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Branch</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Customer</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Serials</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Total</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Payment Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                        {sales.map(s => (
                             <tr key={s.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{s.id}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{branches.find(b => b.id === s.branchId)?.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{s.customer}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{s.saleDate}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 max-w-xs truncate">
                                    {s.items.flatMap(i => i.serialNumbers || []).length > 0 
                                        ? s.items.flatMap(i => i.serialNumbers || []).join(', ') 
                                        : 'N/A'
                                    }
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500 dark:text-gray-300">${s.total.toFixed(2)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${s.status === 'Paid' || s.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                                        {s.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {isModalOpen && (
                <Modal title="Record New Sale" onClose={() => setIsModalOpen(false)}>
                    <SaleForm
                        products={products}
                        branches={branches}
                        onAdd={handleAddSale}
                        onCancel={() => setIsModalOpen(false)}
                    />
                </Modal>
            )}
        </Placeholder>
    );
};

export default Sale;