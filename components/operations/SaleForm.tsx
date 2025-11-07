import React, { useState } from 'react';
import { DataProduct, LineItem, Sale } from '../../types';

type SaleFormData = Omit<Sale, 'id' | 'total'>;

interface SaleFormProps {
    products: DataProduct[];
    onAdd: (data: SaleFormData) => void;
    onCancel: () => void;
}

const SaleForm: React.FC<SaleFormProps> = ({ products, onAdd, onCancel }) => {
    const [customer, setCustomer] = useState('Walk-in Customer');
    const [saleDate, setSaleDate] = useState(new Date().toISOString().split('T')[0]);
    const [items, setItems] = useState<LineItem[]>([]);
    const [error, setError] = useState('');
    
    const availableProducts = products.filter(p => p.stock > 0);

    const handleAddItem = () => {
        if (availableProducts.length === 0) {
            setError('No products in stock to add.');
            return;
        }
        setError('');
        const firstProduct = availableProducts[0];
        setItems([...items, { productId: firstProduct.id, productName: firstProduct.name, quantity: 1, price: firstProduct.price }]);
    };

    const handleItemChange = (index: number, field: keyof LineItem, value: string | number) => {
        setError('');
        const newItems = [...items];
        const currentItem = newItems[index];
        const product = products.find(p => p.id === currentItem.productId);
        
        if (field === 'productId') {
            const selectedProduct = products.find(p => p.id === value);
            if (selectedProduct) {
                currentItem.productId = selectedProduct.id;
                currentItem.productName = selectedProduct.name;
                currentItem.price = selectedProduct.price;
                if (currentItem.quantity > selectedProduct.stock) {
                    currentItem.quantity = selectedProduct.stock;
                    setError(`Quantity for ${selectedProduct.name} adjusted to max available stock.`);
                }
            }
        } else if (field === 'quantity' && product) {
            const newQuantity = Number(value);
            if (newQuantity > product.stock) {
                currentItem.quantity = product.stock;
                 setError(`Cannot sell more than available stock for ${product.name} (${product.stock}).`);
            } else {
                (currentItem[field] as any) = newQuantity;
            }
        } else {
             (currentItem[field] as any) = value;
        }
        setItems(newItems);
    };

    const handleRemoveItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (items.length === 0) {
            setError('Please add at least one item to the sale.');
            return;
        }
        setError('');
        onAdd({
            customer,
            saleDate,
            items,
        });
    };

    const total = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);

    const inputClasses = "w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm px-3 py-2 text-sm text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-sky-500";
    const labelClasses = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";
    
    return (
        <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                <div>
                    <label htmlFor="customer" className={labelClasses}>Customer</label>
                    <input type="text" id="customer" value={customer} onChange={e => setCustomer(e.target.value)} className={inputClasses} required />
                </div>
                <div>
                    <label htmlFor="saleDate" className={labelClasses}>Sale Date</label>
                    <input type="date" id="saleDate" value={saleDate} onChange={e => setSaleDate(e.target.value)} className={inputClasses} required />
                </div>
            </div>

            <h3 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-2">Items Sold</h3>
            <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                {items.map((item, index) => {
                    const productInStock = products.find(p => p.id === item.productId);
                    return (
                        <div key={index} className="grid grid-cols-12 gap-2 items-center">
                            <select 
                                value={item.productId}
                                onChange={(e) => handleItemChange(index, 'productId', e.target.value)}
                                className={`${inputClasses} col-span-5`}
                            >
                                {availableProducts.map(p => <option key={p.id} value={p.id}>{p.name} ({p.stock})</option>)}
                            </select>
                            <input 
                                type="number" 
                                placeholder="Qty" 
                                value={item.quantity}
                                onChange={(e) => handleItemChange(index, 'quantity', Number(e.target.value))}
                                className={`${inputClasses} col-span-2`} min="1" max={productInStock?.stock || 0}
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
                    );
                })}
            </div>
             {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
            <button type="button" onClick={handleAddItem} className="text-sm text-sky-600 hover:text-sky-800 mt-2 disabled:text-gray-400" disabled={availableProducts.length === 0}>
                + Add Item
            </button>

            <div className="text-right font-bold text-lg mt-4">
                Total: ${total.toFixed(2)}
            </div>

            <div className="flex justify-end gap-4 mt-6 pt-4 border-t dark:border-gray-700">
                <button type="button" onClick={onCancel} className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500">Cancel</button>
                <button type="submit" className="bg-sky-600 text-white px-4 py-2 rounded-md hover:bg-sky-700">Record Sale</button>
            </div>
        </form>
    );
};

export default SaleForm;