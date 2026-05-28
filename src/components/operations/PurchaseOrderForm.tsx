import React, { useState } from 'react';
import {
    DataProduct,
    LineItem,
    PurchaseOrder,
} from '../../types';

type PurchaseOrderFormData = Omit<
    PurchaseOrder,
    'id' | 'total'
>;

interface PurchaseOrderFormProps {
    products: DataProduct[];
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

    const [orderDate] = useState(
        new Date()
            .toISOString()
            .split('T')[0]
    );

    const [expectedDate, setExpectedDate] =
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

    const inputClasses =
        'w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm px-3 py-2 text-sm text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-sky-500';

    const labelClasses =
        'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1';

    const handleAddItem = () => {
        if (products.length === 0) {
            setError('No products available.');
            return;
        }

        const firstProduct = products[0];

        const newItem: LineItem = {
            productId: firstProduct.id,
            productName: firstProduct.name,
            sku: firstProduct.sku,
            quantity: 1,
            price: firstProduct.price,
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

            if (field === 'productId') {
                const product =
                    products.find(
                        p => p.id === value
                    );

                if (product) {
                    item.productId =
                        product.id;

                    item.productName =
                        product.name;

                    item.sku =
                        product.sku;

                    item.price =
                        product.price;
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
            product.history.filter(
                h =>
                    h.action === 'Sale' &&
                    new Date(h.date) >=
                        thirtyDaysAgo
            );

        const totalSold = Math.abs(
            salesHistory.reduce(
                (sum, h) =>
                    sum + h.change,
                0
            )
        );

        const currentStock =
            Object.values(
                product.stockByLocation
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

        const subtotal = items.reduce(
    (sum, item) =>
        sum + item.quantity * item.price,
    0
);

onAdd({
    poNumber: `PO-${Date.now()}`,
    branchId: 'MAIN',
    supplier,
    orderDate,
    expectedDate,
    items,
    subtotal,
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

                {/* Supplier */}
                <div>
                    <label
                        htmlFor="supplier"
                        className={
                            labelClasses
                        }
                    >
                        Supplier
                    </label>

                    <input
                        type="text"
                        id="supplier"
                        value={supplier}
                        onChange={e =>
                            setSupplier(
                                e.target.value
                            )
                        }
                        className={
                            inputClasses
                        }
                        required
                    />
                </div>

                {/* Expected Date */}
                <div>
                    <label
                        htmlFor="expectedDate"
                        className={
                            labelClasses
                        }
                    >
                        Expected Delivery
                    </label>

                    <input
                        type="date"
                        id="expectedDate"
                        value={expectedDate}
                        onChange={e =>
                            setExpectedDate(
                                e.target.value
                            )
                        }
                        className={
                            inputClasses
                        }
                        required
                    />
                </div>
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
                                item.productId
                            );

                        return (
                            <div
                                key={index}
                                className="space-y-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700"
                            >
                                <div className="grid grid-cols-12 gap-2 items-center">

                                    {/* Product */}
                                    <select
                                        value={
                                            item.productId
                                        }
                                        onChange={e =>
                                            handleItemChange(
                                                index,
                                                'productId',
                                                e.target
                                                    .value
                                            )
                                        }
                                        className={`${inputClasses} col-span-5`}
                                    >
                                        {products.map(
                                            p => {
                                                const totalStock =
                                                    Object.values(
                                                        p.stockByLocation
                                                    ).reduce(
                                                        (
                                                            sum,
                                                            count
                                                        ) =>
                                                            sum +
                                                            count,
                                                        0
                                                    );

                                                return (
                                                    <option
                                                        key={
                                                            p.id
                                                        }
                                                        value={
                                                            p.id
                                                        }
                                                    >
                                                        {p.name}{' '}
                                                        ({p.sku})
                                                        - Stock:{' '}
                                                        {
                                                            totalStock
                                                        }
                                                    </option>
                                                );
                                            }
                                        )}
                                    </select>

                                    {/* Quantity */}
                                    <input
                                        type="number"
                                        placeholder="Qty"
                                        value={
                                            item.quantity
                                        }
                                        onChange={e =>
                                            handleItemChange(
                                                index,
                                                'quantity',
                                                Number(
                                                    e.target
                                                        .value
                                                )
                                            )
                                        }
                                        className={`${inputClasses} col-span-2`}
                                        min="1"
                                    />

                                    {/* Price */}
                                    <input
                                        type="number"
                                        placeholder="Price"
                                        value={
                                            item.price
                                        }
                                        onChange={e =>
                                            handleItemChange(
                                                index,
                                                'price',
                                                Number(
                                                    e.target
                                                        .value
                                                )
                                            )
                                        }
                                        className={`${inputClasses} col-span-3`}
                                        min="0"
                                        step="0.01"
                                    />

                                    {/* Remove */}
                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleRemoveItem(
                                                index
                                            )
                                        }
                                        className="col-span-2 text-red-500 hover:text-red-700 text-sm"
                                    >
                                        Remove
                                    </button>
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