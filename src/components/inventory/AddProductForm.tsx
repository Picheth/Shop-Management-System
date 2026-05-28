import React from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { Branch } from '../../types';
import Modal from '../ui/Modal';
import ConfirmationModal from '../ui/ConfirmationModal';
import Placeholder from '../ui/Placeholder';
import { StatusBadge } from '../ui/StatusBadge';
import { DataProduct } from '../../types';
import ProductDetail from './ProductDetail';

interface ProductFormInputs {
    name: string;
    sku: string;
    category: string;
    price: number;
    status: 'In Stock' | 'Low Stock' | 'Out of Stock';
    imageUrl: string;
    stockByLocation: Record<string, number>;
}

interface AddProductFormProps {
    open: boolean;
    branches: Branch[];
    onClose: () => void;
    onSubmitProduct: (data: ProductFormInputs) => void;
}

const AddProductForm: React.FC<AddProductFormProps> = ({
    open,
    branches,
    onClose,
    onSubmitProduct,
}) => {

    const defaultStock: Record<string, number> = {};

    branches.forEach(branch => {
        defaultStock[branch.id] = 0;
    });

    const form = useForm<ProductFormInputs>({
        defaultValues: {
            name: '',
            sku: '',
            category: '',
            price: 0,
            status: 'In Stock',
            imageUrl: '',
            stockByLocation: defaultStock,
        },
    });

    if (!open) return null;

    const onSubmit: SubmitHandler<ProductFormInputs> = (data) => {

        console.log('Product Data:', data);

        onSubmitProduct(data);

        form.reset();

        onClose();
    };

    return (
        <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6"
        >

            {/* Product Name */}
            <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
                    Product Name
                </label>

                <input
                    type="text"
                    {...form.register('name', {
                        required: 'Product name is required',
                    })}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />

                {form.formState.errors.name && (
                    <p className="mt-1 text-sm text-red-500">
                        {form.formState.errors.name.message}
                    </p>
                )}
            </div>

            {/* SKU */}
            <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
                    SKU
                </label>

                <input
                    type="text"
                    {...form.register('sku', {
                        required: 'SKU is required',
                    })}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
            </div>

            {/* Category */}
            <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
                    Category
                </label>

                <input
                    type="text"
                    {...form.register('category')}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
            </div>

            {/* Price */}
            <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
                    Price
                </label>

                <input
                    type="number"
                    step="0.01"
                    {...form.register('price', {
                        required: 'Price is required',
                        valueAsNumber: true,
                        min: {
                            value: 0,
                            message: 'Price cannot be negative',
                        },
                    })}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />

                {form.formState.errors.price && (
                    <p className="mt-1 text-sm text-red-500">
                        {form.formState.errors.price.message}
                    </p>
                )}
            </div>

            {/* Status */}
            <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
                    Status
                </label>

                <select
                    {...form.register('status')}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                >
                    <option value="In Stock">In Stock</option>
                    <option value="Low Stock">Low Stock</option>
                    <option value="Out of Stock">Out of Stock</option>
                </select>
            </div>

            {/* Image URL */}
            <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
                    Image URL
                </label>

                <input
                    type="text"
                    {...form.register('imageUrl')}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
            </div>

            {/* Stock By Branch */}
            <div>
                <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
                    Stock By Branch
                </h3>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {branches.map(branch => (
                        <div key={branch.id}>
                            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
                                {branch.name}
                            </label>

                            <input
                                type="number"
                                min="0"
                                {...form.register(
                                    `stockByLocation.${branch.id}` as const,
                                    {
                                        valueAsNumber: true,
                                        min: 0,
                                    }
                                )}
                                className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3 pt-4">
                <button
                    type="button"
                    onClick={onClose}
                    className="rounded-md border border-gray-300 px-4 py-2 text-sm hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700"
                >
                    Cancel
                </button>

                <button
                    type="submit"
                    className="rounded-md bg-sky-600 px-4 py-2 text-sm text-white hover:bg-sky-700"
                >
                    Save Product
                </button>
            </div>
        </form>
    );
};

export default AddProductForm;