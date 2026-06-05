import React, { useState, useMemo, useEffect } from 'react';
import { Product, Branch } from '../../types';
import FormInput from '../ui/FormInput';
import FormSelect from '../ui/FormSelect';
import { useFormValidation } from '../../hooks/useFormValidation';

interface StockAdjustmentFormProps {
    product: Product;
    branches: Branch[];
    onAdjust: (productId: string, branchId: string, newQuantity: number, reason: string, note?: string) => void;
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
    const [form, setForm] = useState({
        branchId: branches[0]?.id || '',
        newQuantity: 0 as number | string,
        reason: ADJUSTMENT_REASONS[0],
        customReason: '',
        note: '',
    });

    const currentStock = useMemo(() => {
        return product.stock_by_location[form.branchId] || 0;
    }, [product, form.branchId]);

    useEffect(() => {
        setForm(prev => ({ ...prev, newQuantity: currentStock }));
    }, [currentStock]);

    const { isInvalid, errors: fieldErrors } = useFormValidation(form, {
        required: ['branchId', 'newQuantity', ...(form.reason === 'Other' ? ['customReason'] : [])],
        minMax: { newQuantity: { min: 0 } },
        maxLength: { customReason: 100, note: 250 },
        labels: {
            branchId: 'Branch',
            newQuantity: 'New Stock Quantity',
            reason: 'Reason for Adjustment',
            customReason: 'Specify reason',
            note: 'Adjustment Note'
        }
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: type === 'number' ? (value === '' ? '' : Number(value)) : value
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isInvalid) return;

        const finalReason = form.reason === 'Other' ? form.customReason.trim() : form.reason;
        onAdjust(product.id, form.branchId, Number(form.newQuantity), finalReason, form.note.trim());
    };

    return (
        <form onSubmit={handleSubmit} noValidate>
            <div className="space-y-4">
                <FormSelect
                    label="Branch"
                    name="branchId"
                    value={form.branchId}
                    onChange={handleChange}
                    options={branches.map(b => ({ value: b.id, label: b.name }))}
                    required
                />

                <div className="grid grid-cols-2 gap-4">
                    <FormInput
                        label="Current Stock"
                        name="currentStock"
                        type="number"
                        value={currentStock}
                        disabled
                    />
                    <FormInput
                        label="New Stock Quantity"
                        name="newQuantity"
                        type="number"
                        value={form.newQuantity}
                        onChange={handleChange}
                        error={fieldErrors.newQuantity}
                        min="0"
                        required
                    />
                </div>

                <FormSelect
                    label="Reason for Adjustment"
                    name="reason"
                    value={form.reason}
                    onChange={handleChange}
                    options={ADJUSTMENT_REASONS.map(r => ({ value: r, label: r }))}
                    required
                />

                {form.reason === 'Other' && (
                    <FormInput
                        label="Please specify reason"
                        name="customReason"
                        value={form.customReason}
                        onChange={handleChange}
                        error={fieldErrors.customReason}
                        maxLength={100}
                        required
                    />
                )}

                <FormInput
                    label="Adjustment Note (Optional)"
                    name="note"
                    isTextArea
                    value={form.note}
                    onChange={handleChange}
                    placeholder="Additional details about this adjustment..."
                    error={fieldErrors.note}
                    maxLength={250}
                    className="h-20"
                />
            </div>

            <div className="flex justify-end gap-4 mt-6 pt-4 border-t dark:border-gray-700">
                <button 
                    type="button" 
                    onClick={onCancel} 
                    className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                >
                    Cancel
                </button>
                <button 
                    type="submit" 
                    disabled={isInvalid}
                    className="bg-sky-600 text-white px-4 py-2 rounded-md hover:bg-sky-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Save Adjustment
                </button>
            </div>
        </form>
    );
};

export default StockAdjustmentForm;