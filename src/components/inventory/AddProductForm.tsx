import React, { useMemo, useState } from 'react';
import { DataProduct, Branch, ProductType as ProductTypeInterface, Category as CategoryInterface, SubCategory as SubCategoryInterface, Brand as BrandInterface, ProductAttribute, Brand, Category, MasterAttribute, ProductVariant } from '../../types';
import { supabase } from '../../utils/supabase';
import FormInput from '../ui/FormInput';
import FormSelect from '../ui/FormSelect';
import Modal from '../ui/Modal';
import { useDuplicateValidation } from '../settings/useDuplicateValidation';
import { useFormValidation } from '../settings/useFormValidation';

type AddProductFormData = {
    name: string;
    sku: string;
    categoryId: string;
    typeId: string;
    subCategoryId: string;
    brandId: string;
    model: string;
    displaySize: string;
    salePrice: number;
    costPrice: number;
    initialStock: number;
    branchId: string;
    hasSerialNumber: boolean;
    hasIMEI: boolean;
    imageUrl: string;
    storageId: string;
    ramId: string;
    colorId: string;
    conditionId: string;
    attributes: ProductAttribute[];
    description: string;
};

interface AddProductFormProps {
    onSubmit: (product: any) => void;
    onCancel: () => void;
    initialData?: DataProduct;
    existingCategories: CategoryInterface[]; // Now receives full objects
    branches: Branch[];
    existingProductTypes: ProductTypeInterface[]; // Now receives full objects
    existingSubCategories: SubCategoryInterface[]; // Now receives full objects
    existingBrands: BrandInterface[]; // New prop for brands
    onQuickAddBrand?: (brand: Omit<Brand, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Brand>;
    onQuickAddCategory?: (category: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Category>;
    
    /* New Master Data Props */
    processors: MasterAttribute[];
    rams: MasterAttribute[];
    storages: MasterAttribute[];
    colors: MasterAttribute[];
    regions: MasterAttribute[];
    conditions: MasterAttribute[];
}

const AddProductForm: React.FC<AddProductFormProps> = ({
    onSubmit,
    onCancel,
    initialData,
    existingCategories,
    branches,
    existingProductTypes,
    existingSubCategories,
    existingBrands, // Destructure the new prop
    onQuickAddBrand,
    onQuickAddCategory,
    processors,
    rams,
    storages,
    colors,
    regions,
    conditions,
}) => {
    const [form, setForm] = useState<AddProductFormData>({
        name: initialData?.name || '',
        sku: initialData?.sku || '',
        categoryId: initialData?.categoryId || '',
        typeId: initialData?.typeId || '',
        subCategoryId: initialData?.subCategoryId || '',
        brandId: initialData?.brandId || '',
        model: initialData?.model || '',
        displaySize: initialData?.displaysize || '',
        salePrice: initialData?.salePrice || 0,
        costPrice: initialData?.costPrice || 0,
        initialStock: initialData 
            ? Object.values(initialData.stockByLocation).reduce((sum, qty) => sum + qty, 0) 
            : 0,
        branchId: initialData 
            ? Object.keys(initialData.stockByLocation)[0] || ''
            : branches[0]?.id || '',
        hasSerialNumber: initialData?.hasSerialNumber || false,
        hasIMEI: initialData?.hasIMEI || false,
        imageUrl: initialData?.imageUrl || '',
        storageId: '',
        ramId: '',
        colorId: '',
        conditionId: '',
        attributes: initialData?.attributes || [],
        description: initialData?.description || '',
    });

    // Quick Add Brand State
    const [isBrandModalOpen, setIsBrandModalOpen] = useState(false);
    const [isAddingBrand, setIsAddingBrand] = useState(false);
    const [quickBrand, setQuickBrand] = useState({ name: '', code: '' });

    const isBrandInvalid = useMemo(() => {
        return !quickBrand.name.trim() || !quickBrand.code.trim();
    }, [quickBrand]);

    // Quick Add Category State
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [isAddingCategory, setIsAddingCategory] = useState(false);
    const [quickCategory, setQuickCategory] = useState({ name: '', code: '', typeId: '' });

    const isCategoryInvalid = useMemo(() => {
        return !quickCategory.name.trim() || !quickCategory.code.trim() || !quickCategory.typeId;
    }, [quickCategory]);


    const { isDuplicate: isSkuDuplicate, isValidating: isSkuValidating } = 
        useDuplicateValidation('products', 'sku', form.sku, initialData?.id || null);

    const { isInvalid, errors: fieldErrors } = useFormValidation(form, {
        required: ['name', 'sku', 'typeId', 'categoryId', 'salePrice', 'costPrice', 'branchId'],
        patterns: {
            sku: /^[A-Z0-9-_]+$/i
        },
        minMax: {
            salePrice: { min: 0.01 },
            costPrice: { min: 0 },
            initialStock: { min: 0 }
        },
        maxLength: { description: 500 },
        labels: {
            name: 'Product Name',
            sku: 'SKU',
            typeId: 'Product Type',
            categoryId: 'Category',
            salePrice: 'Sale Price',
            costPrice: 'Cost Price',
            branchId: 'Branch',
            initialStock: 'Initial Stock'
        }
    });

    const filteredCategories = useMemo(() => {
        if (!form.typeId) return [];
        return existingCategories.filter(cat => cat.typeId === form.typeId);
    }, [form.typeId, existingCategories]);

    const filteredSubCategories = useMemo(() => {
        if (!form.categoryId) return [];
        return existingSubCategories.filter(subCat => subCat.categoryId === form.categoryId);
    }, [form.categoryId, existingSubCategories]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        
        let newValue: any = value;
        if (type === 'checkbox') {
            newValue = (e.target as HTMLInputElement).checked;
        } else if (type === 'number') {
            newValue = value === '' ? 0 : Number(value);
        }

        setForm(prev => {
            const updated = { ...prev, [name]: newValue };
            if (name === 'typeId') {
                updated.categoryId = '';
                updated.subCategoryId = '';
            } else if (name === 'categoryId') {
                updated.subCategoryId = '';
            }
            return updated;
        });
    };

    const handleAddAttribute = () => {
        setForm(prev => ({
            ...prev,
            attributes: [...prev.attributes, { name: '', value: '' }]
        }));
    };

    const handleAttributeChange = (index: number, field: 'name' | 'value', value: string) => {
        setForm(prev => {
            const updated = [...prev.attributes];
            updated[index] = { ...updated[index], [field]: value };
            return { ...prev, attributes: updated };
        });
    };

    const handleRemoveAttribute = (index: number) => {
        setForm(prev => ({
            ...prev,
            attributes: prev.attributes.filter((_, i) => i !== index)
        }));
    };

    const handleQuickAddCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!onQuickAddCategory || isCategoryInvalid) return;

        setIsAddingCategory(true);
        try {
            const newCategory = await onQuickAddCategory({
                name: quickCategory.name,
                code: quickCategory.code.toUpperCase(),
                typeId: quickCategory.typeId,
                active: true,
            });
            
            // Automatically select the new category
            setForm(prev => ({ ...prev, categoryId: newCategory.id }));
            setIsCategoryModalOpen(false);
            setQuickCategory({ name: '', code: '', typeId: '' });
        } catch (error) {
            console.error('Failed to quick-add category:', error);
        } finally {
            setIsAddingCategory(false);
        }
    };

