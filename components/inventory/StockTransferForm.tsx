import React, { useState, useMemo } from 'react';
import { DataProduct, Branch, StockTransfer } from '../../types';

type StockTransferFormData = Omit<StockTransfer, 'id' | 'date'>;

interface StockTransferFormProps {
    products: DataProduct[];
    branches: Branch[];
    onAdd: (data: StockTransferFormData) => void;
    onCancel: () => void;
}

const StockTransferForm: React.FC<StockTransferFormProps> = ({ products, branches, onAdd, onCancel }) => {
    const [fromBranchId, setFromBranchId] = useState(branches[0]?.id || '');
    const [toBranchId, setToBranchId] = useState(branches[1]?.id || '');
    const [productId, setProductId] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [error, setError] = useState('');

    const availableProducts = useMemo(() => {
        if (!fromBranchId) return [];
        return products.filter(p => (p.stockByLocation[fromBranchId] || 0) > 0);
    }, [products, fromBranchId]);
    
    const selectedProductStock = useMemo(() => {
        const product = products.find(p => p.id === productId);
        return product?.stockByLocation[fromBranchId] || 0;
    }, [products, productId, fromBranchId]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (fromBranchId === toBranchId) {
            setError('Source and destination branches cannot be the same.');
            return;
        }
        if (!productId) {
            setError('Please select a product to transfer.');
            return;
        }
        if (quantity <= 0) {
            setError('Quantity must be greater than zero.');
            return;
        }
        if (quantity > selectedProductStock) {
            setError(`Cannot transfer more than the available stock (${selectedProductStock}).`);
            return;
        }

        onAdd({ fromBranchId, toBranchId, productId, quantity });
    };

    const handleFromBranchChange = (id: string) => {
        setFromBranchId(id);
        setProductId(''); // Reset product selection when source changes
        setQuantity(1);
    };
    
    const handleProductChange = (id: string) => {
        setProductId(id);
        setQuantity(1); // Reset quantity when product changes
    };

    const inputClasses = "w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm px-3 py-2 text-sm text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-sky-500";
    const labelClasses = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";

    return (
        <form onSubmit={handleSubmit} noValidate>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="fromBranchId" className={labelClasses}>From Branch</label>
                    <select id="fromBranchId" value={fromBranchId} onChange={(e) => handleFromBranchChange(e.target.value)} className={inputClasses} required>
                        <option value="" disabled>Select source</option>
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
                <div className="md:col-span-2">
                     <label htmlFor="productId" className={labelClasses}>Product</label>
                     <select id="productId" value={productId} onChange={(e) => handleProductChange(e.target.value)} className={inputClasses} required disabled={!fromBranchId}>
                        <option value="" disabled>Select a product</option>
                        {availableProducts.map(p => (
                            <option key={p.id} value={p.id}>
                                {p.name} (Stock: {p.stockByLocation[fromBranchId]})
                            </option>
                        ))}
                     </select>
                </div>
                 <div className="md:col-span-2">
                    <label htmlFor="quantity" className={labelClasses}>Quantity</label>
                    <input 
                        type="number" 
                        id="quantity" 
                        value={quantity} 
                        onChange={(e) => setQuantity(Number(e.target.value))} 
                        className={inputClasses} 
                        required 
                        min="1" 
                        max={selectedProductStock}
                        disabled={!productId}
                    />
                </div>
            </div>
            {error && <p className="text-red-500 text-xs mt-4">{error}</p>}
            <div className="flex justify-end gap-4 mt-6 pt-4 border-t dark:border-gray-700">
                <button type="button" onClick={onCancel} className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500">Cancel</button>
                <button type="submit" className="bg-sky-600 text-white px-4 py-2 rounded-md hover:bg-sky-700">Transfer</button>
            </div>
        </form>
    );
};

export default StockTransferForm;