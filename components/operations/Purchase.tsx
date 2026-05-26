import React, { useState } from 'react';
import { Purchase as PurchaseType, DataProduct, Branch } from '../../types';
import { mockPurchases } from '../../data';
import Placeholder from '../ui/Placeholder';
import Modal from '../ui/Modal';
import PurchaseForm from './PurchaseForm';

interface PurchaseProps {
    products: DataProduct[];
    setProducts: React.Dispatch<React.SetStateAction<DataProduct[]>>;
    branches: Branch[];
}

const Purchase: React.FC<PurchaseProps> = ({ products, setProducts, branches }) => {
    const [purchases, setPurchases] = useState<PurchaseType[]>(mockPurchases);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleAddPurchase = (newPurchaseData: Omit<PurchaseType, 'id' | 'total'>) => {
        const total = newPurchaseData.items.reduce((sum, item) => sum + item.quantity * item.price, 0);
        const newPurchase: PurchaseType = {
            ...newPurchaseData,
            id: `PUR-${String(purchases.length + 1).padStart(3, '0')}`,
            total,
        };

        setPurchases(prev => [newPurchase, ...prev]);
        
        const branchName = branches.find(b => b.id === newPurchase.branchId)?.name || 'Unknown Branch';
        
        const updatedProducts = products.map(p => {
            const itemPurchased = newPurchase.items.find(item => item.productId === p.id);
            if (itemPurchased) {
                const currentStock = p.stockByLocation[newPurchase.branchId] || 0;
                const newStock = currentStock + itemPurchased.quantity;
                const totalStock = Object.values(p.stockByLocation).reduce((s, c) => s + c, 0) + itemPurchased.quantity - currentStock;

                const newStatus: 'In Stock' | 'Low Stock' | 'Out of Stock' = totalStock > 10 ? 'In Stock' : (totalStock > 0 ? 'Low Stock' : 'Out of Stock');
                
                return {
                    ...p,
                    stockByLocation: {
                        ...p.stockByLocation,
                        [newPurchase.branchId]: newStock,
                    },
                    status: newStatus,
                    history: [
                        ...p.history,
                        {
                            date: newPurchase.purchaseDate,
                            // FIX: Added 'as const' to ensure the 'action' property is typed as a literal, not a generic string.
                            action: 'Purchase' as const,
                            change: itemPurchased.quantity,
                            newStock: newStock,
                            branch: branchName,
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
        <Placeholder title="Purchases">
            <div className="flex justify-end mb-4">
                 <button 
                    onClick={() => setIsModalOpen(true)}
                    className="bg-sky-600 text-white px-4 py-2 rounded-md hover:bg-sky-700 transition-colors"
                >
                    Record Purchase
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Purchase ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Branch</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Supplier</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Products</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Serials</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Total</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                        {purchases.map(p => (
                             <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{p.purchaseDate}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{p.id}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{branches.find(b => b.id === p.branchId)?.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{p.supplier}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{p.items.map(item => item.productName).join(', ')}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 max-w-xs truncate">
                                    {p.items.flatMap(i => i.serialNumbers || []).length > 0 
                                        ? p.items.flatMap(i => i.serialNumbers || []).join(', ') 
                                        : 'N/A'
                                    }
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500 dark:text-gray-300">${p.total.toFixed(2)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-center">{p.status}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
             {isModalOpen && (
                <Modal title="Record New Purchase" onClose={() => setIsModalOpen(false)}>
                    <PurchaseForm
                        products={products}
                        branches={branches}
                        onAdd={handleAddPurchase}
                        onCancel={() => setIsModalOpen(false)}
                    />
                </Modal>
            )}
        </Placeholder>
    );
};

export default Purchase;