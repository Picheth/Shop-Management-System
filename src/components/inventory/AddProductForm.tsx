import React, { useEffect, useRef, useCallback } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { DataProduct, Branch } from '../../types';
import { supabase } from '../../utils/supabase';

type AddProductFormData = Omit<
    DataProduct,
    'id'
    | 'createdAt'
    | 'updatedAt'
    | 'active'
    | 'stockByLocation'
    | 'history'
    | 'status'
> & {
    initialStock: number;
    branchId: string;
};

interface AddProductFormProps {
    onAddProduct: (
        product: AddProductFormData & {
            stockByLocation: Record<string, number>;
        }
    ) => void;
    onCancel: () => void;
    existingCategories: string[];
    branches: Branch[];
}

const AddProductForm: React.FC<AddProductFormProps> = ({
    onAddProduct,
    onCancel,
    existingCategories,
    branches,
}) => {
    const {
        register,
        handleSubmit,
        formState: { errors, isValidating: isSubmitting },
        setError,
        clearErrors,
        watch,
        setValue,
    } = useForm<AddProductFormData>({
        defaultValues: {
            name: '',
            sku: '',
            categoryId: '',
            salePrice: 0,
            initialStock: 0,
            branchId: branches[0]?.id || '',
            hasSerialNumber: false,
            hasIMEI: false,
        },
    });

    const [isCheckingSku, setIsCheckingSku] = React.useState(false);

    const currentSku = watch('sku');
    const lastCheckedSkuRef = useRef<string | null>(null);

    const skuCheckPromiseRef = useRef<Promise<boolean> | null>(null);

    const performSkuUniquenessCheck = useCallback(
        async (sku: string): Promise<boolean> => {
            if (skuCheckPromiseRef.current) {
                return skuCheckPromiseRef.current;
            }

            setIsCheckingSku(true);

            const promise = (async () => {
                try {
                    const { data, error } = await supabase
                        .from('products')
                        .select('id')
                        .eq('sku', sku)
                        .maybeSingle();

                    if (error) throw error;

                    if (data) {
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

    const onFormSubmit: SubmitHandler<AddProductFormData> = async (data) => {
        if (isCheckingSku) return;
        
        // Re-verify uniqueness if SKU changed but hasn't been validated yet
        if (data.sku !== lastCheckedSkuRef.current) {
            const isUnique = await performSkuUniquenessCheck(data.sku);
            if (!isUnique) return;
        }

        onAddProduct({
            ...data,
            stockByLocation: {
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
                        {...register('categoryId', { required: 'Please select a category.' })}
                    >
                        <option value="">
                            Select Category
                        </option>

                        {existingCategories.map(category => (
                            <option
                                key={category}
                                value={category}
                            >
                                {category}
                            </option>
                        ))}
                    </select>

                    {errors.categoryId && (
                        <p className={errorClasses}>
                            {errors.categoryId.message}
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