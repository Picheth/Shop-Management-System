import React, { useState } from 'react';
import FormInput from '../ui/FormInput';
import InlineFormInput from '../ui/InlineFormInput';
import InlineFormSelect from '../ui/InlineFormSelect';
import {
    Product,
    LineItem,
    PurchaseOrder,
} from '../../types';

type PurchaseOrderFormData = Omit<
    PurchaseOrder,
    'id' | 'total'
>;

interface PurchaseOrderFormProps {
    products: Product[];
    onAdd: (
        data: PurchaseOrderFormData
    ) => void;
    onCancel: () => void;
}

const PurchaseOrderForm: React.FC<
    PurchaseOrderFormProps
> = ({
    products,
    onAdd,
    onCancel,
}) => {
    const [supplier, setSupplier] =
        useState('');

    const [order_date] = useState(
        new Date()
            .toISOString()
            .split('T')[0]
    );

    const [expected_date, setExpectedDate] =
        useState(
            new Date()
                .toISOString()
                .split('T')[0]
        );

    const [items, setItems] = useState<
        LineItem[]
    >([]);

    const [error, setError] =
        useState('');

    const handleAddItem = () => {
        if (products.length === 0) {
            setError('No products available.');
            return;
        }

        const firstProduct = products[0];

        const newItem: LineItem = {
            product_id: firstProduct.id,
            product_name: firstProduct.name,
            sku: firstProduct.sku,
            quantity: 1,
            price: firstProduct.sale_price,
        };

        setItems(prev => [...prev, newItem]);
    };

    const handleItemChange = (
        index: number,
        field: keyof LineItem,
        value: string | number
    ) => {
        setItems(prev => {
            const updated = [...prev];

            const item = {
                ...updated[index],
            };

            if (field === 'product_id') {
                const product =
                    products.find(
                        p => p.id === value
                    );

                if (product) {
                    item.product_id =
                        product.id;

                    item.product_name =
                        product.name;

                    item.sku =
                        product.sku;

                    item.price =
                        product.sale_price;
                }
            } else {
                (item as any)[field] =
                    value;
            }

            updated[index] = item;

            return updated;
        });
    };

    const handleRemoveItem = (
        index: number
    ) => {
        setItems(prev =>
            prev.filter(
                (_, i) => i !== index
            )
        );
    };

    const getReorderSuggestion = (
        productId: string
    ) => {
        const product = products.find(
            p => p.id === productId
        );

        if (!product) return null;

        const thirtyDaysAgo =
            new Date();

        thirtyDaysAgo.setDate(
            thirtyDaysAgo.getDate() - 30
        );

        const salesHistory =
            product.history?.filter( // Correctly filter sales history
                h =>
                    h.action === 'Sale' &&
                    new Date(h.date) >=
                        thirtyDaysAgo
            );

        const totalSold = Math.abs(
            (salesHistory || []).reduce(
                (sum, h) =>
                    sum + h.change,
                0
            )
        );

        const currentStock =
            Object.values(
                product.stock_by_location
            ).reduce(
                (sum, count) =>
                    sum + count,
                0
            );

        const suggested =
            Math.max(
                0,
                totalSold - currentStock
            );

        return {
            sold: totalSold,
            suggested,
        };
    };

    const handleSubmit = (
        e: React.FormEvent
    ) => {
        e.preventDefault();

        if (!supplier.trim()) {
            setError(
                'Supplier is required.'
            );
            return;
        }

        if (items.length === 0) {
            setError(
                'Please add at least one item.'
            );
            return;
        }

        const invalidItem = items.find(
            item =>
                item.quantity <= 0 ||
                item.price < 0
        );

        if (invalidItem) {
            setError(
                'Quantity and price must be valid.'
            );
            return;
        }

        setError('');

onAdd({
    po_number: `PO-${Date.now()}`,
    branch_id: 'MAIN',
    supplier,
    order_date,
    expected_date,
    items,
    status: 'Pending',
});
    };

    const total = items.reduce(
        (sum, item) =>
            sum +
            item.quantity * item.price,
        0
    );

    return (
        <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                <FormInput
                    label="Supplier"
                    name="supplier"
                    placeholder="Supplier name"
                    value={supplier}
                    onChange={e => setSupplier(e.target.value)}
                    required
                />

                <FormInput
                    label="Expected Delivery"
                    type="date"
                    name="expected_date"
                    value={expected_date}
                    onChange={e => setExpectedDate(e.target.value)}
                    required
                />
            </div>

            {/* Items */}
            <h3 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-2">
                Items
            </h3>

            <div className="space-y-3 max-h-72 overflow-y-auto pr-2">

                {items.length === 0 && (
                    <div className="text-sm text-gray-500 italic">
                        No items added yet.
                    </div>
                )}

                {items.map(
                    (item, index) => {
                        const stats =
                            getReorderSuggestion(
                                item.product_id
                            );

                        return (
                            <div
                                key={index}
                                className="space-y-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700"
                            >
                                <div className="grid grid-cols-12 gap-2 items-center">

                                    {/* Product */}
                                    <div className="col-span-5">
                                        <InlineFormSelect
                                            value={item.product_id}
                                            onChange={e => handleItemChange(index, 'product_id', e.target.value)}
                                            options={products.map(p => {
                                                const totalStock = Object.values(p.stock_by_location).reduce((sum, count) => sum + count, 0);
                                                return {
                                                    value: p.id,
                                                    label: `${p.name} (${p.sku}) - Stock: ${totalStock}`
                                                };
                                            })}
                                        />
                                    </div>

                                    {/* Quantity */}
                                    <div className="col-span-2">
                                        <InlineFormInput
                                            type="number"
                                            placeholder="Qty"
                                            value={item.quantity}
                                            onChange={e => handleItemChange(index, 'quantity', Number(e.target.value))}
                                            min="1"
                                        />
                                    </div>

                                    {/* Price */}
                                    <div className="col-span-3">
                                        <InlineFormInput
                                            type="number"
                                            placeholder="Price"
                                            value={item.price}
                                            onChange={e => handleItemChange(index, 'price', Number(e.target.value))}
                                            min="0"
                                            step="0.01"
                                        />
                                    </div>

                                    {/* Remove */}
                                    <div className="col-span-2 flex justify-center">
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveItem(index)}
                                            className="text-red-500 hover:text-red-700 transition-colors p-1"
                                            title="Remove item"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>

                                {/* Suggestion */}
                                {stats &&
                                    stats.suggested >
                                        0 && (
                                        <div className="pl-1">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleItemChange(
                                                        index,
                                                        'quantity',
                                                        stats.suggested
                                                    )
                                                }
                                                className="text-[10px] text-sky-600 dark:text-sky-400 hover:underline"
                                            >
                                                Sold{' '}
                                                {
                                                    stats.sold
                                                }{' '}
                                                in last 30 days.
                                                Suggested reorder:{' '}
                                                {
                                                    stats.suggested
                                                }
                                            </button>
                                        </div>
                                    )}
                            </div>
                        );
                    }
                )}
            </div>

            {/* Error */}
            {error && (
                <div className="mt-3 text-sm text-red-500 font-medium">
                    {error}
                </div>
            )}

            {/* Add Item */}
            <button
                type="button"
                onClick={handleAddItem}
                className="mt-3 text-sm text-sky-600 hover:text-sky-700"
            >
                + Add Item
            </button>

            {/* Total */}
            <div className="text-right font-bold text-lg mt-5">
                Total: $
                {total.toFixed(2)}
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-4 mt-6 pt-4 border-t dark:border-gray-700">

                <button
                    type="button"
                    onClick={onCancel}
                    className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500"
                >
                    Cancel
                </button>

                <button
                    type="submit"
                    className="bg-sky-600 text-white px-4 py-2 rounded-md hover:bg-sky-700"
                >
                    Create PO
                </button>
            </div>
        </form>
    );
};

export default PurchaseOrderForm;