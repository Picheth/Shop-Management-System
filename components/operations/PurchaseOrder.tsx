import React, { useState, useMemo } from 'react';
import { PurchaseOrder as PurchaseOrderType, DataProduct } from '../../types';
import { mockPurchaseOrders } from '../../data';
import Placeholder from '../ui/Placeholder';
import Modal from '../ui/Modal';
import PurchaseOrderForm from './PurchaseOrderForm';
import { StatusBadge } from '../ui/StatusBadge';

interface PurchaseOrderProps {
    products: DataProduct[];
}

const PurchaseOrder: React.FC<PurchaseOrderProps> = ({ products }) => {
    const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrderType[]>(mockPurchaseOrders);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const handleAddPurchaseOrder = (newPO: Omit<PurchaseOrderType, 'id' | 'total'>) => {
        const total = newPO.items.reduce((sum, item) => sum + item.quantity * item.price, 0);
        const finalPO: PurchaseOrderType = {
            ...newPO,
            id: `PO-${String(purchaseOrders.length + 1).padStart(3, '0')}`,
            total,
        };
        setPurchaseOrders(prev => [finalPO, ...prev]);
        setIsModalOpen(false);
    };

    const filteredPurchaseOrders = useMemo(() => {
        if (!searchTerm) {
            return purchaseOrders;
        }
        return purchaseOrders.filter(po => 
            po.supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
            po.id.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [purchaseOrders, searchTerm]);

    const inputClasses = "bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm px-3 py-2 text-sm text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-sky-500";

    return (
        <Placeholder title="Purchase Orders">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
                <input
                    type="text"
                    placeholder="Search by PO# or Supplier..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`${inputClasses} w-full sm:w-64`}
                    aria-label="Search purchase orders"
                />
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="bg-sky-600 text-white px-4 py-2 rounded-md hover:bg-sky-700 transition-colors w-full sm:w-auto flex-shrink-0"
                >
                    Create Purchase Order
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">PO Number</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Supplier</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Order Date</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Total</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                        {filteredPurchaseOrders.length > 0 ? (
                            filteredPurchaseOrders.map(po => (
                                <tr key={po.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-sky-600 dark:text-sky-400">{po.id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{po.supplier}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{po.orderDate}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500 dark:text-gray-300">${po.total.toFixed(2)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center"><StatusBadge status={po.status} /></td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} className="text-center py-4 text-gray-500 dark:text-gray-400">
                                    No purchase orders found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            {isModalOpen && (
                <Modal title="Create Purchase Order" onClose={() => setIsModalOpen(false)}>
                    <PurchaseOrderForm
                        products={products}
                        onAdd={handleAddPurchaseOrder}
                        onCancel={() => setIsModalOpen(false)}
                    />
                </Modal>
            )}
        </Placeholder>
    );
};

export default PurchaseOrder;