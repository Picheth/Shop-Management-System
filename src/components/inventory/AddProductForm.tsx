import React, { useMemo, useState } from 'react';
import { DataProduct, Branch, ProductType as ProductTypeInterface, Category as CategoryInterface, SubCategory as SubCategoryInterface, Brand as BrandInterface, ProductAttribute } from '../../types';
import { supabase } from '../../utils/supabase';
import FormInput from '../ui/FormInput';
import FormSelect from '../ui/FormSelect';
import { useDuplicateValidation } from '../settings/useDuplicateValidation';
import { useFormValidation } from '../settings/useFormValidation';

type AddProductFormData = {
    name: string;
    sku: string;
    categoryId: string;
    typeId: string;
    subCategoryId: string;
    brandId: string;
    salePrice: number;
    costPrice: number;
    initialStock: number;
    branchId: string;
    hasSerialNumber: boolean;
    hasIMEI: boolean;
    imageUrl: string;
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
}) => {
    const [form, setForm] = useState<AddProductFormData>({
        name: initialData?.name || '',
        sku: initialData?.sku || '',
        categoryId: initialData?.categoryId || '',
        typeId: initialData?.typeId || '',
        subCategoryId: initialData?.subCategoryId || '',
        brandId: initialData?.brandId || '',
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
        attributes: initialData?.attributes || [],
        description: initialData?.description || '',
    });

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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormInput
                    label="Product Name"
                    name="name"
                    placeholder="Enter name"
                    value={form.name}
                    onChange={handleChange}
                    error={fieldErrors.name}
                    required
                />

                <FormInput
                    label="SKU"
                    name="sku"
                    placeholder="e.g. SKU-123"
                    value={form.sku}
                    onChange={handleChange}
                    isValidating={isSkuValidating}
                    isDuplicate={isSkuDuplicate}
                    error={fieldErrors.sku}
                    required
                />

                <FormSelect
                    label="Product Type"
                    name="typeId"
                    value={form.typeId}
                    onChange={handleChange}
                    placeholder="Select Product Type"
                    options={existingProductTypes.map(t => ({ value: t.id, label: t.name }))}
                    error={fieldErrors.typeId}
                    required
                />

                <FormSelect
                    label="Category"
                    name="categoryId"
                    value={form.categoryId}
                    onChange={handleChange}
                    placeholder="Select Category"
                    options={filteredCategories.map(cat => ({ value: cat.id, label: cat.name }))}
                    error={fieldErrors.categoryId}
                    disabled={!form.typeId}
                    required
                />

                <FormSelect
                    label="Sub-Category"
                    name="subCategoryId"
                    value={form.subCategoryId}
                    onChange={handleChange}
                    placeholder="Select Sub-Category"
                    options={filteredSubCategories.map(sc => ({ value: sc.id, label: sc.name }))}
                    disabled={!form.categoryId}
                />

                <FormSelect
                    label="Brand"
                    name="brandId"
                    value={form.brandId}
                    onChange={handleChange}
                    placeholder="Select Brand"
                    options={existingBrands.map(b => ({ value: b.id, label: b.name }))}
                />

                <FormInput
                    label="Cost Price"
                    name="costPrice"
                    tooltip="The actual price paid to the supplier for this item."
                    type="number"
                    placeholder="0.00"
                    value={form.costPrice}
                    onChange={handleChange}
                    error={fieldErrors.costPrice}
                    required
                />

                <FormInput
                    label="Sale Price"
                    name="salePrice"
                    tooltip="The retail price shown to customers."
                    type="number"
                    placeholder="0.00"
                    value={form.salePrice}
                    onChange={handleChange}
                    error={fieldErrors.salePrice}
                    required
                />

                <FormInput
                    label="Initial Stock"
                    name="initialStock"
                    tooltip="The starting inventory level for this product at the specified branch."
                    type="number"
                    value={form.initialStock}
                    onChange={handleChange}
                    error={fieldErrors.initialStock}
                    disabled={!!initialData}
                />

                <FormSelect
                    label="Initial Branch"
                    name="branchId"
                    value={form.branchId}
                    onChange={handleChange}
                    placeholder="Select Branch"
                    options={branches.map(b => ({ value: b.id, label: b.name }))}
                    disabled={!!initialData}
                    error={fieldErrors.branchId}
                    required
                />

                <div className="flex gap-6 items-end py-2">
                    <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                        <input
                            type="checkbox"
                            name="hasSerialNumber"
                            checked={form.hasSerialNumber}
                            onChange={handleChange}
                            className="h-4 w-4 text-sky-600 border-gray-300 rounded focus:ring-sky-500"
                        />
                        <span className="ml-2">Has Serial Number</span>
                    </label>
                    <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                        <input
                            type="checkbox"
                            name="hasIMEI"
                            checked={form.hasIMEI}
                            onChange={handleChange}
                            className="h-4 w-4 text-sky-600 border-gray-300 rounded focus:ring-sky-500"
                        />
                        <span className="ml-2">Has IMEI</span>
                    </label>
                </div>

                <FormInput
                    label="Image URL (Optional)"
                    name="imageUrl"
                    placeholder="https://example.com/image.jpg"
                    value={form.imageUrl}
                    onChange={handleChange}
                />

                {/* Dynamic Attributes */}
                <div className="md:col-span-2 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                            </svg>
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

                    <div className="space-y-4">
                        {form.attributes.map((attr, index) => (
                            <div key={index} className="flex gap-3 items-start group">
                                <div className="flex-1">
                                    <FormInput
                                        placeholder="Attribute Name (e.g. Color)"
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
                                No extra attributes defined. Use attributes for custom fields like "Material", "Version", etc.
                            </p>
                        )}
                    </div>
                </div>

                <div className="md:col-span-2">
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
                </div>
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
        </form>
    );
};

export default AddProductForm;