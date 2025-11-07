import React, { useState } from 'react';
import { Purchase as PurchaseType, DataProduct } from '../../types';
import { mockPurchases } from '../../data';
import Placeholder from '../ui/Placeholder';
import Modal from '../ui/Modal';
import PurchaseForm from './PurchaseForm';

interface PurchaseProps {
    products: DataProduct[];
    setProducts: React.Dispatch<React.SetStateAction<DataProduct[]>>;
}

const Purchase: React.FC<PurchaseProps> = ({ products, setProducts }) => {
    const [purchases, setPurchases] = useState<PurchaseType[]>(mockPurchases);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleAddPurchase = (newPurchaseData: Omit<PurchaseType, 'id' | 'total'>) => {
        const total = newPurchaseData.items.reduce((sum, item) => sum + item.quantity * item.price, 0);
        const newPurchase: PurchaseType = {
            ...newPurchaseData,
            id: `PUR-${String(purchases.length + 1).padStart(3, '0')}`,
            total,
        };

        // Add to local list of purchases
        setPurchases(prev => [newPurchase, ...prev]);
        
        // Update global product state
        const updatedProducts = products.map(p => {
            const itemPurchased = newPurchase.items.find(item => item.productId === p.id);
            if (itemPurchased) {
                const newStock = p.stock + itemPurchased.quantity;
                // FIX: Explicitly type `newStatus` to match the `DataProduct` status type and resolve the type error.
                const newStatus: 'In Stock' | 'Low Stock' | 'Out of Stock' = newStock > 10 ? 'In Stock' : (newStock > 0 ? 'Low Stock' : 'Out of Stock');
                return {
                    ...p,
                    stock: newStock,
                    status: newStatus,
                    history: [
                        ...p.history,
                        {
                            date: newPurchase.purchaseDate,
                            action: 'Purchase',
                            change: itemPurchased.quantity,
                            newStock,
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
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Purchase ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Supplier</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Total</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                        {purchases.map(p => (
                             <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{p.id}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{p.supplier}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{p.purchaseDate}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500 dark:text-gray-300">${p.total.toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
             {isModalOpen && (
                <Modal title="Record New Purchase" onClose={() => setIsModalOpen(false)}>
                    <PurchaseForm
                        products={products}
                        onAdd={handleAddPurchase}
                        onCancel={() => setIsModalOpen(false)}
                    />
                </Modal>
            )}
        </Placeholder>
    );
};

export default Purchase;