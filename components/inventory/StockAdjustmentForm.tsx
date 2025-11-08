import React, { useState, useMemo, useEffect } from 'react';
import { DataProduct, Branch } from '../../types';

interface StockAdjustmentFormProps {
    product: DataProduct;
    branches: Branch[];
    onAdjust: (productId: string, branchId: string, newQuantity: number, reason: string) => void;
    onCancel: () => void;
}

const ADJUSTMENT_REASONS = [
    'Stock Count Correction',
    'Damaged Goods',
    'Returned Item',
    'Found Inventory',
    'Promotion / Marketing Use',
    'Other'
];

const StockAdjustmentForm: React.FC<StockAdjustmentFormProps> = ({ product, branches, onAdjust, onCancel }) => {
    const [selectedBranchId, setSelectedBranchId] = useState(branches[0]?.id || '');
    const [newQuantity, setNewQuantity] = useState<number | string>('');
    const [reason, setReason] = useState(ADJUSTMENT_REASONS[0]);
    const [customReason, setCustomReason] = useState('');
    const [error, setError] = useState('');

    const currentStock = useMemo(() => {
        return product.stockByLocation[selectedBranchId] || 0;
    }, [product, selectedBranchId]);

    useEffect(() => {
        setNewQuantity(currentStock);
    }, [currentStock]);
    

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const finalQuantity = Number(newQuantity);
        if (isNaN(finalQuantity) || finalQuantity < 0) {
            setError('Please enter a valid, non-negative quantity.');
            return;
        }

        const finalReason = reason === 'Other' ? customReason.trim() : reason;
        if (!finalReason) {
             setError('A reason is required for the adjustment.');
            return;
        }

        onAdjust(product.id, selectedBranchId, finalQuantity, finalReason);
    };

    const inputClasses = "w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm px-3 py-2 text-sm text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:bg-gray-100 dark:disabled:bg-gray-600";
    const labelClasses = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";
    const errorClasses = "text-red-500 text-xs mt-1 h-4";

    return (
        <form onSubmit={handleSubmit} noValidate>
            <div className="space-y-4">
                <div>
                    <label htmlFor="branch" className={labelClasses}>Branch</label>
                    <select
                        id="branch"
                        value={selectedBranchId}
                        onChange={(e) => setSelectedBranchId(e.target.value)}
                        className={inputClasses}
                    >
                        {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="currentStock" className={labelClasses}>Current Stock</label>
                        <input
                            type="number"
                            id="currentStock"
                            value={currentStock}
                            className={inputClasses}
                            disabled
                        />
                    </div>
                    <div>
                        <label htmlFor="newQuantity" className={labelClasses}>New Stock Quantity</label>
                        <input
                            type="number"
                            id="newQuantity"
                            value={newQuantity}
                            onChange={(e) => setNewQuantity(e.target.value)}
                            className={inputClasses}
                            min="0"
                            required
                        />
                    </div>
                </div>

                <div>
                    <label htmlFor="reason" className={labelClasses}>Reason for Adjustment</label>
                    <select
                        id="reason"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        className={inputClasses}
                    >
                        {ADJUSTMENT_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                </div>

                {reason === 'Other' && (
                     <div>
                        <label htmlFor="customReason" className={labelClasses}>Please specify reason</label>
                        <input
                            type="text"
                            id="customReason"
                            value={customReason}
                            onChange={(e) => setCustomReason(e.target.value)}
                            className={inputClasses}
                            required
                        />
                    </div>
                )}
                <div className={errorClasses}>{error}</div>
            </div>

            <div className="flex justify-end gap-4 mt-6 pt-4 border-t dark:border-gray-700">
                <button type="button" onClick={onCancel} className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">
                    Cancel
                </button>
                <button type="submit" className="bg-sky-600 text-white px-4 py-2 rounded-md hover:bg-sky-700 transition-colors">
                    Save Adjustment
                </button>
            </div>
        </form>
    );
};

export default StockAdjustmentForm;