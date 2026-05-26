import React, { useState } from 'react';
import { DataProduct, LineItem, Purchase, Branch } from '../../types';

type PurchaseFormData = Omit<Purchase, 'id' | 'total'>;

interface PurchaseFormProps {
    products: DataProduct[];
    branches: Branch[];
    onAdd: (data: PurchaseFormData) => void;
    onCancel: () => void;
}

const PurchaseForm: React.FC<PurchaseFormProps> = ({ products, branches, onAdd, onCancel }) => {
    const [supplier, setSupplier] = useState('');
    const [branchId, setBranchId] = useState(branches[0]?.id || '');
    const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
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
                currentItem.price = product.price;
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
        onAdd({
            supplier,
            branchId,
            purchaseDate,
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
                    <label htmlFor="branchId" className={labelClasses}>Branch</label>
                    <select id="branchId" value={branchId} onChange={e => setBranchId(e.target.value)} className={inputClasses} required>
                        {branches.map(branch => <option key={branch.id} value={branch.id}>{branch.name}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="supplier" className={labelClasses}>Supplier</label>
                    <input type="text" id="supplier" value={supplier} onChange={e => setSupplier(e.target.value)} className={inputClasses} required />
                </div>
                <div className="md:col-span-2">
                    <label htmlFor="purchaseDate" className={labelClasses}>Purchase Date</label>
                    <input type="date" id="purchaseDate" value={purchaseDate} onChange={e => setPurchaseDate(e.target.value)} className={inputClasses} required />
                </div>
            </div>

            <h3 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-2">Items Received</h3>
            <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                {items.map((item, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 items-center">
                        <select 
                            value={item.productId}
                            onChange={(e) => handleItemChange(index, 'productId', e.target.value)}
                            className={`${inputClasses} col-span-5`}
                        >
                            {products.map(p => (
                                <option key={p.id} value={p.id}>{p.name} (Stock: {p.stockByLocation[branchId] || 0})</option>
                            ))}
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
                ))}
            </div>
            <button type="button" onClick={handleAddItem} className="text-sm text-sky-600 hover:text-sky-800 mt-2">
                + Add Item
            </button>

            <div className="text-right font-bold text-lg mt-4">
                Total: ${total.toFixed(2)}
            </div>

            <div className="flex justify-end gap-4 mt-6 pt-4 border-t dark:border-gray-700">
                <button type="button" onClick={onCancel} className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500">Cancel</button>
                <button type="submit" className="bg-sky-600 text-white px-4 py-2 rounded-md hover:bg-sky-700">Save Purchase</button>
            </div>
        </form>
    );
};

export default PurchaseForm;