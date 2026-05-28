import React, { useState, useMemo, useEffect, useRef } from 'react';
import { DataProduct, Branch, StockTransfer, LineItem } from '../../types';

type StockTransferFormData = Omit<StockTransfer, 'id' | 'total'>;

interface StockTransferFormProps {
    products: DataProduct[];
    branches: Branch[];
    onAdd: (data: StockTransferFormData) => void;
    onCancel: () => void;
}

const StockTransferForm: React.FC<StockTransferFormProps> = ({ products, branches, onAdd, onCancel }) => {
    const [fromBranchId, setFromBranchId] = useState(branches[0]?.id || '');
    const [toBranchId, setToBranchId] = useState(branches[1]?.id || '');
    const [items, setItems] = useState<LineItem[]>([]);
    const [note, setNote] = useState('');
    const [error, setError] = useState('');
    const [scanValue, setScanValue] = useState('');
    const [scanSuccess, setScanSuccess] = useState(false);

    const scanInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        scanInputRef.current?.focus();
    }, []);

    const availableProducts = useMemo(() => {
        if (!fromBranchId) return [];
        return products.filter(p => (p.stockByLocation[fromBranchId] || 0) > 0);
    }, [products, fromBranchId]);

    const handleScan = () => {
        const barcode = scanValue.trim();
        if (!barcode) return;

        // 1. Search for a product that has this serial in the source branch
        const productWithSerial = products.find(p => 
            p.serialNumbersByLocation?.[fromBranchId]?.includes(barcode)
        );

        if (productWithSerial) {
            // Handle serial number scan
            const isDuplicate = items.some(item => item.serialNumbers?.includes(barcode));
            if (isDuplicate) {
                setError(`Serial "${barcode}" has already been added.`);
                setScanValue('');
                return;
            }

            const existingIndex = items.findIndex(item => item.productId === productWithSerial.id);
            if (existingIndex > -1) {
                const updated = [...items];
                updated[existingIndex] = {
                    ...updated[existingIndex],
                    quantity: updated[existingIndex].quantity + 1,
                    serialNumbers: [...(updated[existingIndex].serialNumbers || []), barcode]
                };
                setItems(updated);
            } else {
                setItems([...items, {
                    productId: productWithSerial.id,
                    productName: productWithSerial.name,
                    sku: productWithSerial.sku,
                    quantity: 1,
                    price: productWithSerial.costPrice || 0,
                    serialNumbers: [barcode]
                }]);
            }
            setScanValue('');
            setError('');
            setScanSuccess(true);
            setTimeout(() => setScanSuccess(false), 1000);
            return;
        }

        // 2. Fallback to SKU scan
        const product = availableProducts.find(p => p.sku === barcode || p.id === barcode);

        if (!product) {
            setError(`Product or Serial "${barcode}" not found in stock at the source branch.`);
            setScanValue('');
            return;
        }

        const existingIndex = items.findIndex(item => item.productId === product.id);

        if (existingIndex > -1) {
            const updated = [...items];
            updated[existingIndex] = {
                ...updated[existingIndex],
                quantity: updated[existingIndex].quantity + 1
            };
            setItems(updated);
        } else {
            setItems([...items, {
                productId: product.id,
                productName: product.name,
                sku: product.sku,
                quantity: 1,
                price: product.costPrice || 0,
                serialNumbers: []
            }]);
        }

        setScanValue('');
        setError('');
        setScanSuccess(true);
        setTimeout(() => setScanSuccess(false), 1000);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (fromBranchId === toBranchId) {
            setError('Source and destination branches cannot be the same.');
            return;
        }
        if (items.length === 0) {
            setError('Please add at least one item to transfer.');
            return;
        }

        // Validate quantities against available stock
        for (const item of items) {
            const product = products.find(p => p.id === item.productId);
            const stockAvailable = product?.stockByLocation[fromBranchId] || 0;

            if (item.quantity <= 0) {
                setError(`Quantity for ${item.productName} must be greater than zero.`);
                return;
            }
            if (item.quantity > stockAvailable) {
                setError(`Insufficient stock for ${item.productName}. Available: ${stockAvailable}`);
                return;
            }

            // Serial validation
            if (product?.hasSerialNumber) {
                const serialCount = item.serialNumbers?.length || 0;
                if (serialCount !== item.quantity) {
                    setError(`Product "${item.productName}" expects ${item.quantity} serial number(s), but ${serialCount} were selected.`);
                    return;
                }
            }
        }

        onAdd({
            fromBranchId,
            toBranchId,
            items,
            note,
            transferDate: new Date().toISOString().split('T')[0],
            status: 'Pending'
        });
    };

    const handleAddItem = () => {
        const firstProduct = availableProducts[0] || products[0];
        if (!firstProduct) return;
        setItems([...items, {
            productId: firstProduct.id,
            productName: firstProduct.name,
            sku: firstProduct.sku,
            quantity: 1,
            price: firstProduct.costPrice || 0,
            serialNumbers: []
        }]);
        setError('');
    };

    const handleItemChange = (index: number, field: keyof LineItem, value: any) => {
        const newItems = [...items];
        const currentItem = newItems[index];

        if (field === 'productId') {
            const product = products.find(p => p.id === value);
            if (product) {
                currentItem.productId = product.id;
                currentItem.productName = product.name;
                currentItem.sku = product.sku;
                currentItem.price = product.costPrice || 0;
                currentItem.serialNumbers = [];
            }
        } else if (field === 'quantity') {
            const newQuantity = Number(value);
            currentItem.quantity = newQuantity;
            // Truncate selected serials if quantity decreases
            if (currentItem.serialNumbers && currentItem.serialNumbers.length > newQuantity) {
                currentItem.serialNumbers = currentItem.serialNumbers.slice(0, newQuantity);
            }
        } else {
            (currentItem as any)[field] = value;
        }
        setItems(newItems);
        setError('');
    };

    const handleRemoveItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
        setError('');
    };

    const inputClasses = "w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm px-3 py-2 text-sm text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-sky-500";
    const labelClasses = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";

    return (
        <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                <div className={`md:col-span-2 p-4 border rounded-lg transition-all duration-300 ${
                    scanSuccess 
                        ? 'bg-green-50 dark:bg-green-900/20 border-green-500 shadow-[0_0_10px_rgba(34,197,94,0.2)]' 
                        : 'bg-sky-50 dark:bg-sky-900/20 border-sky-200 dark:border-sky-800 shadow-none'
                }`}>
                    <div className="flex justify-between items-center mb-1">
                        <label htmlFor="barcode-scan" className={`${labelClasses} mb-0 transition-colors ${scanSuccess ? 'text-green-700 dark:text-green-400' : 'text-sky-700 dark:text-sky-300'}`}>
                            Quick Scan (SKU / Product Number)
                        </label>
                        <button
                            type="button"
                            onClick={() => scanInputRef.current?.focus()}
                            className="text-[10px] font-medium text-sky-600 hover:text-sky-800 dark:text-sky-400 dark:hover:text-sky-300 flex items-center gap-1 focus:outline-none"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                            </svg>
                            Focus Scanner
                        </button>
                    </div>
                    <div className="flex gap-2">
                        <input
                            id="barcode-scan"
                            ref={scanInputRef}
                            type="text"
                            placeholder="Scan SKU to transfer..."
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
                </div>

                <div>
                    <label htmlFor="fromBranchId" className={labelClasses}>From Branch</label>
                    <select id="fromBranchId" value={fromBranchId} onChange={(e) => { setFromBranchId(e.target.value); setItems([]); setError(''); }} className={inputClasses} required>
                        {branches.map(branch => <option key={branch.id} value={branch.id}>{branch.name}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="toBranchId" className={labelClasses}>To Branch</label>
                    <select id="toBranchId" value={toBranchId} onChange={(e) => setToBranchId(e.target.value)} className={inputClasses} required>
                        <option value="" disabled>Select destination</option>
                        {branches.map(branch => <option key={branch.id} value={branch.id}>{branch.name}</option>)}
                    </select>
                </div>
            </div>

            <div className="mt-4">
                <label htmlFor="note" className={labelClasses}>Note (Optional)</label>
                <textarea
                    id="note"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className={`${inputClasses} h-20`}
                    placeholder="Reason for transfer..."
                />
            </div>

            <h3 className="text-md font-medium text-gray-800 dark:text-gray-200 mt-6 mb-2">Items to Transfer</h3>
            <div className="space-y-3 max-h-60 overflow-y-auto pr-2 mb-2">
                {items.map((item, index) => {
                    const product = products.find(p => p.id === item.productId);
                    const stockAvailable = product?.stockByLocation[fromBranchId] || 0;
                    const availableSerials = product?.serialNumbersByLocation?.[fromBranchId] || [];

                    return (
                        <div key={index} className="p-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 rounded-md">
                            <div className="grid grid-cols-12 gap-2 items-center">
                                <select
                                    value={item.productId}
                                    onChange={(e) => handleItemChange(index, 'productId', e.target.value)}
                                    className={`${inputClasses} col-span-7`}
                                >
                                    {availableProducts.map(p => (
                                        <option key={p.id} value={p.id}>
                                            {p.name} (Avail: {p.stockByLocation[fromBranchId] || 0})
                                        </option>
                                    ))}
                                </select>
                                <input
                                    type="number"
                                    placeholder="Qty"
                                    value={item.quantity}
                                    onChange={(e) => handleItemChange(index, 'quantity', Number(e.target.value))}
                                    className={`${inputClasses} col-span-3`}
                                    min="1"
                                />
                                <button
                                    type="button"
                                    onClick={() => handleRemoveItem(index)}
                                    className="col-span-2 text-red-500 hover:text-red-700 font-medium text-center"
                                >
                                    ✕
                                </button>
                            </div>

                            {product?.hasSerialNumber && availableSerials.length > 0 && (
                                <div className="mt-2">
                                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Select Serial Numbers ({item.serialNumbers?.length || 0}/{item.quantity})</label>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-24 overflow-y-auto p-2 border border-gray-200 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700">
                                        {availableSerials.map(serial => (
                                            <label key={serial} className="flex items-center text-xs text-gray-900 dark:text-gray-200">
                                                <input
                                                    type="checkbox"
                                                    value={serial}
                                                    checked={item.serialNumbers?.includes(serial) || false}
                                                    onChange={(e) => {
                                                        const isChecked = e.target.checked;
                                                        const currentSerials = item.serialNumbers ? [...item.serialNumbers] : [];
                                                        let updatedSerials: string[];

                                                        if (isChecked) {
                                                            updatedSerials = [...currentSerials, serial];
                                                        } else {
                                                            updatedSerials = currentSerials.filter(s => s !== serial);
                                                        }

                                                        if (updatedSerials.length > item.quantity) {
                                                            setError(`You can only select ${item.quantity} serial number(s) for ${item.productName}.`);
                                                            return;
                                                        }
                                                        handleItemChange(index, 'serialNumbers', updatedSerials);
                                                    }}
                                                    className="h-3 w-3 text-sky-600 border-gray-300 rounded focus:ring-sky-500"
                                                    disabled={!item.serialNumbers?.includes(serial) && (item.serialNumbers?.length || 0) >= item.quantity}
                                                />
                                                <span className="ml-1.5 truncate" title={serial}>{serial}</span>
                                            </label>
                                        ))}
                                    </div>
                                    {item.serialNumbers?.length !== item.quantity && (
                                        <p className="text-[10px] text-amber-600 mt-1">Please select {item.quantity} serial number(s).</p>
                                    )}
                                </div>
                            )}
                            {product?.hasSerialNumber && availableSerials.length === 0 && (
                                <p className="text-[10px] text-red-500 mt-1 italic">
                                    No serial numbers found in stock at this location.
                                </p>
                            )}
                        </div>
                    );
                })}
                {items.length === 0 && (
                    <p className="text-sm text-gray-500 italic py-2">No items added to the transfer.</p>
                )}
            </div>

            <button
                type="button"
                onClick={handleAddItem}
                disabled={availableProducts.length === 0}
                className="text-sm text-sky-600 hover:text-sky-800 font-medium disabled:text-gray-400 mt-2"
            >
                + Add Product
            </button>

            {error && <p className="text-red-500 text-sm mt-4 font-medium">{error}</p>}

            <div className="flex justify-end gap-4 mt-6 pt-4 border-t dark:border-gray-700">
                <button type="button" onClick={onCancel} className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500">Cancel</button>
                <button type="submit" className="bg-sky-600 text-white px-4 py-2 rounded-md hover:bg-sky-700">Transfer</button>
            </div>
        </form>
    );
};

export default StockTransferForm;