    const handleQuickAddBrand = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!onQuickAddBrand || isBrandInvalid) return;

        setIsAddingBrand(true);
        try {
            const newBrand = await onQuickAddBrand({
                name: quickBrand.name,
                code: quickBrand.code.toUpperCase(),
            });
            
            // Automatically select the new brand
            setForm(prev => ({ ...prev, brandId: newBrand.id }));
            setIsBrandModalOpen(false);
            setQuickBrand({ name: '', code: '' });
        } catch (error) {
            console.error('Failed to quick-add brand:', error);
        } finally {
            setIsAddingBrand(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isSkuValidating || isSkuDuplicate || isInvalid) return;

        onSubmit({
            ...form,
            status: initialData ? initialData.status : 'In Stock',
            stockByLocation: initialData
                ? initialData.stockByLocation
                : { [form.branchId]: Number(form.initialStock) },
        });
    };

    return (
        <form onSubmit={handleSubmit} noValidate>
            <div className="space-y-6">
                {/* 1. PRODUCT SPECIFICATION SECTION */}
                <section>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-sky-600 mb-4 border-b pb-2 dark:border-gray-700">
                        Step 1: Product Information (Spec)
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormInput
                            label="Product Name"
                            name="name"
                            placeholder="e.g. iPhone 15 Pro"
                            value={form.name}
                            onChange={handleChange}
                            required
                        />
                        <FormSelect
                            label="Brand"
                            name="brandId"
                            value={form.brandId}
                            onChange={handleChange}
                            options={existingBrands.map(b => ({ value: b.id, label: b.name }))}
                            required
                        />
                         <FormSelect
                            label="Product Type"
                            name="typeId"
                            value={form.typeId}
                            onChange={handleChange}
                            options={existingProductTypes.map(t => ({ value: t.id, label: t.name }))}
                            required
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                        <FormSelect
                            label="Category"
                            name="categoryId"
                            value={form.categoryId}
                            onChange={handleChange}
                            options={filteredCategories.map(c => ({ value: c.id, label: c.name }))}
                            disabled={!form.typeId}
                            required
                        />
                        <FormInput
                            label="Model Number"
                            name="model"
                            placeholder="e.g. A3102"
                            value={form.model}
                            onChange={handleChange}
                        />
                        <FormInput
                            label="Display Size"
                            name="displaySize"
                            placeholder="e.g. 6.1 inch"
                            value={form.displaySize}
                            onChange={handleChange}
                        />
                    </div>
                </section>

                {/* 2. PRODUCT VARIANT SECTION */}
                <section>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-sky-600 mb-4 border-b pb-2 dark:border-gray-700">
                        Step 2: Configuration (Variants)
                    </h3>
                    <div className="bg-gray-50 dark:bg-gray-800/40 p-4 rounded-xl border border-gray-200 dark:border-gray-700 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <FormSelect
                                label="Storage"
                                name="storageId"
                                value={form.storageId}
                                onChange={handleChange}
                                options={storages.map(s => ({ value: s.id, label: s.name }))}
                                placeholder="N/A"
                            />
                            <FormSelect
                                label="RAM"
                                name="ramId"
                                value={form.ramId}
                                onChange={handleChange}
                                options={rams.map(r => ({ value: r.id, label: r.name }))}
                                placeholder="N/A"
                            />
                            <FormSelect
                                label="Color"
                                name="colorId"
                                value={form.colorId}
                                onChange={handleChange}
                                options={colors.map(c => ({ value: c.id, label: c.name }))}
                                placeholder="N/A"
                            />
                            <FormSelect
                                label="Condition"
                                name="conditionId"
                                value={form.conditionId}
                                onChange={handleChange}
                                options={conditions.map(c => ({ value: c.id, label: c.name }))}
                                placeholder="e.g. New"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                             <FormInput
                                label="SKU"
                                name="sku"
                                placeholder="Auto-generated if empty"
                                value={form.sku}
                                onChange={handleChange}
                                isValidating={isSkuValidating}
                                isDuplicate={isSkuDuplicate}
                                required
                            />
                            <FormInput
                                label="Cost Price"
                                name="costPrice"
                                type="number"
                                placeholder="0.00"
                                value={form.costPrice}
                                onChange={handleChange}
                                required
                            />
                            <FormInput
                                label="Sale Price"
                                name="salePrice"
                                type="number"
                                placeholder="0.00"
                                value={form.salePrice}
                                onChange={handleChange}
                                required
                            />
                            <FormInput
                                label="Initial Stock"
                                name="initialStock"
                                type="number"
                                value={form.initialStock}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                </section>

                {/* 3. ADDITIONAL DETAILS */}
                <section>
                     <h3 className="text-xs font-bold uppercase tracking-widest text-sky-600 mb-4 border-b pb-2 dark:border-gray-700">
                        Step 3: Branch & Tracking
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormSelect
                            label="Branch"
                            name="branchId"
                            value={form.branchId}
                            onChange={handleChange}
                            options={branches.map(b => ({ value: b.id, label: b.name }))}
                            required
                        />
                        <FormInput
                            label="Image URL"
                            name="imageUrl"
                            type="number"
                            placeholder="https://..."
                            value={form.imageUrl}
                            onChange={handleChange}
                        />
                    </div>
                </section>

                {/* Section 4: Advanced Features */}
                <section>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-sky-600 mb-4 border-b pb-2 dark:border-gray-700">
                        4. Advanced Features
                    </h3>
                    <div className="flex flex-wrap gap-8 items-center bg-gray-50 dark:bg-gray-800/30 p-4 rounded-lg border border-gray-100 dark:border-gray-700">
                    <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                        <input
                            type="checkbox"
                            name="hasSerialNumber"
                            checked={form.hasSerialNumber}
                            onChange={handleChange}
                            className="h-4 w-4 text-sky-600 border-gray-300 rounded focus:ring-sky-500"
                        />
                        <span className="ml-2">Serial Number Tracking</span>
                    </label>
                    <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                        <input
                            type="checkbox"
                            name="hasIMEI"
                            checked={form.hasIMEI}
                            onChange={handleChange}
                            className="h-4 w-4 text-sky-600 border-gray-300 rounded focus:ring-sky-500"
                        />
                        <span className="ml-2">IMEI Tracking</span>
                    </label>
                        <FormInput
                            label="Image URL"
                            name="imageUrl"
                            placeholder="https://..."
                            value={form.imageUrl}
                            onChange={handleChange}
                            className="flex-1 min-w-[200px]"
                        />
                    </div>
                </section>

                {/* Dynamic Attributes */}
                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                            Dynamic Attributes
                        </h3>
                        <button
                            type="button"
                            onClick={handleAddAttribute}
                            className="text-xs bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 px-2 py-1 rounded hover:bg-sky-200 dark:hover:bg-sky-900/50 transition-colors font-medium"
                        >
                            + Add Attribute
                        </button>
                    </div>
                    {/* ... (Attributes loop remains same) */}
                    <div className="space-y-4">
                        {form.attributes.map((attr, index) => (
                            <div key={index} className="flex gap-3 items-start group">
                                <div className="flex-1">
                                    <FormInput
                                        placeholder="Attribute (e.g. Color)"
                                        value={attr.name}
                                        onChange={(e) => handleAttributeChange(index, 'name', e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="flex-1">
                                    <FormInput
                                        placeholder="Value (e.g. Red)"
                                        value={attr.value}
                                        onChange={(e) => handleAttributeChange(index, 'value', e.target.value)}
                                        required
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => handleRemoveAttribute(index)}
                                    className="mt-2.5 text-gray-400 hover:text-red-500 transition-colors"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            </div>
                        ))}
                        {form.attributes.length === 0 && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 italic text-center py-2">
                                No extra attributes defined.
                            </p>
                        )}
                    </div>
                </div>
                <section>
                    <FormInput
                        label="Description"
                        name="description"
                        isTextArea
                        placeholder="Product detailed description..."
                        value={form.description}
                        onChange={handleChange}
                        maxLength={500}
                        className="h-24"
                    />
                </section>
            </div>

            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 mt-6 pt-4 border-t dark:border-gray-700">
                <button
                    type="button"
                    onClick={onCancel}
                    className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-md w-full sm:w-auto"
                >
                    Cancel
                </button>

                <button
                    type="submit"
                    disabled={isSkuValidating || isSkuDuplicate || isInvalid}
                    className="bg-sky-600 text-white px-4 py-2 rounded-md w-full sm:w-auto"
                >
                    {isSkuValidating
                        ? 'Checking...'
                        : 'Save Product'}
                </button>
            </div>

            {/* Quick Add Brand Modal */}
            {isBrandModalOpen && (
                <Modal title="Quick Add Brand" onClose={() => setIsBrandModalOpen(false)}>
                    <form onSubmit={handleQuickAddBrand} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <FormInput
                                label="Brand Name"
                                placeholder="e.g. Apple"
                                value={quickBrand.name}
                                onChange={e => setQuickBrand(prev => ({ ...prev, name: e.target.value }))}
                                required
                            />
                            <FormInput
                                label="Brand Code"
                                placeholder="e.g. APL"
                                value={quickBrand.code}
                                onChange={e => setQuickBrand(prev => ({ ...prev, code: e.target.value }))}
                                required
                            />
                        </div>
                        <div className="flex justify-end gap-3 pt-4">
                            <button
                                type="button"
                                onClick={() => setIsBrandModalOpen(false)}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isBrandInvalid || isAddingBrand}
                                className="px-4 py-2 text-sm font-medium text-white bg-sky-600 rounded-md hover:bg-sky-700 disabled:opacity-50"
                            >
                                {isAddingBrand ? 'Adding...' : 'Add Brand'}
                            </button>
                        </div>
                    </form>
                </Modal>
            )}

            {/* Quick Add Category Modal */}
            {isCategoryModalOpen && (
                <Modal title="Quick Add Category" onClose={() => setIsCategoryModalOpen(false)}>
                    <form onSubmit={handleQuickAddCategory} className="space-y-4">
                        <div className="p-3 bg-sky-50 dark:bg-sky-900/20 rounded-md border border-sky-100 dark:border-sky-800 mb-4">
                            <p className="text-xs text-sky-800 dark:text-sky-300">
                                Adding category for Product Type: <span className="font-bold">{existingProductTypes.find(t => t.id === quickCategory.typeId)?.name}</span>
                            </p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <FormInput
                                label="Category Name"
                                placeholder="e.g. Smartphones"
                                value={quickCategory.name}
                                onChange={e => setQuickCategory(prev => ({ ...prev, name: e.target.value }))}
                                required
                            />
                            <FormInput
                                label="Category Code"
                                placeholder="e.g. PHONES"
                                value={quickCategory.code}
                                onChange={e => setQuickCategory(prev => ({ ...prev, code: e.target.value }))}
                                required
                            />
                        </div>
                        {/* Pre-filtered by the parent form's selection */}
                        <input type="hidden" value={quickCategory.typeId} />
                        
                        <div className="flex justify-end gap-3 pt-4">
                            <button
                                type="button"
                                onClick={() => setIsCategoryModalOpen(false)}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isCategoryInvalid || isAddingCategory}
                                className="px-4 py-2 text-sm font-medium text-white bg-sky-600 rounded-md hover:bg-sky-700 disabled:opacity-50"
                            >
                                {isAddingCategory ? 'Adding...' : 'Add Category'}
                            </button>
                        </div>
                    </form>
                </Modal>
            )}
        </form>
    );
};

export default AddProductForm;