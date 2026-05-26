import React, { useState } from 'react';
import { DataProduct, LineItem, PurchaseOrder } from '../../types';

type PurchaseOrderFormData = Omit<PurchaseOrder, 'id' | 'total'>;

interface PurchaseOrderFormProps {
    products: DataProduct[];
    onAdd: (data: PurchaseOrderFormData) => void;
    onCancel: () => void;
}

const PurchaseOrderForm: React.FC<PurchaseOrderFormProps> = ({ products, onAdd, onCancel }) => {
    const [supplier, setSupplier] = useState('');
    const [expectedDate, setExpectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [items, setItems] = useState<LineItem[]>([]);

    const handleAddItem = () => {
        const firstProduct = products[0];
        if (!firstProduct) return;
        setItems([...items, { productId: firstProduct.id, productName: firstProduct.name, quantity: 1, price: firstProduct.price }]);
    };

    const handleItemChange = (index: number, field: keyof LineItem, value: string | number) => {
        const newItems = [...items];
        const currentItem = newItems[index];
        
        if (field === 'productId') {
            const product = products.find(p => p.id === value);
            if (product) {
                currentItem.productId = product.id;
                currentItem.productName = product.name;
                currentItem.price = product.price; // or a specific purchase price
            }
        } else {
            (currentItem[field] as any) = value;
        }
        setItems(newItems);
    };

    const handleRemoveItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const getReorderSuggestion = (productId: string) => {
        const product = products.find(p => p.id === productId);
        if (!product) return null;

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const salesHistory = product.history.filter(h => 
            h.action === 'Sale' && new Date(h.date) >= thirtyDaysAgo
        );

        const totalSold = Math.abs(salesHistory.reduce((sum, h) => sum + h.change, 0));
        const currentStock = Object.values(product.stockByLocation).reduce((sum, count) => sum + count, 0);
        
        const suggested = Math.max(0, totalSold - currentStock);
        return { sold: totalSold, suggested };
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAdd({
            supplier,
            orderDate: new Date().toISOString().split('T')[0],
            expectedDate,
            items,
            status: 'Pending',
        });
    };

    const total = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);

    const inputClasses = "w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm px-3 py-2 text-sm text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-sky-500";
    const labelClasses = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";
    
    return (
        <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                <div>
                    <label htmlFor="supplier" className={labelClasses}>Supplier</label>
                    <input type="text" id="supplier" value={supplier} onChange={e => setSupplier(e.target.value)} className={inputClasses} required />
                </div>
                <div>
                    <label htmlFor="expectedDate" className={labelClasses}>Expected Delivery</label>
                    <input type="date" id="expectedDate" value={expectedDate} onChange={e => setExpectedDate(e.target.value)} className={inputClasses} required />
                </div>
            </div>

            <h3 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-2">Items</h3>
            <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                {items.map((item, index) => {
                    const stats = getReorderSuggestion(item.productId);
                    return (
                        <div key={index} className="space-y-1">
                            <div className="grid grid-cols-12 gap-2 items-center">
                                <select 
                                    value={item.productId}
                                    onChange={(e) => handleItemChange(index, 'productId', e.target.value)}
                                    className={`${inputClasses} col-span-5`}
                                >
                                    {products.map(p => {
                                        const totalStock = Object.values(p.stockByLocation).reduce((sum, count) => sum + count, 0);
                                        return <option key={p.id} value={p.id}>{p.name} (Total Stock: {totalStock})</option>;
                                    })}
                                </select>
                                <input 
                                    type="number" 
                                    placeholder="Qty" 
                                    value={item.quantity}
                                    onChange={(e) => handleItemChange(index, 'quantity', Number(e.target.value))}
                                    className={`${inputClasses} col-span-2`} min="1"
                                />
                                <input 
                                    type="number" 
                                    placeholder="Price" 
                                    value={item.price}
                                    onChange={(e) => handleItemChange(index, 'price', Number(e.target.value))}
                                    className={`${inputClasses} col-span-3`} min="0" step="0.01"
                                />
                                <button type="button" onClick={() => handleRemoveItem(index)} className="col-span-2 text-red-500 hover:text-red-700">Remove</button>
                            </div>
                            {stats && stats.suggested > 0 && (
                                <div className="pl-1">
                                    <button
                                        type="button"
                                        onClick={() => handleItemChange(index, 'quantity', stats.suggested)}
                                        className="text-[10px] text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 font-medium transition-colors"
                                    >
                                        ✨ Sold {stats.sold} in last 30 days. Click to reorder {stats.suggested}.
                                    </button>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
            <button type="button" onClick={handleAddItem} className="text-sm text-sky-600 hover:text-sky-800 mt-2">
                + Add Item
            </button>

            <div className="text-right font-bold text-lg mt-4">
                Total: ${total.toFixed(2)}
            </div>

            <div className="flex justify-end gap-4 mt-6 pt-4 border-t dark:border-gray-700">
                <button type="button" onClick={onCancel} className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500">Cancel</button>
                <button type="submit" className="bg-sky-600 text-white px-4 py-2 rounded-md hover:bg-sky-700">Create PO</button>
            </div>
        </form>
    );
};

export default PurchaseOrderForm;