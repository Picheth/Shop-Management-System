import React, { useMemo, useState } from 'react';
import Placeholder from '../ui/Placeholder';

import {
    Category as CategoryInterface,
    ProductType,
} from '../../types';

interface CategoryProps {
    categories: CategoryInterface[];

    onAdd: (
        newCategory: Omit<
            CategoryInterface,
            'id' | 'createdAt' | 'updatedAt'
        >
    ) => Promise<void>;

    onUpdate: (
        updatedCategory: CategoryInterface
    ) => Promise<void>;

    onDelete: (
        id: string
    ) => Promise<void>;

    productTypes: ProductType[];
}

const Category: React.FC<CategoryProps> = ({
    categories,
    onAdd,
    onUpdate,
    onDelete,
    productTypes,
}) => {

    const [search, setSearch] = useState('');

    const [editingId, setEditingId] =
        useState<string | null>(null);

    const [form, setForm] = useState({
        code: '',
        name: '',
        description: '',
        typeId: productTypes[0]?.id || '',
        active: true,
    });

    const filteredCategories = useMemo(() => {

        if (!search) return categories;

        const term = search.toLowerCase();

        return categories.filter(cat =>
            cat.code.toLowerCase().includes(term) ||
            cat.name.toLowerCase().includes(term) ||
            (cat.description || '')
                .toLowerCase()
                .includes(term)
        );

    }, [search, categories]);

    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement |
            HTMLTextAreaElement |
            HTMLSelectElement
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
            typeId: productTypes[0]?.id || '',
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

            console.error(
                'Failed to save category:',
                error
            );
        }
    };

    const handleEdit = (
        cat: CategoryInterface
    ) => {

        setEditingId(cat.id);

        setForm({
            code: cat.code,
            name: cat.name,
            description: cat.description || '',
            typeId: cat.typeId,
            active: cat.active,
        });
    };

    const handleDelete = async (
        id: string
    ) => {

        const confirmed = window.confirm(
            'Delete this category?'
        );

        if (!confirmed) return;

        try {

            await onDelete(id);

        } catch (error) {

            console.error(
                'Delete failed:',
                error
            );
        }
    };

    const toggleStatus = async (
        cat: CategoryInterface
    ) => {

        try {

            await onUpdate({
                ...cat,
                active: !cat.active,
                updatedAt: new Date().toISOString(),
            });

        } catch (error) {

            console.error(
                'Status update failed:',
                error
            );
        }
    };

    const getTypeName = (
        typeId: string
    ) => {

        return (
            productTypes.find(
                t => t.id === typeId
            )?.name || 'N/A'
        );
    };

    const inputClasses =
        'w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500';

    return (

        <Placeholder title="Category Management">

            {/* Search */}
            <div className="mb-6">

                <input
                    type="text"
                    placeholder="Search categories..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className={inputClasses}
                />
            </div>

            {/* Form */}
            <form
                onSubmit={handleSubmit}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 mb-6"
            >

                <div className="flex items-center justify-between mb-4">

                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">

                        {editingId
                            ? 'Edit Category'
                            : 'Add New Category'}
                    </h2>

                    {editingId && (

                        <button
                            type="button"
                            onClick={resetForm}
                            className="text-sm text-red-500 hover:text-red-600"
                        >
                            Cancel
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                    <input
                        type="text"
                        name="code"
                        placeholder="Category Code"
                        value={form.code}
                        onChange={handleChange}
                        className={inputClasses}
                        required
                    />

                    <input
                        type="text"
                        name="name"
                        placeholder="Category Name"
                        value={form.name}
                        onChange={handleChange}
                        className={inputClasses}
                        required
                    />

                    <select
                        name="typeId"
                        value={form.typeId}
                        onChange={handleChange}
                        className={inputClasses}
                        required
                    >

                        <option value="">
                            Select Product Type
                        </option>

                        {productTypes.map(type => (

                            <option
                                key={type.id}
                                value={type.id}
                            >
                                {type.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="mt-4">

                    <textarea
                        name="description"
                        placeholder="Description (Optional)"
                        value={form.description}
                        onChange={handleChange}
                        className={`${inputClasses} h-24`}
                    />
                </div>

                <div className="flex justify-end mt-4">

                    <button
                        type="submit"
                        className="bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-md"
                    >
                        {editingId
                            ? 'Update Category'
                            : 'Add Category'}
                    </button>
                </div>
            </form>

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
                                Product Type
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

                        {filteredCategories.length > 0 ? (

                            filteredCategories.map(cat => (

                                <tr
                                    key={cat.id}
                                    className="hover:bg-gray-50 dark:hover:bg-gray-700"
                                >

                                    <td className="px-4 py-3 text-sm font-medium text-sky-600">
                                        {cat.code}
                                    </td>

                                    <td className="px-4 py-3 text-sm">
                                        {cat.name}
                                    </td>

                                    <td className="px-4 py-3 text-sm">
                                        {getTypeName(cat.typeId)}
                                    </td>

                                    <td className="px-4 py-3 text-center">

                                        <span
                                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                cat.active
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-red-100 text-red-700'
                                            }`}
                                        >
                                            {cat.active
                                                ? 'Active'
                                                : 'Inactive'}
                                        </span>
                                    </td>

                                    <td className="px-4 py-3 text-center">

                                        <div className="flex justify-center gap-2">

                                            <button
                                                onClick={() => handleEdit(cat)}
                                                className="px-3 py-1 text-sm bg-amber-500 hover:bg-amber-600 text-white rounded"
                                            >
                                                Edit
                                            </button>

                                            <button
                                                onClick={() => toggleStatus(cat)}
                                                className="px-3 py-1 text-sm bg-sky-600 hover:bg-sky-700 text-white rounded"
                                            >
                                                Toggle
                                            </button>

                                            <button
                                                onClick={() => handleDelete(cat.id)}
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
                                    No categories found.
                                </td>
                            </tr>
                        )}

                    </tbody>
                </table>
            </div>

        </Placeholder>
    );
};

export default Category;