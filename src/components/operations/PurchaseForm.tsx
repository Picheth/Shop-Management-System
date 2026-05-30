import React, { useState, useRef, useEffect } from 'react';
import FormInput from '../ui/FormInput';
import FormSelect from '../ui/FormSelect';
import InlineFormInput from '../ui/InlineFormInput';
import InlineFormSelect from '../ui/InlineFormSelect';

import {
    DataProduct,
    LineItem,
    Purchase,
    Branch,
} from '../../types';

type PurchaseFormData = Omit<Purchase, 'id' | 'total'>;

interface PurchaseFormProps {
    products: DataProduct[];

    branches: Branch[];

    onAdd: (data: PurchaseFormData) => void | Promise<void>;

    isSaving?: boolean;

    onCancel: () => void;
}

const PurchaseForm: React.FC<PurchaseFormProps> = ({
    products,
    branches,
    onAdd,
    isSaving = false,
    onCancel,
}) => {

    const [purchaseNumber] = useState(
        `PUR-${Date.now()}`
    );

    const [supplier, setSupplier] = useState('');

    const [branchId, setBranchId] = useState(
        branches[0]?.id || ''
    );

    const [purchaseDate, setPurchaseDate] = useState(
        new Date().toISOString().split('T')[0]
    );

    const [items, setItems] = useState<LineItem[]>([]);

    const [error, setError] = useState('');

    const [scanValue, setScanValue] = useState('');
    const [scanSuccess, setScanSuccess] = useState(false);

    const scanInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        scanInputRef.current?.focus();
    }, []);

    /* =========================================================
       SCAN PRODUCT
    ========================================================= */

    const handleScan = () => {

        const barcode = scanValue.trim();

        if (!barcode) return;

        const product = products.find(
            p =>
                p.sku === barcode ||
                p.productNumber === barcode
        );

        if (!product) {

            setError(
                `Product "${barcode}" not found.`
            );

            setScanValue('');

            return;
        }

        const existingIndex = items.findIndex(
            item => item.productId === product.id
        );

        if (existingIndex > -1) {

            const updated = [...items];

            updated[existingIndex].quantity += 1;

            setItems(updated);

        } else {

            setItems([
                ...items,
                {
                    sku: product.sku,

                    productId: product.id,

                    productName: product.name,

                    quantity: 1,

                    price: product.costPrice,

                    serialNumbers:
                        product.hasSerialNumber
                            ? []
                            : undefined,

                    imeis:
                        product.hasIMEI
                            ? []
                            : undefined,
                },
            ]);
        }

        setScanValue('');

        setError('');
        setScanSuccess(true);
        setTimeout(() => setScanSuccess(false), 1000);
    };

    /* =========================================================
       ADD ITEM
    ========================================================= */

    const handleAddItem = () => {

        const firstProduct = products[0];

        if (!firstProduct) return;

        setItems([
            ...items,
            {
                sku: firstProduct.sku,

                productId: firstProduct.id,

                productName: firstProduct.name,

                quantity: 1,

                price: firstProduct.costPrice,

                serialNumbers:
                    firstProduct.hasSerialNumber
                        ? []
                        : undefined,

                imeis:
                    firstProduct.hasIMEI
                        ? []
                        : undefined,
            },
        ]);
    };

    /* =========================================================
       ITEM CHANGE
    ========================================================= */

    const handleItemChange = (
        index: number,
        field: keyof LineItem,
        value: any
    ) => {

        const updated = [...items];

        const current = updated[index];

        if (field === 'productId') {

            const product = products.find(
                p => p.id === value
            );

            if (!product) return;

            current.productId = product.id;

            current.productName = product.name;

            current.price = product.costPrice;

            current.sku = product.sku;

            current.serialNumbers =
                product.hasSerialNumber
                    ? []
                    : undefined;

            current.imeis =
                product.hasIMEI
                    ? []
                    : undefined;

        } else if (field === 'serialNumbers') {

            current.serialNumbers =
                value
                    .split('\n')
                    .map((v: string) => v.trim())
                    .filter(Boolean);

        } else if (field === 'imeis') {

            current.imeis =
                value
                    .split('\n')
                    .map((v: string) => v.trim())
                    .filter(Boolean);

        } else {

            (current as any)[field] = value;
        }

        setItems(updated);
    };

    /* =========================================================
       REMOVE ITEM
    ========================================================= */

    const handleRemoveItem = (
        index: number
    ) => {

        setItems(
            items.filter((_, i) => i !== index)
        );
    };

    /* =========================================================
       SUBMIT
    ========================================================= */

    const handleSubmit = (
        e: React.FormEvent
    ) => {

        e.preventDefault();

        if (items.length === 0) {

            setError(
                'Please add at least one item.'
            );

            return;
        }

        for (const item of items) {

            const product = products.find(
                p => p.id === item.productId
            );

            if (!product) continue;

            /* SERIAL VALIDATION */

            if (product.hasSerialNumber) {

                const serialCount =
                    item.serialNumbers?.length || 0;

                if (
                    serialCount !== item.quantity
                ) {

                    setError(
                        `"${item.productName}" requires ${item.quantity} serial number(s).`
                    );

                    return;
                }
            }

            /* IMEI VALIDATION */

            if (product.hasIMEI) {

                const imeiCount =
                    item.imeis?.length || 0;

                if (
                    imeiCount !== item.quantity
                ) {

                    setError(
                        `"${item.productName}" requires ${item.quantity} IMEI number(s).`
                    );

                    return;
                }
            }
        }

        setError('');

        onAdd({
            purchaseNumber,

            supplier,

            branchId,

            purchaseDate,

            items,

            status: 'Received',
        });
    };

    /* =========================================================
       TOTAL
    ========================================================= */

    const total = items.reduce(
        (sum, item) =>
            sum + item.quantity * item.price,
        0
    );

    /* =========================================================
       STYLE
    ========================================================= */

    const inputClasses =
        'w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm px-3 py-2 text-sm text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-sky-500';

    const labelClasses =
        'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1';

    /* =========================================================
       RENDER
    ========================================================= */

    return (

        <form onSubmit={handleSubmit}>
            {/* HEADER */}
            {/* HEADER */}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">

                {/* QUICK SCAN */}

                <div className={`md:col-span-2 p-4 border rounded-lg transition-all duration-300 ${
                    scanSuccess 
                        ? 'bg-green-50 dark:bg-green-900/20 border-green-500 shadow-[0_0_10px_rgba(34,197,94,0.2)]' 
                        : 'bg-sky-50 dark:bg-sky-900/20 border-sky-200 dark:border-sky-800 shadow-none'
                }`}>

                    <div className="flex justify-between items-center mb-1">
                        <label
                            htmlFor="barcode-scan"
                            className={`${labelClasses} mb-0 transition-colors ${scanSuccess ? 'text-green-700 dark:text-green-400' : 'text-sky-700 dark:text-sky-300'}`}
                        >
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
                            placeholder="Scan barcode..."
                            value={scanValue}
                            onChange={(e) =>
                                setScanValue(
                                    e.target.value
                                )
                            }
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
                            className="bg-sky-600 text-white px-4 py-2 rounded-md hover:bg-sky-700"
                        >
                            Add
                        </button>
                    </div>
                </div>

                {/* BRANCH */}

                <FormSelect
                    label="Branch"
                    name="branchId"
                    value={branchId}
                    onChange={(e) => setBranchId(e.target.value)}
                    options={branches.map(branch => ({ 
                        value: branch.id, 
                        label: branch.name 
                    }))}
                    required
                />

                {/* SUPPLIER */}

                <FormInput
                    label="Supplier"
                    name="supplier"
                    placeholder="Supplier name"
                    value={supplier}
                    onChange={(e) => setSupplier(e.target.value)}
                    required
                />

                {/* PURCHASE DATE */}

                <FormInput
                    label="Purchase Date"
                    type="date"
                    name="purchaseDate"
                    value={purchaseDate}
                    onChange={(e) => setPurchaseDate(e.target.value)}
                    className="md:col-span-2"
                    required
                />
            </div>

            {/* ITEMS */}

            <h3 className="text-md font-semibold mb-2 text-gray-800 dark:text-white">
                Purchase Items
            </h3>

            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">

                {items.map((item, index) => {

                    const selectedProduct =
                        products.find(
                            p => p.id === item.productId
                        );

                    return (

                        <div
                            key={index}
                            className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg space-y-3 bg-gray-50 dark:bg-gray-800/40"
                        >

                            {/* ROW */}

                            <div className="grid grid-cols-12 gap-2">

                                {/* PRODUCT */}
                                <div className="col-span-5">
                                    <InlineFormSelect
                                        value={item.productId}
                                        onChange={(e) => handleItemChange(index, 'productId', e.target.value)}
                                        options={products.map(p => ({ value: p.id, label: p.name }))}
                                    />
                                </div>

                                {/* QTY */}
                                <div className="col-span-2">
                                    <InlineFormInput
                                        type="number"
                                        value={item.quantity}
                                        min="1"
                                        onChange={(e) => handleItemChange(index, 'quantity', Number(e.target.value))}
                                    />
                                </div>

                                {/* PRICE */}
                                <div className="col-span-3">
                                    <InlineFormInput
                                        type="number"
                                        value={item.price}
                                        min="0"
                                        step="0.01"
                                        onChange={(e) => handleItemChange(index, 'price', Number(e.target.value))}
                                    />
                                </div>

                                {/* REMOVE */}
                                <div className="col-span-2 flex items-center justify-center">
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

                            {/* SERIAL */}
                            {selectedProduct?.hasSerialNumber && (
                                <InlineFormInput
                                    isTextArea
                                    placeholder="Serial Numbers (one per line)"
                                    value={item.serialNumbers?.join('\n') || ''}
                                    onChange={(e) => handleItemChange(index, 'serialNumbers', e.target.value)}
                                    rows={3}
                                />
                            )}

                            {/* IMEI */}
                            {selectedProduct?.hasIMEI && (
                                <InlineFormInput
                                    isTextArea
                                    placeholder="IMEI Numbers (one per line)"
                                    value={item.imeis?.join('\n') || ''}
                                    onChange={(e) => handleItemChange(index, 'imeis', e.target.value)}
                                    rows={3}
                                />
                            )}
                        </div>
                    );
                })}
            </div>

            {/* ERROR */}

            {error && (

                <p className="mt-3 text-sm text-red-500 font-medium">
                    {error}
                </p>
            )}

            {/* ADD ITEM */}

            <button
                type="button"
                onClick={handleAddItem}
                className="mt-3 text-sm text-sky-600 hover:text-sky-800"
            >
                + Add Item
            </button>

            {/* TOTAL */}

            <div className="mt-6 text-right">

                <p className="text-lg font-bold text-gray-900 dark:text-white">
                    Total: ${total.toFixed(2)}
                </p>
            </div>

            {/* FOOTER */}

            <div className="flex justify-end gap-4 mt-6 pt-4 border-t dark:border-gray-700">

                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                    Cancel
                </button>

                <button
                    type="submit"
                    disabled={isSaving}
                    className="px-4 py-2 rounded-md bg-sky-600 text-white hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                    {isSaving && (
                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    )}
                    {isSaving ? 'Saving...' : 'Save Purchase'}
                </button>
            </div>
        </form>
    );
};

export default PurchaseForm;