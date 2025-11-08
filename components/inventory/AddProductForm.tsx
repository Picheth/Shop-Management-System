import React, { useState } from 'react';
import { DataProduct, Branch } from '../../types';

type AddProductFormData = Omit<DataProduct, 'id' | 'status' | 'history' | 'imageUrl' | 'stockByLocation'> & {
    initialStock: number;
    branchId: string;
};

interface AddProductFormProps {
    onAddProduct: (product: AddProductFormData) => void;
    onCancel: () => void;
    existingCategories: string[];
    branches: Branch[];
}

const AddProductForm: React.FC<AddProductFormProps> = ({ onAddProduct, onCancel, existingCategories, branches }) => {
    const [formData, setFormData] = useState({
        name: '',
        sku: '',
        category: existingCategories[0] || '',
        price: 0,
        initialStock: 0,
        branchId: branches[0]?.id || '',
    });
    const [errors, setErrors] = useState<Partial<Record<keyof typeof formData, string>>>({});

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        const isNumber = ['price', 'initialStock'].includes(name);
        setFormData(prev => ({
            ...prev,
            [name]: isNumber ? Number(value) : value,
        }));
    };

    const validate = (): boolean => {
        const newErrors: Partial<Record<keyof typeof formData, string>> = {};
        if (!formData.name.trim()) newErrors.name = 'Product name is required.';
        if (!formData.sku.trim()) newErrors.sku = 'SKU is required.';
        if (!formData.category.trim()) newErrors.category = 'Category is required.';
        if (formData.initialStock < 0) newErrors.initialStock = 'Stock cannot be negative.';
        if (formData.price <= 0) newErrors.price = 'Price must be greater than zero.';
        if (!formData.branchId) newErrors.branchId = 'Please select a branch.';
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validate()) {
            const { initialStock, branchId, ...rest } = formData;
            onAddProduct({
                ...rest,
                initialStock,
                branchId
            });
        }
    };
    
    const inputClasses = "w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm px-3 py-2 text-sm text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-sky-500";
    const labelClasses = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";
    const errorClasses = "text-red-500 text-xs mt-1";

    return (
        <form onSubmit={handleSubmit} noValidate>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="name" className={labelClasses}>Product Name</label>
                    <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} className={inputClasses} required />
                    {errors.name && <p className={errorClasses}>{errors.name}</p>}
                </div>
                 <div>
                    <label htmlFor="sku" className={labelClasses}>SKU</label>
                    <input type="text" id="sku" name="sku" value={formData.sku} onChange={handleChange} className={inputClasses} required />
                    {errors.sku && <p className={errorClasses}>{errors.sku}</p>}
                </div>
                <div>
                    <label htmlFor="category" className={labelClasses}>Category</label>
                     <select id="category" name="category" value={formData.category} onChange={handleChange} className={inputClasses} required>
                        <option value="" disabled>Select a category</option>
                        {existingCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                     </select>
                    {errors.category && <p className={errorClasses}>{errors.category}</p>}
                </div>
                <div>
                    <label htmlFor="price" className={labelClasses}>Price</label>
                    <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <span className="text-gray-500 sm:text-sm">$</span>
                        </div>
                        <input type="number" id="price" name="price" value={formData.price} onChange={handleChange} className={`${inputClasses} pl-7`} required min="0.01" step="0.01" />
                    </div>
                     {errors.price && <p className={errorClasses}>{errors.price}</p>}
                </div>
                <div>
                    <label htmlFor="initialStock" className={labelClasses}>Initial Stock Quantity</label>
                    <input type="number" id="initialStock" name="initialStock" value={formData.initialStock} onChange={handleChange} className={inputClasses} required min="0" />
                     {errors.initialStock && <p className={errorClasses}>{errors.initialStock}</p>}
                </div>
                 <div>
                    <label htmlFor="branchId" className={labelClasses}>Initial Stock Branch</label>
                     <select id="branchId" name="branchId" value={formData.branchId} onChange={handleChange} className={inputClasses} required>
                        <option value="" disabled>Select a branch</option>
                        {branches.map(branch => <option key={branch.id} value={branch.id}>{branch.name}</option>)}
                     </select>
                    {errors.branchId && <p className={errorClasses}>{errors.branchId}</p>}
                </div>
            </div>
            <div className="flex justify-end gap-4 mt-6 pt-4 border-t dark:border-gray-700">
                <button type="button" onClick={onCancel} className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">
                    Cancel
                </button>
                <button type="submit" className="bg-sky-600 text-white px-4 py-2 rounded-md hover:bg-sky-700 transition-colors">
                    Save Product
                </button>
            </div>
        </form>
    );
};

export default AddProductForm;