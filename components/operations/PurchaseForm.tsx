import React, { useState, useRef, useEffect } from 'react';
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
    const [error, setError] = useState('');
    const [scanValue, setScanValue] = useState('');

    const scanInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        scanInputRef.current?.focus();
    }, []); // Empty dependency array means this runs once after initial render

    const handleScan = () => {
        const barcode = scanValue.trim();
        if (!barcode) return;

        // Search for product by SKU or ID
        const product = products.find(p => p.sku === barcode || p.id === barcode);

        if (!product) {
            setError(`Product with SKU or ID "${barcode}" not found.`);
            setScanValue('');
            return;
        }

        const existingItemIndex = items.findIndex(item => item.productId === product.id);

        if (existingItemIndex > -1) {
            const updatedItems = [...items];
            updatedItems[existingItemIndex].quantity += 1;
            setItems(updatedItems);
        } else {
            setItems([...items, {
                productId: product.id,
                productName: product.name,
                quantity: 1,
                price: product.price,
                sku: product.sku,
                serialNumbers: []
            }]);
        }

        setScanValue('');
        setError('');
    };

    const handleAddItem = () => {
        setError('');
        const firstProduct = products[0];
        if (!firstProduct) return;
        setItems([...items, { productId: firstProduct.id, productName: firstProduct.name, quantity: 1, price: firstProduct.price }]);
    };

    const handleItemChange = (index: number, field: keyof LineItem, value: string | number) => {
        setError('');
        const newItems = [...items];
        const currentItem = newItems[index];
        
        if (field === 'productId') {
            const product = products.find(p => p.id === value);
            if (product) {
                currentItem.productId = product.id;
                currentItem.productName = product.name;
                currentItem.price = product.price;
            }
        } else if (field === 'serialNumbers') {
            currentItem.serialNumbers = (value as string).split(',').map(s => s.trim()).filter(Boolean);
        } else {
            (currentItem[field] as any) = value;
        }
        setItems(newItems);
    };

    const handleRemoveItem = (index: number) => {
        setError('');
        setItems(items.filter((_, i) => i !== index));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (items.length === 0) {
            setError('Please add at least one item to the purchase.');
            return;
        }

        for (const item of items) {
            const serialCount = item.serialNumbers?.length || 0;
            if (serialCount !== item.quantity) {
                setError(`Product "${item.productName}" expects ${item.quantity} serial number(s), but ${serialCount} were provided.`);
                return;
            }
        }

        setError('');
        onAdd({
            supplier,
            branchId,
            purchaseDate,
            items,
            status: 'Received',
        });
    };

    const total = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);

    const inputClasses = "w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm px-3 py-2 text-sm text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-sky-500";
    const labelClasses = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";
    
    return (
        <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                <div className="md:col-span-2 p-4 bg-sky-50 dark:bg-sky-900/20 border border-sky-200 dark:border-sky-800 rounded-lg">
                    <label htmlFor="barcode-scan" className={`${labelClasses} text-sky-700 dark:text-sky-300`}>
                        Quick Scan (Product SKU/ID)
                    </label>
                    <div className="flex gap-2">
                        <input
                            id="barcode-scan"
                            ref={scanInputRef}
                            type="text"
                            placeholder="Scan product barcode or SKU..."
                            value={scanValue}
                            onChange={(e) => setScanValue(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleScan();
                                }
                            }}
                            className={inputClasses}
                        />
                        <button
                            type="button"
                            onClick={handleScan}
                            className="bg-sky-600 text-white px-4 py-2 rounded-md hover:bg-sky-700 transition-colors"
                        >
                            Add
                        </button>
                    </div>
                    <p className="text-[10px] text-sky-600 dark:text-sky-400 mt-1 italic">
                        Tip: Focus this field and scan a SKU to automatically add products to the receiving list.
                    </p>
                </div>
                 <div>
                    <label htmlFor="branchId" className={labelClasses}>Branch</label>
                    <select id="branchId" value={branchId} onChange={e => { setBranchId(e.target.value); setError(''); }} className={inputClasses} required>
                        {branches.map(branch => <option key={branch.id} value={branch.id}>{branch.name}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="supplier" className={labelClasses}>Supplier</label>
                    <input type="text" id="supplier" value={supplier} onChange={e => { setSupplier(e.target.value); setError(''); }} className={inputClasses} required />
                </div>
                <div className="md:col-span-2">
                    <label htmlFor="purchaseDate" className={labelClasses}>Purchase Date</label>
                    <input type="date" id="purchaseDate" value={purchaseDate} onChange={e => { setPurchaseDate(e.target.value); setError(''); }} className={inputClasses} required />
                </div>
            </div>

            <h3 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-2">Items Received</h3>
            <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                {items.map((item, index) => (
                    <div key={index} className="space-y-2 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-md border border-gray-100 dark:border-gray-700">
                        <div className="grid grid-cols-12 gap-2 items-center">
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
                            <button type="button" onClick={() => handleRemoveItem(index)} className="col-span-2 text-red-500 hover:text-red-700 text-center">✕</button>
                        </div>
                        <input 
                            type="text" 
                            placeholder="Serial Numbers (e.g. SN1, SN2...)" 
                            value={item.serialNumbers?.join(', ') || ''}
                            onChange={(e) => handleItemChange(index, 'serialNumbers', e.target.value)}
                            className={inputClasses}
                        />
                    </div>
                ))}
            </div>
            {error && <p className="text-red-500 text-sm mt-2 font-medium">{error}</p>}
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