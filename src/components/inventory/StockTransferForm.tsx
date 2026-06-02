import React, { useState, useMemo, useEffect, useRef } from 'react';
import { DataProduct, Branch, StockTransfer, LineItem } from '../../types';
import FormInput from '../ui/FormInput';
import FormSelect from '../ui/FormSelect';
import InlineFormInput from '../ui/InlineFormInput';

type StockTransferFormData = Omit<StockTransfer, 'id' | 'total'>;

interface StockTransferFormProps {
    products: DataProduct[];
    branches: Branch[];
    stockTransfers: StockTransfer[];
    onAdd: (data: StockTransferFormData) => void;
    onCancel: () => void;
    companyLogoUrl?: string;
    companyName?: string;
    address?: string;
    signatureUrl?: string;
    note?: string;
}

interface DraftData {
    fromBranchId: string;
    toBranchId: string;
    items: LineItem[];
    purpose: string;
    customPurpose: string;
    note: string;
}

const StockTransferForm: React.FC<StockTransferFormProps> = ({ products, branches, stockTransfers, onAdd, onCancel, note: initialNote }) => {
    const [fromBranchId, setFromBranchId] = useState(branches[0]?.id || '');
    const [toBranchId, setToBranchId] = useState(branches[1]?.id || '');
    const [items, setItems] = useState<LineItem[]>([]);
    const [purpose, setPurpose] = useState('');
    const [customPurpose, setCustomPurpose] = useState('');
    const [note, setNote] = useState('');
    const [error, setError] = useState('');
    const [scanValue, setScanValue] = useState('');
    const [scanSuccess, setScanSuccess] = useState(false);
    const [hasDraft, setHasDraft] = useState(false);
    const [lastAutoSavedAt, setLastAutoSavedAt] = useState<string | null>(null);

    const scanInputRef = useRef<HTMLInputElement>(null);
    const autoSaveRef = useRef<DraftData>({ fromBranchId, toBranchId, items, purpose, customPurpose, note });

    // Keep the autoSaveRef synchronized with the latest state
    autoSaveRef.current = { fromBranchId, toBranchId, items, purpose, customPurpose, note };

    const DRAFT_STORAGE_KEY = 'stockTransferDraft';

    useEffect(() => {
        scanInputRef.current?.focus();

        // Auto-recovery logic on mount
        try {
            const storedDraft = localStorage.getItem(DRAFT_STORAGE_KEY);
            if (storedDraft) {
                const draft: DraftData = JSON.parse(storedDraft);
                // Only auto-load if the form is currently empty
                if (items.length === 0 && !fromBranchId && !toBranchId && !purpose && !note) {
                    loadDraftData(draft);
                    setError('Draft automatically recovered.');
                }
                setHasDraft(true); // Always set hasDraft if a draft exists, even if not auto-loaded
            }
        } catch (e) {
            console.error("Failed to auto-load draft from localStorage", e);
            clearDraft(); // Clear corrupted draft
        }

        // Setup 30-second periodic auto-save
        const autoSaveInterval = setInterval(() => {
            const currentData = autoSaveRef.current;
            
            // Only auto-save if there are items to prevent saving empty forms
            if (currentData.items.length > 0) {
                const dataString = JSON.stringify(currentData);
                // Only write to localStorage if the data has actually changed
                if (dataString !== localStorage.getItem(DRAFT_STORAGE_KEY)) {
                    localStorage.setItem(DRAFT_STORAGE_KEY, dataString);
                    setHasDraft(true);
                    setLastAutoSavedAt(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
                }
            }
        }, 30000);

        return () => clearInterval(autoSaveInterval);
    }, []);

    // Helper function to load draft data into state
    const loadDraftData = (draft: DraftData) => {
        setFromBranchId(draft.fromBranchId);
        setToBranchId(draft.toBranchId);
        setItems(draft.items);
        setPurpose(draft.purpose);
        setCustomPurpose(draft.customPurpose);
        setNote(draft.note);
        setLastAutoSavedAt(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };

    const handleLoadDraft = () => { // This is for the manual "Load Draft" button
        try {
            const storedDraft = localStorage.getItem(DRAFT_STORAGE_KEY);
            if (storedDraft) {
                const draft: DraftData = JSON.parse(storedDraft);
                
                if (items.length > 0 && !window.confirm('Loading a draft will replace your current items list. Continue?')) {
                    return;
                }

                loadDraftData(draft);
                setError('Draft loaded successfully.');
            } else {
                setError('No draft found to load.');
                setHasDraft(false);
            }
        }
        catch (e) {
            console.error("Failed to load draft from localStorage", e);
            clearDraft(); // Clear corrupted draft
        }
    };

    const saveDraft = () => {
        const draft: DraftData = { fromBranchId, toBranchId, items, purpose, customPurpose, note };
        localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
        setHasDraft(true);
        setLastAutoSavedAt(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        setError('Draft saved successfully!');
    };

    const clearDraft = () => {
        localStorage.removeItem(DRAFT_STORAGE_KEY);
        setHasDraft(false);
        setLastAutoSavedAt(null);
        setError('Draft cleared.');
    };

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
                    dimensions: productWithSerial.attributes?.find(a => a.name.toLowerCase() === 'dimensions')?.value || '',
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
                dimensions: product.attributes?.find(a => a.name.toLowerCase() === 'dimensions')?.value || '',
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

        if (items.length === 0) {
            setError('You must add at least one item to the transfer list.');
            return;
        }

        if (fromBranchId === toBranchId) {
            setError('Source and destination branches cannot be the same.');
            return;
        }
        if (!purpose || (purpose === 'Other' && !customPurpose)) {
            setError('Please select a purpose for the transfer.');
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

        const finalPurpose = purpose === 'Other' ? customPurpose.trim() : purpose;

        // Ensure unique shortCode by checking against existing transfers
        const existingCodes = new Set(stockTransfers.map(t => t.shortCode).filter(Boolean));
        let shortCode = '';
        do {
            shortCode = Math.floor(100000 + Math.random() * 900000).toString();
        } while (existingCodes.has(shortCode));

        onAdd({
            fromBranchId,
            toBranchId,
            items,
            note,
            shortCode,
            transferDate: new Date().toISOString().split('T')[0],
            status: 'Pending'
        });
        localStorage.removeItem(DRAFT_STORAGE_KEY);
        setLastAutoSavedAt(null);
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
            dimensions: firstProduct.attributes?.find(a => a.name.toLowerCase() === 'dimensions')?.value || '',
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
                currentItem.dimensions = product.attributes?.find(a => a.name.toLowerCase() === 'dimensions')?.value || '';
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
        const itemName = items[index]?.productName || 'this item';
        if (window.confirm(`Are you sure you want to remove ${itemName} from the transfer list?`)) {
            setItems(items.filter((_, i) => i !== index));
            setError('');
        }
    };

    const handleClearAllItems = () => {
        if (items.length === 0) return;
        if (window.confirm('Are you sure you want to remove all items from the transfer list?')) {
            setItems([]);
            setError('');
        }
    };

    const handleSaveAsDraft = () => {
        saveDraft();
    };

    const handleClearDraft = () => {
        clearDraft();
    };

    const inputClasses = "w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm px-3 py-2 text-sm text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-sky-500";
    const labelClasses = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";

    return (
        <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                <div className={`md:col-span-2 p-4 border rounded-lg transition-all duration-300 mb-2 ${
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

                <FormSelect
                    label="From Branch"
                    name="fromBranchId"
                    value={fromBranchId}
                    onChange={(e) => { 
                        const val = e.target.value;
                        setFromBranchId(val); 
                        setItems([]); 
                        setError(''); 
                        if (toBranchId === val) setToBranchId('');
                    }}
                    options={branches.map(branch => ({ value: branch.id, label: branch.name }))}
                    required
                />

                <FormSelect
                    label="To Branch"
                    name="toBranchId"
                    value={toBranchId}
                    onChange={(e) => setToBranchId(e.target.value)}
                    options={branches
                        .filter(b => b.id !== fromBranchId)
                        .map(branch => ({ value: branch.id, label: branch.name }))
                    }
                    placeholder="Select destination"
                    required
                />

                <FormSelect
                    label="Purpose"
                    name="purpose"
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    options={[
                        { value: 'Restock', label: 'Restock' },
                        { value: 'Sale Fulfillment', label: 'Sale Fulfillment' },
                        { value: 'Other', label: 'Other' },
                    ]}
                    placeholder="Select Purpose"
                    required
                />

                {purpose === 'Other' ? (
                    <FormInput
                        label="Specify Purpose"
                        name="customPurpose"
                        value={customPurpose}
                        onChange={(e: any) => setCustomPurpose(e.target.value)}
                        placeholder="Enter details..."
                        maxLength={50}
                        required
                    />
                ) : (
                    <div className="hidden md:block"></div>
                )}
            </div>

            <div className="mt-4">
                <FormInput
                    label="Note (Optional)"
                    name="note"
                    isTextArea
                    value={note}
                    onChange={(e: any) => setNote(e.target.value)}
                    className="h-20"
                    placeholder="Reason for transfer..."
                    maxLength={250}
                />
            </div>

            <div className="flex justify-between items-center mt-6 mb-2">
                <h3 className="text-md font-medium text-gray-800 dark:text-gray-200">Items to Transfer</h3>
                {items.length > 0 && (
                    <button
                        type="button"
                        onClick={handleClearAllItems}
                        className="text-[10px] font-bold text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors uppercase tracking-tight"
                    >
                        Clear All Items
                    </button>
                )}
            </div>
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
                                    className={`${inputClasses} col-span-5`}
                                >
                                    {availableProducts.map(p => (
                                        <option key={p.id} value={p.id}>
                                            {p.name} (Avail: {p.stockByLocation[fromBranchId] || 0})
                                        </option>
                                    ))}
                                </select>
                                <div className="col-span-3">
                                    <InlineFormInput
                                        placeholder="Dimensions"
                                        value={item.dimensions || ''}
                                        onChange={(e: any) => handleItemChange(index, 'dimensions', e.target.value)}
                                        title="Product Dimensions (L x W x H)"
                                    />
                                </div>
                                <input
                                    type="number"
                                    placeholder="Qty"
                                    value={item.quantity}
                                    onChange={(e) => handleItemChange(index, 'quantity', Number(e.target.value))}
                                    className={`${inputClasses} col-span-2`}
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

            <div className="flex items-center justify-between mt-6 pt-4 border-t dark:border-gray-700">
                <div className="flex items-center gap-1.5">
                    {lastAutoSavedAt && (
                        <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-tight flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Last auto-saved at {lastAutoSavedAt}
                        </span>
                    )}
                </div>

                <div className="flex justify-end gap-4">
                    <button 
                        type="button" 
                        onClick={onCancel} 
                        className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                    >
                        Cancel
                    </button>
                    {hasDraft && (
                        <button 
                            type="button" 
                            onClick={handleLoadDraft} 
                            className="bg-sky-50 dark:bg-sky-900/20 text-sky-600 dark:text-sky-400 border border-sky-100 dark:border-sky-800 px-4 py-2 rounded-md hover:bg-sky-100 dark:hover:bg-sky-900/40 transition-colors text-sm font-medium"
                        >
                            Load Draft
                        </button>
                    )}
                    <button 
                        type="button" 
                        onClick={handleSaveAsDraft} 
                        className="bg-amber-500 dark:bg-amber-600 text-white px-4 py-2 rounded-md hover:bg-amber-600 dark:hover:bg-amber-700 transition-colors"
                    >
                        Save as Draft
                    </button>
                    <button 
                        type="submit" 
                        className="bg-sky-600 text-white px-4 py-2 rounded-md hover:bg-sky-700 transition-colors"
                    >
                        Transfer
                    </button>
                </div>
            </div>
        </form>
    );
};

export default StockTransferForm;