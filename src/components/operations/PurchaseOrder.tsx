import React, { useState, useMemo } from 'react';
import {
    PurchaseOrder as PurchaseOrderType,
    DataProduct,
} from '../../types';

import Placeholder from '../ui/Placeholder';
import Modal from '../ui/Modal';
import PurchaseOrderForm from './PurchaseOrderForm';
import StatusBadge from '../ui/StatusBadge';

type PurchaseOrderFormData = Omit<
    PurchaseOrderType,
    'id' | 'total' | 'status'
>;

interface PurchaseOrderProps {
    products: DataProduct[];
}

const PurchaseOrder: React.FC<PurchaseOrderProps> = ({ products }) => {
    const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrderType[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    /* =========================================================
       ADD PURCHASE ORDER
    ========================================================= */
    const handleAddPurchaseOrder = (newPO: PurchaseOrderFormData) => {
        const total = newPO.items.reduce(
            (sum, item) => sum + item.quantity * item.price,
            0
        );
        
        const finalPO: PurchaseOrderType = {
            ...newPO,
            id: `PO-${Date.now()}`,
            total,
            status: 'Pending',
        };

        setPurchaseOrders(prev => [finalPO, ...prev]);
        setIsModalOpen(false);
    };

    /* =========================================================
       FILTER
    ========================================================= */
    const filteredPurchaseOrders = useMemo(() => {
        const keyword = searchTerm.trim().toLowerCase();

        if (!keyword) return purchaseOrders;

        return purchaseOrders.filter(po =>
            po.supplier.toLowerCase().includes(keyword) ||
            po.id.toLowerCase().includes(keyword)
        );
    }, [purchaseOrders, searchTerm]);

    /* =========================================================
       STYLE
    ========================================================= */
    const inputClasses =
        'bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm px-3 py-2 text-sm text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-sky-500';

    return (
        <Placeholder title="Purchase Orders">

            {/* HEADER */}
            <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">

                <input
                    type="text"
                    placeholder="Search PO or Supplier..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className={`${inputClasses} w-full sm:w-72`}
                />

                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-sky-600 text-white px-4 py-2 rounded-md hover:bg-sky-700 transition-colors w-full sm:w-auto"
                >
                        Create Purchase Order
                </button>
            </div>

            {/* TABLE */}
            <div className="overflow-x-auto border rounded-lg">
                <table className="min-w-full bg-white dark:bg-gray-800">

                    <thead className="bg-gray-100 dark:bg-gray-700">
                        <tr>
                            <th className="px-4 py-2 text-left text-sm">PO #</th>
                            <th className="px-4 py-2 text-left text-sm">Supplier</th>
                            <th className="px-4 py-2 text-left text-sm">Date</th>
                            <th className="px-4 py-2 text-right text-sm">Total</th>
                            <th className="px-4 py-2 text-center text-sm">Status</th>
                        </tr>
                    </thead>

                    <tbody>
                        {filteredPurchaseOrders.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="text-center py-6 text-gray-500">
                                    No purchase orders found
                                </td>
                            </tr>
                        ) : (
                            filteredPurchaseOrders.map(po => (
                                <tr key={po.id} className="border-t hover:bg-gray-50 dark:hover:bg-gray-700">

                                    <td className="px-4 py-2 text-sky-600 font-medium">
                                        {po.id}
                                    </td>

                                    <td className="px-4 py-2">
                                        {po.supplier}
                                    </td>

                                    <td className="px-4 py-2 text-gray-500">
                                        {po.orderDate}
                                    </td>

                                    <td className="px-4 py-2 text-right font-medium">
                                        ${po.total.toFixed(2)}
                                    </td>

                                    <td className="px-4 py-2 text-center">
                                        <StatusBadge status={po.status} />
                                    </td>

                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* MODAL */}
            {isModalOpen && (
                <Modal
                    title="Create Purchase Order"
                    onClose={() => setIsModalOpen(false)}
                >
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