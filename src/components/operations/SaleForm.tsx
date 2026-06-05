import { useState, useMemo, useRef, useEffect } from 'react';
import { Product, LineItem, Sale, Branch } from '../../types';
import FormInput from '../ui/FormInput';
import FormSelect from '../ui/FormSelect';
import InlineFormInput from '../ui/InlineFormInput';
import InlineFormSelect from '../ui/InlineFormSelect';
import SalesTrendChart from '../core/SalesTrendChart';

type SaleFormData = Omit<Sale, 'id' | 'total'>;

interface SaleFormProps {
    products: Product[];
    branches: Branch[];
    onAdd: (data: SaleFormData) => Promise<void>;
    isSaving?: boolean;
    onCancel: () => void;
}

const SaleForm: React.FC<SaleFormProps> = ({ products, branches, onAdd, isSaving = false, onCancel }) => {
    const [customer, setCustomer] = useState('Walk-in Customer');
    const [branch_id, setBranch_id] = useState(branches[0]?.id || ''); // This is already snake_case
    const [sale_date, setSale_date] = useState(new Date().toISOString().split('T')[0]); // This is already snake_case
    const [items, setItems] = useState<LineItem[]>([]);
    const [error, setError] = useState('');
    const [scanValue, setScanValue] = useState('');
    const [scanSuccess, setScanSuccess] = useState(false);

    const scanInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        scanInputRef.current?.focus();
    }, []);

    const handleScan = () => {
        const barcode = scanValue.trim();
        if (!barcode) return;

        // 1. Search for a product that has this serial in the selected branch
        const productWithSerial = products.find(p => 
            p.serial_numbers_by_location?.[branch_id]?.includes(barcode) // This is already snake_case
        );

        if (!productWithSerial) {
            setError(`Serial number "${barcode}" not found in stock at this branch.`);
            setScanValue('');
            return;
        }

        // 2. Check if this specific serial is already in our items list
        const isDuplicate = items.some(item => item.serial_numbers?.includes(barcode));
        if (isDuplicate) {
            setError(`Serial "${barcode}" has already been added to this sale.`);
            setScanValue('');
            return;
        }

        // 3. Find if the product is already in the items list to update quantity, or add new
        const existingItemIndex = items.findIndex(item => item.product_id === productWithSerial.id); // productId is camelCase

        if (existingItemIndex > -1) {
            const updatedItems = [...items];
            const item = updatedItems[existingItemIndex];
            
            item.quantity += 1;
            item.serial_numbers = [...(item.serial_numbers || []), barcode];
            setItems(updatedItems);
        } else {
            setItems([...items, {
                product_id: productWithSerial.id, // productId is camelCase
                product_name: productWithSerial.name, // productName is camelCase
                quantity: 1,
                price: productWithSerial.sale_price,
                serial_numbers: [barcode]
            }]);
        }

        setScanValue('');
        setError('');
        setScanSuccess(true);
        setTimeout(() => setScanSuccess(false), 1000);
    };
    
    const availableProducts = useMemo(() => {
        if (!branch_id) return []; // This is already snake_case
        return products.filter(p => (p.stock_by_location[branch_id] || 0) > 0);
    }, [products, branch_id]); // This is already snake_case

    const handleAddItem = () => {
        if (availableProducts.length === 0) {
            setError('No products in stock at this branch to add.');
            return;
        }
        setError('');
        const firstProduct = availableProducts[0];
        setItems([...items, { product_id: firstProduct.id, product_name: firstProduct.name, quantity: 1, price: firstProduct.sale_price, serial_numbers: [] }]);
    };

    const handleItemChange = (index: number, field: keyof LineItem, value: string | number | string[]) => {
        setError('');
        const newItems = [...items];
        const currentItem = newItems[index];
        const product = products.find(p => p.id === currentItem.product_id);
        const stockAtBranch = product?.stock_by_location[branch_id] || 0;
        
        if (field === 'product_id') {
            const selectedProduct = products.find(p => p.id === value);
            if (selectedProduct) {
                currentItem.product_id = selectedProduct.id; // productId is camelCase
                currentItem.product_name = selectedProduct.name; // productName is camelCase
                currentItem.price = selectedProduct.sale_price; // salePrice is camelCase
                currentItem.serial_numbers = []; // Reset serial numbers when product changes
                const newStockAtBranch = selectedProduct.stock_by_location[branch_id] || 0; // This is already snake_case
                if (currentItem.quantity > newStockAtBranch) {
                    currentItem.quantity = newStockAtBranch;
                    setError(`Quantity for ${selectedProduct.name} adjusted to max available stock.`);
                }
            }
        } else if (field === 'serial_numbers') {
            currentItem.serial_numbers = value as string[]; // Value is already an array from checkbox handler
        } else if (field === 'quantity') {
            const newQuantity = Number(value);
            if (newQuantity > stockAtBranch) {
                currentItem.quantity = stockAtBranch;
                 setError(`Cannot sell more than available stock for ${product?.name} (${stockAtBranch}).`);
            } else {
                (currentItem[field] as any) = newQuantity;
                // If quantity is reduced, truncate selected serial numbers
                if (currentItem.serial_numbers && currentItem.serial_numbers.length > newQuantity) {
                    currentItem.serial_numbers = currentItem.serial_numbers.slice(0, newQuantity);
                    setError(`Selected serial numbers for ${currentItem.product_name} adjusted to match new quantity.`);
                }
            }
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
            setError('Please add at least one item to the sale.');
            return;
        }

        for (const item of items) {
            const serialCount = item.serial_numbers?.length || 0;
            if (serialCount !== item.quantity) {
                setError(`Product "${item.product_name}" expects ${item.quantity} serial number(s), but ${serialCount} were provided.`); // productName is camelCase
                return;
            }
        }

        setError('');
        onAdd({
            customer,
            branch_id: branch_id,
            sale_date: sale_date,
            items: items as any, // items is camelCase
            status: 'Completed',
        });
    };

    const total = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);

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
                            Quick Scan (Serial Number)
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
                            placeholder="Scan or type serial number..."
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
                        Tip: Focus this field and scan a serial number to automatically add products.
                    </p>
                </div>

                <FormSelect
                    label="Branch"
                    name="branch_id" // This is already snake_case
                    value={branch_id} // This is already snake_case
                    onChange={e => {setBranch_id(e.target.value); setItems([]); setError('');}} // This is already snake_case
                    options={branches.map(branch => ({ value: branch.id, label: branch.name }))}
                    required
                />

                <FormInput
                    label="Customer"
                    name="customer"
                    value={customer}
                    onChange={e => {setCustomer(e.target.value); setError('');}}
                    required
                />

                <FormInput
                    label="Sale Date"
                    type="date"
                    name="sale_date" // This is already snake_case
                    value={sale_date} // This is already snake_case
                    onChange={e => {setSale_date(e.target.value); setError('');}} // This is already snake_case
                    className="md:col-span-2"
                    required
                />
            </div>

            <h3 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-2">Items Sold</h3>
            <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                {items.map((item, index) => {
                    const productInStock = products.find(p => p.id === item.product_id);
                    const stock = productInStock?.stock_by_location[branch_id] || 0;
                    const availableSerials = productInStock?.serial_numbers_by_location?.[branch_id] || [];
                    
                    // Determine if the price has been manually overridden
                    const isPriceOverridden = productInStock && item.price !== productInStock.sale_price;

                    return (
                        <div key={index} className={`space-y-2 p-3 rounded-md border transition-all duration-200 ${
                            isPriceOverridden 
                                ? 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800' 
                                : 'bg-gray-50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-700'
                        }`}>
                            <div className="grid grid-cols-12 gap-2 items-center">
                                <div className="col-span-5">
                                    <InlineFormSelect 
                                        value={item.product_id}
                                        onChange={(e) => handleItemChange(index, 'product_id', e.target.value)}
                                        options={availableProducts.map(p => ({ 
                                            value: p.id, 
                                            label: `${p.name} (${p.stock_by_location[branch_id] || 0})`
                                        }))}
                                    />
                                </div>
                                <div className="col-span-2">
                                    <InlineFormInput 
                                        type="number" 
                                        placeholder="Qty" 
                                        value={item.quantity}
                                        onChange={(e) => handleItemChange(index, 'quantity', Number(e.target.value))}
                                        min="1" 
                                        max={stock}
                                    />
                                </div>
                                <div className="col-span-3 relative group/price">
                                    <InlineFormInput 
                                        type="number" 
                                        placeholder="Price" 
                                        value={item.price}
                                        onChange={(e) => handleItemChange(index, 'price', Number(e.target.value))}
                                        className={isPriceOverridden ? 'text-amber-700 dark:text-amber-400 font-bold border-amber-300 dark:border-amber-700' : ''}
                                        min="0"
                                        step="0.01"
                                    />
                                    {isPriceOverridden && (
                                        <div className="absolute -top-1.5 -right-1.5">
                                            <span 
                                                className="flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 shadow-sm border border-white dark:border-gray-800 cursor-help" 
                                                title={`Price Override: Original master price was $${productInStock.sale_price.toFixed(2)}`}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5 text-white" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                </svg>
                                            </span>
                                        </div>
                                    )}
                                </div>
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
                            {availableSerials.length > 0 && (
                                <div className="mt-2">
                                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Select Serial Numbers ({item.serial_numbers?.length || 0}/{item.quantity})</label>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-24 overflow-y-auto p-2 border border-gray-200 dark:border-gray-600 rounded-md">
                                        {availableSerials.map(serial => (
                                            <label key={serial} className="flex items-center text-sm text-gray-900 dark:text-gray-200">
                                                <input
                                                    type="checkbox"
                                                    value={serial}
                                                    checked={item.serial_numbers?.includes(serial) || false}
                                                    onChange={(e) => {
                                                        const isChecked = e.target.checked;
                                                        const currentSerials = item.serial_numbers ? [...item.serial_numbers] : [];
                                                        let updatedSerials: string[];

                                                        if (isChecked) {
                                                            updatedSerials = [...currentSerials, serial];
                                                        } else {
                                                            updatedSerials = currentSerials.filter(s => s !== serial);
                                                        }

                                                        // Enforce quantity limit
                                                        if (updatedSerials.length > item.quantity) {
                                                            setError(`You can only select ${item.quantity} serial number(s) for ${item.product_name}.`);
                                                            // Do not update items state if quantity exceeded
                                                            return;
                                                        }
                                                        handleItemChange(index, 'serial_numbers', updatedSerials);
                                                    }}
                                                    className="h-4 w-4 text-sky-600 border-gray-300 rounded focus:ring-sky-500"
                                                    disabled={!item.serial_numbers?.includes(serial) && (item.serial_numbers?.length || 0) >= item.quantity}
                                                />
                                                <span className="ml-2">{serial}</span>
                                            </label>
                                        ))}
                                    </div>
                                    {item.serial_numbers?.length !== item.quantity && item.quantity > 0 && (
                                        <p className="text-red-500 text-xs mt-1">
                                            Please select {item.quantity} serial number(s). Currently selected: {item.serial_numbers?.length || 0}.
                                        </p>
                                    )}
                                </div>
                            )}
                            {availableSerials.length === 0 && item.quantity > 0 && (
                                <p className="text-amber-500 text-xs mt-1">
                                    No serial numbers available for this product at this branch.
                                </p>
                            )}
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
                <button type="button" onClick={onCancel} className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">Cancel</button>
                <button 
                    type="submit" 
                    disabled={isSaving}
                    className="bg-sky-600 text-white px-4 py-2 rounded-md hover:bg-sky-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                    {isSaving && (
                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    )}
                    {isSaving ? 'Processing...' : 'Record Sale'}
                </button>
            </div>
        </form>
    );
};

export default SaleForm;