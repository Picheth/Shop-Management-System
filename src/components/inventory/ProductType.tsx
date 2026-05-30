import React, { useMemo, useState } from 'react';
import Placeholder from '../ui/Placeholder';
import SettingsForm from '../ui/SettingsForm';
import FormInput from '../ui/FormInput';
import { useDuplicateValidation } from '../settings/useDuplicateValidation';
import { useFormValidation } from '../settings/useFormValidation';
import { ProductType as ProductTypeInterface } from '../../types';

interface ProductTypeProps {
    productTypes: ProductTypeInterface[];

    onAdd: (
        newType: Omit<ProductTypeInterface, 'id' | 'createdAt' | 'updatedAt'>
    ) => Promise<void>;

    onUpdate: (
        updatedType: ProductTypeInterface
    ) => Promise<void>;

    onDelete: (
        id: string
    ) => Promise<void>;
}

const ProductType: React.FC<ProductTypeProps> = ({
    productTypes,
    onAdd,
    onUpdate,
    onDelete,
}) => {

    const [search, setSearch] = useState('');

    const [editingId, setEditingId] = useState<string | null>(null);

    const [form, setForm] = useState({
        code: '',
        name: '',
        description: '',
        active: true,
    });

    const { isDuplicate, isValidating } = useDuplicateValidation('product_types', 'code', form.code, editingId);

    const { isInvalid, errors: fieldErrors } = useFormValidation(form, {
        required: ['code', 'name'],
        labels: {
            code: 'Type Code',
            name: 'Type Name'
        }
    });

    const filteredProductTypes = useMemo(() => {

        if (!search) return productTypes;

        const term = search.toLowerCase();

        return productTypes.filter(type =>
            type.code.toLowerCase().includes(term) || // Correctly use type.code
            type.name.toLowerCase().includes(term) ||
            (type.description || '')
                .toLowerCase()
                .includes(term)
        );

    }, [search, productTypes]);

    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >
    ) => {

        const { name, value } = e.target;

        setForm(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const resetForm = () => {

        setEditingId(null);

        setForm({
            code: '',
            name: '',
            description: '',
            active: true,
        });
    };

    const handleSubmit = async (
        e: React.FormEvent
    ) => {

        e.preventDefault();

        try {

            if (editingId) {

                await onUpdate({
                    id: editingId,
                    ...form,
                    createdAt: '',
                    updatedAt: new Date().toISOString(),
                });

            } else {

                await onAdd({
                    ...form,
                });
            }

            resetForm();

        } catch (error) {

            console.error('Failed to save product type:', error);
        }
    };

    const handleEdit = (
        type: ProductTypeInterface
    ) => {

        setEditingId(type.id);

        setForm({
            code: type.code,
            name: type.name,
            description: type.description || '',
            active: type.active,
        });
    };

    const handleDelete = async (
        id: string
    ) => {

        const confirmed = window.confirm(
            'Delete this product type?'
        );

        if (!confirmed) return;

        try {

            await onDelete(id);

        } catch (error) {

            console.error('Delete failed:', error);
        }
    };

    const toggleStatus = async (
        type: ProductTypeInterface
    ) => {

        try {

            await onUpdate({
                ...type,
                active: !type.active,
                updatedAt: new Date().toISOString(),
            });

        } catch (error) {

            console.error('Status update failed:', error);
        }
    };

    const inputClasses =
        'w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500';

    return (
        <Placeholder title="Product Type Management">

            {/* Search */}
            <div className="mb-6">
                <input
                    type="text"
                    placeholder="Search product types..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className={inputClasses}
                />
            </div>

            {/* Form */}
            <SettingsForm
                title={editingId ? 'Edit Product Type' : 'Add New Product Type'}
                isEditing={!!editingId}
                onCancel={resetForm}
                onSubmit={handleSubmit}
                isValidating={isValidating}
                isDuplicate={isDuplicate}
                isDisabled={isInvalid}
                submitLabel={editingId ? 'Update Type' : 'Add Type'}
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormInput
                        label="Type Code"
                        name="code"
                        placeholder="e.g. DEV"
                        value={form.code}
                        onChange={handleChange}
                        isValidating={isValidating}
                        isDuplicate={isDuplicate}
                        error={fieldErrors.code}
                        required
                    />

                    <FormInput
                        label="Type Name"
                        name="name"
                        placeholder="e.g. Device"
                        value={form.name}
                        onChange={handleChange}
                        error={fieldErrors.name}
                        required
                    />
                </div>

                <div className="mt-4">
                    <FormInput
                        label="Description"
                        isTextArea
                        name="description"
                        placeholder="Enter description..."
                        value={form.description}
                        onChange={handleChange}
                        className="h-24"
                    />
                </div>
            </SettingsForm>

            {/* Table */}
            <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">

                <table className="min-w-full bg-white dark:bg-gray-800">

                    <thead className="bg-gray-50 dark:bg-gray-700">

                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase">
                                Code
                            </th>

                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase">
                                Name
                            </th>

                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase">
                                Description
                            </th>

                            <th className="px-4 py-3 text-center text-xs font-semibold uppercase">
                                Status
                            </th>

                            <th className="px-4 py-3 text-center text-xs font-semibold uppercase">
                                Actions
                            </th>
                        </tr>

                    </thead>

                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">

                        {filteredProductTypes.length > 0 ? (

                            filteredProductTypes.map(type => (

                                <tr
                                    key={type.id}
                                    className="hover:bg-gray-50 dark:hover:bg-gray-700"
                                >

                                    <td className="px-4 py-3 text-sm font-medium text-sky-600">
                                        {type.code}
                                    </td>

                                    <td className="px-4 py-3 text-sm">
                                        {type.name}
                                    </td>

                                    <td className="px-4 py-3 text-sm">
                                        {type.description || 'N/A'}
                                    </td>

                                    <td className="px-4 py-3 text-center">

                                        <span
                                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                type.active
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-red-100 text-red-700'
                                            }`}
                                        >
                                            {type.active
                                                ? 'Active'
                                                : 'Inactive'}
                                        </span>
                                    </td>

                                    <td className="px-4 py-3 text-center">

                                        <div className="flex justify-center gap-2">

                                            <button
                                                onClick={() => handleEdit(type)}
                                                className="px-3 py-1 text-sm bg-amber-500 hover:bg-amber-600 text-white rounded"
                                            >
                                                Edit
                                            </button>

                                            <button
                                                onClick={() => toggleStatus(type)}
                                                className="px-3 py-1 text-sm bg-sky-600 hover:bg-sky-700 text-white rounded"
                                            >
                                                Toggle
                                            </button>

                                            <button
                                                onClick={() => handleDelete(type.id)}
                                                className="px-3 py-1 text-sm bg-red-500 hover:bg-red-600 text-white rounded"
                                            >
                                                Delete
                                            </button>

                                        </div>
                                    </td>

                                </tr>
                            ))

                        ) : (

                            <tr>
                                <td
                                    colSpan={5}
                                    className="text-center py-8 text-gray-500"
                                >
                                    No product types found.
                                </td>
                            </tr>
                        )}

                    </tbody>
                </table>
            </div>

        </Placeholder>
    );
};

export default ProductType;