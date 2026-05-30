import React, { useEffect, useRef, useCallback, useMemo } from 'react';
import { useForm, SubmitHandler, useFieldArray } from 'react-hook-form';
import { DataProduct, Branch, ProductType as ProductTypeInterface, Category as CategoryInterface, SubCategory as SubCategoryInterface, Brand as BrandInterface } from '../../types';
import { supabase } from '../../utils/supabase';

type AddProductFormData = Omit<
    DataProduct,
    'id'
    | 'createdAt'
    | 'updatedAt'
    | 'active' // DataProduct doesn't have active, BaseEntity does. Omit from DataProduct.
    | 'stockByLocation'
    | 'history'
    | 'status'
> & {
    brandId?: string; // Add brandId to form data
    initialStock: number;
    branchId: string;
    status: 'In Stock' | 'Low Stock' | 'Out of Stock'; // Explicitly add status
    imageUrl?: string; // Make imageUrl optional in form data
};

interface AddProductFormProps {
    onSubmit: (
        product: AddProductFormData & {
            stockByLocation: Record<string, number>;
        }
    ) => void;
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
    const {
        register,
        handleSubmit,
        control,
        formState: { errors, isValidating: isSubmitting },
        setError,
        clearErrors,
        watch,
        setValue,
    } = useForm<AddProductFormData>({
        defaultValues: {
            name: initialData?.name || '',
            sku: initialData?.sku || '',
            categoryId: initialData?.categoryId || existingCategories[0]?.id || '',
            typeId: initialData?.typeId || existingProductTypes[0]?.id || '',
            subCategoryId: initialData?.subCategoryId || '',
            brandId: initialData?.brandId || '',
            salePrice: initialData?.salePrice || 0,
            costPrice: initialData?.costPrice || 0,
            initialStock: initialData 
                ? Object.values(initialData.stockByLocation).reduce((sum, qty) => sum + qty, 0) 
                : 0,
            branchId: initialData 
                ? Object.keys(initialData.stockByLocation)[0] || branches[0]?.id || ''
                : branches[0]?.id || '',
            hasSerialNumber: initialData?.hasSerialNumber || false,
            hasIMEI: initialData?.hasIMEI || false,
            status: initialData?.status || 'In Stock',
            imageUrl: initialData?.imageUrl || '',
            attributes: initialData?.attributes || [],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'attributes',
    });

    const [isCheckingSku, setIsCheckingSku] = React.useState(false);

    const currentSku = watch('sku');
    const lastCheckedSkuRef = useRef<string | null>(null);

    const skuCheckPromiseRef = useRef<Promise<boolean> | null>(null);

    const performSkuUniquenessCheck = useCallback(
        async (sku: string): Promise<boolean> => {
            if (skuCheckPromiseRef.current && isCheckingSku) { // Only return existing promise if check is still active
                return skuCheckPromiseRef.current;
            }

            setIsCheckingSku(true);

            const promise = (async () => {
                try {
                    const { data, error } = await supabase // Use supabase from context
                        .from('products')
                        .select('id')
                        .eq('sku', sku)
                        .maybeSingle();

                    if (error) throw error;

                    if (data && (!initialData || data.id !== initialData.id)) {
                        setError('sku', { type: 'manual', message: 'This SKU already exists in the database.' });
                        return false;
                    }

                    clearErrors('sku');
                    lastCheckedSkuRef.current = sku;

                    return true;
                } catch (err) {
                    console.error(err);
                    setError('sku', { type: 'manual', message: 'Failed to check SKU uniqueness.' });
                    return false;
                } finally {
                    setIsCheckingSku(false);
                    skuCheckPromiseRef.current = null;
                }
            })();

            skuCheckPromiseRef.current = promise;

            return promise;
        },
        []
    );

    useEffect(() => {
        const sku = currentSku?.trim();
        const skuRegex = /^[A-Z0-9-_]+$/i;

        if (!sku || !skuRegex.test(sku) || sku === lastCheckedSkuRef.current) return;

        const timeoutId = setTimeout(() => performSkuUniquenessCheck(sku), 500);
        return () => clearTimeout(timeoutId);
    }, [currentSku, performSkuUniquenessCheck, setError, clearErrors]);

    const currentTypeId = watch('typeId');

    const filteredCategories = useMemo(() => {
        if (!currentTypeId) return [];
        return existingCategories.filter(cat => cat.typeId === currentTypeId);
    }, [currentTypeId, existingCategories]);

    const currentCategoryId = watch('categoryId');
    const filteredSubCategories = useMemo(() => {
        if (!currentCategoryId) return [];
        return existingSubCategories.filter(subCat => subCat.categoryId === currentCategoryId);
    }, [currentCategoryId, existingSubCategories]);


    const onFormSubmit: SubmitHandler<AddProductFormData> = async (data) => {
        if (isCheckingSku) return;
        
        // Re-verify uniqueness if SKU changed but hasn't been validated yet
        if (data.sku !== lastCheckedSkuRef.current) {
            const isUnique = await performSkuUniquenessCheck(data.sku);
            if (!isUnique) return;
        }

        onSubmit({
            ...data,
            status: initialData ? initialData.status : 'In Stock',
            stockByLocation: initialData
                ? initialData.stockByLocation
                : {
                      [data.branchId]: data.initialStock,
                  },
        });
    };

    const inputClasses =
        'w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm px-3 py-2 text-sm text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-sky-500';

    const labelClasses =
        'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1';

    const errorClasses = 'text-red-500 text-xs mt-1';

    return (
        <form onSubmit={handleSubmit(onFormSubmit)} noValidate>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label
                        htmlFor="name"
                        className={labelClasses}
                    >
                        Product Name
                    </label>

                    <input
                        type="text"
                        id="name"
                        className={inputClasses}
                        {...register('name', { 
                            required: 'Product name is required.',
                            minLength: { value: 3, message: 'Name must be at least 3 characters.' }
                        })}
                    />

                    {errors.name && (
                        <p className={errorClasses}>
                            {errors.name.message}
                        </p>
                    )}
                </div>

                <div>
                    <label
                        htmlFor="costPrice"
                        className={labelClasses}
                    >
                        Cost Price
                    </label>

                    <input
                        type="number"
                        id="costPrice"
                        className={inputClasses}
                        min="0"
                        step="0.01"
                        {...register('costPrice', { 
                            valueAsNumber: true, 
                            required: 'Cost price is required.' 
                        })}
                    />
                    {errors.costPrice && (
                        <p className={errorClasses}>{errors.costPrice.message}</p>
                    )}
                </div>

                <div>
                    <label
                        htmlFor="sku"
                        className={labelClasses}
                    >
                        SKU
                    </label>

                    <input
                        type="text"
                        id="sku"
                        className={inputClasses}
                        {...register('sku', { 
                            required: 'SKU is required.',
                            pattern: { 
                                value: /^[A-Z0-9-_]+$/i, 
                                message: 'SKU can only contain letters, numbers, hyphens, and underscores.' 
                            }
                        })}
                    />
                    {errors.sku && (
                        <p className={errorClasses}>{errors.sku.message}</p>
                    )}
                </div>

                {/* Product Type */}
                <div>
                    <label htmlFor="typeId" className={labelClasses}>Product Type</label>
                    <select
                        id="typeId"
                        className={inputClasses}
                        {...register('typeId', { 
                            required: 'Please select a product type.',
                            onChange: () => {
                                setValue('categoryId', '');
                                setValue('subCategoryId', '');
                            }
                        })}
                    >
                        <option value="">Select Product Type</option>
                        {existingProductTypes.map(type => (
                            <option key={type.id} value={type.id}>
                                {type.name}
                            </option>
                        ))}
                    </select>
                    {errors.typeId && (
                        <p className={errorClasses}>
                            {errors.typeId.message}
                        </p>
                    )}
                </div>

                <div>
                    <label
                        htmlFor="categoryId"
                        className={labelClasses}
                    >
                        Category
                    </label>

                    <select
                        id="categoryId"
                        className={inputClasses}
                        {...register('categoryId', { 
                            required: 'Please select a category.',
                            onChange: () => setValue('subCategoryId', '')
                        })}
                        disabled={!currentTypeId}
                    >
                        <option value="">
                            Select Category
                        </option>

                        {filteredCategories.map(category => ( // Use category.id for value, category.name for display
                            <option
                                key={category.id}
                                value={category.id}
                            >
                                {category.name}
                            </option>
                        ))}
                    </select>

                    {errors.categoryId && (
                        <p className={errorClasses}>
                            {errors.categoryId.message}
                        </p>
                    )}
                </div>

                {/* Sub-Category */}
                <div>
                    <label htmlFor="subCategoryId" className={labelClasses}>Sub-Category (Optional)</label>
                    <select
                        id="subCategoryId"
                        className={inputClasses}
                        {...register('subCategoryId')}
                        disabled={!currentCategoryId}
                    >
                        <option value="">Select Sub-Category</option>
                        {filteredSubCategories.map(subCat => (
                            <option key={subCat.id} value={subCat.id}>
                                {subCat.name}
                            </option>
                        ))}
                    </select>

                    {errors.categoryId && (
                        <p className={errorClasses}>
                            {errors.categoryId.message}
                        </p>
                    )}
                </div>

                {/* Brand */}
                <div>
                    <label htmlFor="brandId" className={labelClasses}>Brand (Optional)</label>
                    <select
                        id="brandId"
                        className={inputClasses}
                        {...register('brandId')} // brandId is optional
                    >
                        <option value="">Select Brand</option>
                        {existingBrands.map(brand => (
                            <option key={brand.id} value={brand.id}>
                                {brand.name}
                            </option>
                        ))}
                    </select>
                    {errors.brandId && (
                        <p className={errorClasses}>
                            {errors.brandId.message}
                        </p>
                    )}
                </div>


                <div>
                    <label
                        htmlFor="salePrice"
                        className={labelClasses}
                    >
                        Sale Price
                    </label>

                    <input
                        type="number"
                        id="salePrice"
                        className={inputClasses}
                        min="0"
                        step="0.01"
                        {...register('salePrice', { 
                            valueAsNumber: true, 
                            min: { value: 0.01, message: 'Sale price must be at least $0.01.' } 
                        })}
                    />

                    {errors.salePrice && (
                        <p className={errorClasses}>
                            {errors.salePrice.message}
                        </p>
                    )}
                </div>

                <div>
                    <label
                        htmlFor="initialStock"
                        className={labelClasses}
                    >
                        Initial Stock
                    </label>

                    <input
                        type="number"
                        id="initialStock"
                        className={inputClasses}
                        min="0"
                        {...register('initialStock', { 
                            valueAsNumber: true,
                            min: { value: 0, message: 'Initial stock cannot be negative.' }
                        })}
                        disabled={!!initialData}
                    />

                    {errors.initialStock && (
                        <p className={errorClasses}>
                            {errors.initialStock.message}
                        </p>
                    )}
                </div>

                <div>
                    <label
                        htmlFor="branchId"
                        className={labelClasses}
                    >
                        Branch
                    </label>

                    <select
                        id="branchId"
                        className={inputClasses}
                        {...register('branchId', { required: 'Please select a branch.' })}
                        disabled={!!initialData}
                    >
                        <option value="">
                            Select Branch
                        </option>

                        {branches.map(branch => (
                            <option
                                key={branch.id}
                                value={branch.id}
                            >
                                {branch.name}
                            </option>
                        ))}
                    </select>

                    {errors.branchId && (
                        <p className={errorClasses}>
                            {errors.branchId.message}
                        </p>
                    )}
                </div>

                {/* Has Serial Number */}
                <div>
                    <label htmlFor="hasSerialNumber" className={labelClasses}>Has Serial Number</label>
                    <input
                        type="checkbox"
                        id="hasSerialNumber"
                        {...register('hasSerialNumber')}
                        className="ml-2 h-4 w-4 text-sky-600 border-gray-300 rounded focus:ring-sky-500"
                    />
                </div>
                {/* Has IMEI */}
                <div>
                    <label htmlFor="hasIMEI" className={labelClasses}>Has IMEI</label>
                    <input
                        type="checkbox"
                        id="hasIMEI"
                        {...register('hasIMEI')}
                        className="ml-2 h-4 w-4 text-sky-600 border-gray-300 rounded focus:ring-sky-500"
                    />
                </div>
                {/* Image URL */}
                <div className="md:col-span-2">
                    <label htmlFor="imageUrl" className={labelClasses}>Image URL (Optional)</label>
                    <input
                        type="text"
                        id="imageUrl"
                        {...register('imageUrl')}
                        className={inputClasses}
                    />
                </div>

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
                            onClick={() => append({ name: '', value: '' })}
                            className="text-xs bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 px-2 py-1 rounded hover:bg-sky-200 dark:hover:bg-sky-900/50 transition-colors font-medium"
                        >
                            + Add Attribute
                        </button>
                    </div>

                    <div className="space-y-3">
                        {fields.map((field, index) => (
                            <div key={field.id} className="flex gap-3 items-start group">
                                <div className="flex-1">
                                    <input
                                        type="text"
                                        placeholder="Attribute Name (e.g. Color)"
                                        className={inputClasses}
                                        {...register(`attributes.${index}.name` as const, { required: true })}
                                    />
                                </div>
                                <div className="flex-1">
                                    <input
                                        type="text"
                                        placeholder="Value (e.g. Red)"
                                        className={inputClasses}
                                        {...register(`attributes.${index}.value` as const, { required: true })}
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => remove(index)}
                                    className="mt-2 text-gray-400 hover:text-red-500 transition-colors"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            </div>
                        ))}
                        {fields.length === 0 && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 italic text-center py-2">
                                No extra attributes defined. Use attributes for custom fields like "Material", "Version", etc.
                            </p>
                        )}
                    </div>
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
                    disabled={isCheckingSku}
                    className="bg-sky-600 text-white px-4 py-2 rounded-md w-full sm:w-auto"
                >
                    {isCheckingSku
                        ? 'Checking...'
                        : 'Save Product'}
                </button>
            </div>
        </form>
    );
};

export default AddProductForm;