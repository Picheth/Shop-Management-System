import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import {
    Purchase as PurchaseType,
    DataProduct,
    Branch,
    LineItem,
} from '../../types';

import Placeholder from '../ui/Placeholder';
import Modal from '../ui/Modal';
import PurchaseForm from './PurchaseForm';
import StatusBadge from '../ui/StatusBadge';
import { useProductHistory } from '../inventory/useProductHistory';
import { supabase } from '../../utils/supabase';

interface PurchaseProps {
    products: DataProduct[];
    setProducts: React.Dispatch<React.SetStateAction<DataProduct[]>>;
    branches: Branch[];
}

const Purchase: React.FC<PurchaseProps> = ({
    products,
    setProducts,
    branches,
}) => {
    const [purchases, setPurchases] =
    useState<PurchaseType[]>([]);

    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { recordStockChange } = useProductHistory(products, setProducts);

    const [statusFilter, setStatusFilter] = useState<'All' | PurchaseType['status']>('All');
    const [searchTerm, setSearchTerm] = useState('');

    /* =========================================================
       FETCH PURCHASES (SERVER-SIDE)
    ========================================================= */
    const fetchPurchases = useCallback(async () => {
        setIsLoading(true);
        try {
            let query = supabase.from('purchases').select('*');

            if (statusFilter !== 'All') {
                query = query.eq('status', statusFilter);
            }

            if (searchTerm.trim()) {
                // Searches across ID and Supplier fields using ILIKE for case-insensitive partial matching
                query = query.or(`id.ilike.%${searchTerm}%,supplier.ilike.%${searchTerm}%`);
            }

            const { data, error } = await query.order('created_at', { ascending: false });

            if (error) throw error;
            setPurchases(data as PurchaseType[] || []);
        } catch (error) {
            console.error('Error fetching purchases:', error);
        } finally {
            setIsLoading(false);
        }
    }, [statusFilter, searchTerm]);

    useEffect(() => {
        const debounceHandler = setTimeout(() => {
            fetchPurchases();
        }, 400); // 400ms debounce to wait for user to stop typing

        return () => clearTimeout(debounceHandler);
    }, [fetchPurchases]);

    const headerCheckboxRef = useRef<HTMLInputElement>(null);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    const isAllSelected = purchases.length > 0 && selectedIds.size === purchases.length;
    const isSomeSelected = selectedIds.size > 0 && !isAllSelected;

    useEffect(() => {
        if (headerCheckboxRef.current) {
            headerCheckboxRef.current.indeterminate = isSomeSelected;
        }
    }, [isSomeSelected]);

    const toggleSelectAll = () => {
        if (isAllSelected) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(purchases.map(p => p.id)));
        }
    };

    const toggleSelectOne = (id: string) => {
        const newSelected = new Set(selectedIds);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedIds(newSelected);
    };

    /* =========================================================
       ADD PURCHASE
    ========================================================= */
    const handleAddPurchase = async (
        data: Omit<PurchaseType, 'id' | 'total'>
    ) => {
        setIsSaving(true);
        const total = data.items.reduce((sum, item) => sum + item.quantity * item.price, 0);
        const branchName = branches.find(b => b.id === data.branchId)?.name || 'Unknown';

        const newPurchase: PurchaseType = {
            ...data,
            id: `PUR-${Date.now()}`,
            total,
        };

        try {
            // 1. Execute Atomic Transaction via Supabase RPC
            const { error } = await supabase.rpc('create_purchase_and_update_stock', {
                p_purchase_id: newPurchase.id,
                p_supplier: newPurchase.supplier,
                p_branch_id: newPurchase.branchId,
                p_branch_name: branchName,
                p_purchase_date: newPurchase.purchaseDate,
                p_status: newPurchase.status,
                p_total: newPurchase.total,
                p_items: newPurchase.items // Passed as JSONB
            });

            if (error) {
                console.error('Transaction failed:', error.message);
                alert('Critical Error: Failed to record purchase and update stock.');
                return;
            }

            // 2. Refresh the list from the server to ensure consistency
            await fetchPurchases();
            setIsModalOpen(false);
        } finally {
            setIsSaving(false);
        }
    };

    const handleReceivePurchase = async (purchase: PurchaseType) => {
        const branchName = branches.find(b => b.id === purchase.branchId)?.name || 'Unknown';

        for (const item of purchase.items) {
            await recordStockChange(
                item.productId,
                purchase.branchId,
                branchName,
                item.quantity,
                'Purchase',
                `Purchase Received: ${purchase.id}`
            );
        }

        setPurchases(prev => 
            prev.map(p => p.id === purchase.id ? { ...p, status: 'Received' } : p)
        );
    };

    const handleCancelPurchase = async (purchase: PurchaseType) => {
        if (!window.confirm('Are you sure you want to cancel this purchase? This will reverse any inventory changes if the order was already received.')) return;

        // 1. If it was already received, reverse the stock change via the history hook
        if (purchase.status === 'Received') {
            const branchName = branches.find(b => b.id === purchase.branchId)?.name || 'Unknown';
            for (const item of purchase.items) {
                await recordStockChange(
                    item.productId,
                    purchase.branchId,
                    branchName,
                    -item.quantity, // Negative value to reverse the addition
                    'Adjustment',
                    `Cancelled Purchase Ref: ${purchase.id}`
                );
            }
        }

        // 2. Persist the status change to Supabase
        const { error } = await supabase
            .from('purchases')
            .update({ status: 'Cancelled' })
            .eq('id', purchase.id);

        if (error) {
            console.error('Failed to update purchase status in Supabase:', error.message);
            return;
        }

        // 3. Update local state
        setPurchases(prev => 
            prev.map(p => p.id === purchase.id ? { ...p, status: 'Cancelled' } : p)
        );
    };

    const handleBulkCancel = async () => {
        const activeSelected = purchases.filter(p => selectedIds.has(p.id) && p.status !== 'Cancelled');
        if (activeSelected.length === 0) {
            setSelectedIds(new Set());
            return;
        }

        if (!window.confirm(`Are you sure you want to cancel ${activeSelected.length} selected purchase(s)? This will reverse inventory changes for any received orders.`)) return;

        for (const purchase of activeSelected) {
            // 1. If it was already received, reverse the stock change via the history hook
            if (purchase.status === 'Received') {
                const branchName = branches.find(b => b.id === purchase.branchId)?.name || 'Unknown';
                for (const item of purchase.items) {
                    await recordStockChange(
                        item.productId,
                        purchase.branchId,
                        branchName,
                        -item.quantity, // Negative value to reverse the addition
                        'Adjustment',
                        `Bulk Cancelled Purchase Ref: ${purchase.id}`
                    );
                }
            }

            // 2. Persist the status change to Supabase
            const { error } = await supabase
                .from('purchases')
                .update({ status: 'Cancelled' })
                .eq('id', purchase.id);

            if (error) {
                console.error(`Failed to update purchase ${purchase.id} in Supabase:`, error.message);
            }
        }

        // 3. Update local state
        setPurchases(prev => 
            prev.map(p => selectedIds.has(p.id) ? { ...p, status: 'Cancelled' } : p)
        );
        setSelectedIds(new Set());
    };

    const inputClasses =
        'bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm px-3 py-2 text-sm text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-sky-500';

    return (
        <Placeholder title="Purchases">
            {/* FILTERS & BUTTONS */}
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <input
                    type="text"
                    placeholder="Search by ID or Supplier..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`${inputClasses} w-full sm:w-64`}
                />
                <div className="w-full sm:w-auto flex flex-wrap gap-2 justify-end">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as any)}
                        className={`${inputClasses} w-full sm:w-48`}
                    >
                        <option value="All">All Statuses</option>
                        <option value="Pending">Pending</option>
                        <option value="Ordered">Ordered</option>
                        <option value="Received">Received</option>
                        <option value="Cancelled">Cancelled</option>
                    </select>
                {selectedIds.size > 0 && (
                    <button
                        onClick={handleBulkCancel}
                        className="bg-red-50 text-red-600 border border-red-200 px-4 py-2 rounded-md hover:bg-red-100 transition-colors text-sm font-medium"
                    >
                        Cancel Selected ({selectedIds.size})
                    </button>
                )}

                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-sky-600 text-white px-4 py-2 rounded-md hover:bg-sky-700 transition-colors"
                >
                    Record Purchase
                </button>
                </div>
            </div>

            {/* TABLE */}
            <div className={`overflow-x-auto transition-opacity duration-200 ${isLoading ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                <table className="min-w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="px-6 py-3 text-left">
                                <input
                                    ref={headerCheckboxRef}
                                    type="checkbox"
                                    className="h-4 w-4 text-sky-600 focus:ring-sky-500 border-gray-300 rounded"
                                    checked={isAllSelected}
                                    onChange={toggleSelectAll}
                                />
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Purchase ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Branch</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Supplier</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Products</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Serials</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Total</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                        {purchases.length > 0 ? (
                            purchases.map(p => (
                                <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <input
                                            type="checkbox"
                                            className="h-4 w-4 text-sky-600 focus:ring-sky-500 border-gray-300 rounded"
                                            checked={selectedIds.has(p.id)}
                                            onChange={() => toggleSelectOne(p.id)}
                                        />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{p.purchaseDate}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{p.id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                        {branches.find(b => b.id === p.branchId)?.name || 'Unknown'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{p.supplier}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300 max-w-xs truncate">
                                        {p.items.map(i => i.productName).join(', ')}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300 max-w-xs truncate">
                                        {p.items.flatMap(i => i.serialNumbers || []).length > 0
                                            ? p.items
                                                  .flatMap(i => i.serialNumbers || [])
                                                  .join(', ')
                                            : 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-gray-900 dark:text-white">
                                        ${p.total.toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                                        <StatusBadge status={p.status || 'Received'} />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                                        <div className="flex justify-center gap-3">
                                            {(p.status === 'Pending' || p.status === 'Ordered') && (
                                                <button
                                                    onClick={() => handleReceivePurchase(p)}
                                                    className="text-sky-600 dark:text-sky-400 hover:underline font-medium"
                                                >
                                                    Receive
                                                </button>
                                            )}
                                            {p.status !== 'Cancelled' && (
                                                <button
                                                    onClick={() => handleCancelPurchase(p)}
                                                    className="text-red-600 dark:text-red-400 hover:underline font-medium"
                                                >
                                                    Cancel
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={10} className="px-6 py-12 text-center text-sm text-gray-500 dark:text-gray-400">
                                    {isLoading ? 'Loading data...' : 'No purchase records found.'}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* MODAL */}
            {isModalOpen && (
                <Modal
                    title="Record New Purchase"
                    onClose={() => setIsModalOpen(false)}
                >
                    <PurchaseForm
                        products={products}
                        branches={branches}
                        onAdd={handleAddPurchase}
                        isSaving={isSaving}
                        onCancel={() => setIsModalOpen(false)}
                    />
                </Modal>
            )}
        </Placeholder>
    );
};

export default Purchase;