import React, { useMemo, useState } from 'react';

import Placeholder from '../ui/Placeholder';

import {
    Category as CategoryInterface,
    SubCategory as SubCategoryInterface,
} from '../../types';

interface SubCategoryProps {

    subCategories: SubCategoryInterface[];

    onAdd: (
        newSubCategory: Omit<
            SubCategoryInterface,
            'id' | 'createdAt' | 'updatedAt'
        >
    ) => Promise<void>;

    onUpdate: (
        updatedSubCategory: SubCategoryInterface
    ) => Promise<void>;

    onDelete: (
        id: string
    ) => Promise<void>;

    categories: CategoryInterface[];
}

const SubCategory: React.FC<SubCategoryProps> = ({
    subCategories,
    onAdd,
    onUpdate,
    onDelete,
    categories,
}) => {

    const [search, setSearch] = useState('');

    const [editingId, setEditingId] =
        useState<string | null>(null);

    const [categoryFilter, setCategoryFilter] =
        useState('all');

    const [form, setForm] = useState({
        code: '',
        name: '',
        description: '',
        categoryId: categories[0]?.id || '',
        active: true,
    });

    const filteredSubCategories = useMemo(() => {

        let filtered = subCategories;

        if (categoryFilter !== 'all') {

            filtered = filtered.filter(
                subCat => subCat.categoryId === categoryFilter
            );
        }

        if (search) {

            const term = search.toLowerCase();

            filtered = filtered.filter(subCat =>
                subCat.code.toLowerCase().includes(term) ||
                subCat.name.toLowerCase().includes(term) ||
                (subCat.description || '')
                    .toLowerCase()
                    .includes(term)
            );
        }

        return filtered;

    }, [
        search,
        subCategories,
        categoryFilter,
    ]);

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
            categoryId: categories[0]?.id || '',
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
                'Failed to save sub-category:',
                error
            );
        }
    };

    const handleEdit = (
        subCat: SubCategoryInterface
    ) => {

        setEditingId(subCat.id);

        setForm({
            code: subCat.code,
            name: subCat.name,
            description: subCat.description || '',
            categoryId: subCat.categoryId,
            active: subCat.active,
        });
    };

    const handleDelete = async (
        id: string
    ) => {

        const confirmed = window.confirm(
            'Delete this sub-category?'
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
        subCat: SubCategoryInterface
    ) => {

        try {

            await onUpdate({
                ...subCat,
                active: !subCat.active,
                updatedAt: new Date().toISOString(),
            });

        } catch (error) {

            console.error(
                'Status update failed:',
                error
            );
        }
    };

    const getCategoryName = (
        categoryId: string
    ) => {

        return (
            categories.find(
                c => c.id === categoryId
            )?.name || 'N/A'
        );
    };

    const inputClasses =
        'w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500';

    return (

        <Placeholder title="Sub-Category Management">

            {/* Search + Filter */}
            <div className="mb-6 flex flex-col sm:flex-row gap-4">

                <input
                    type="text"
                    placeholder="Search sub-categories..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className={`${inputClasses} flex-1`}
                />

                <select
                    value={categoryFilter}
                    onChange={e => setCategoryFilter(e.target.value)}
                    className={`${inputClasses} sm:w-auto`}
                >

                    <option value="all">
                        All Categories
                    </option>

                    {categories.map(cat => (

                        <option
                            key={cat.id}
                            value={cat.id}
                        >
                            {cat.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Form */}
            <form
                onSubmit={handleSubmit}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 mb-6"
            >

                <div className="flex items-center justify-between mb-4">

                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">

                        {editingId
                            ? 'Edit Sub-Category'
                            : 'Add New Sub-Category'}
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
                        placeholder="Sub-Category Code"
                        value={form.code}
                        onChange={handleChange}
                        className={inputClasses}
                        required
                    />

                    <input
                        type="text"
                        name="name"
                        placeholder="Sub-Category Name"
                        value={form.name}
                        onChange={handleChange}
                        className={inputClasses}
                        required
                    />

                    <select
                        name="categoryId"
                        value={form.categoryId}
                        onChange={handleChange}
                        className={inputClasses}
                        required
                    >

                        <option value="">
                            Select Parent Category
                        </option>

                        {categories.map(cat => (

                            <option
                                key={cat.id}
                                value={cat.id}
                            >
                                {cat.name}
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
                            ? 'Update Sub-Category'
                            : 'Add Sub-Category'}
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
                                Parent Category
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

                        {filteredSubCategories.length > 0 ? (

                            filteredSubCategories.map(subCat => (

                                <tr
                                    key={subCat.id}
                                    className="hover:bg-gray-50 dark:hover:bg-gray-700"
                                >

                                    <td className="px-4 py-3 text-sm font-medium text-sky-600">
                                        {subCat.code}
                                    </td>

                                    <td className="px-4 py-3 text-sm">
                                        {subCat.name}
                                    </td>

                                    <td className="px-4 py-3 text-sm">
                                        {getCategoryName(subCat.categoryId)}
                                    </td>

                                    <td className="px-4 py-3 text-center">

                                        <span
                                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                subCat.active
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-red-100 text-red-700'
                                            }`}
                                        >
                                            {subCat.active
                                                ? 'Active'
                                                : 'Inactive'}
                                        </span>
                                    </td>

                                    <td className="px-4 py-3 text-center">

                                        <div className="flex justify-center gap-2">

                                            <button
                                                onClick={() => handleEdit(subCat)}
                                                className="px-3 py-1 text-sm bg-amber-500 hover:bg-amber-600 text-white rounded"
                                            >
                                                Edit
                                            </button>

                                            <button
                                                onClick={() => toggleStatus(subCat)}
                                                className="px-3 py-1 text-sm bg-sky-600 hover:bg-sky-700 text-white rounded"
                                            >
                                                Toggle
                                            </button>

                                            <button
                                                onClick={() => handleDelete(subCat.id)}
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
                                    No sub-categories found.
                                </td>
                            </tr>
                        )}

                    </tbody>
                </table>
            </div>

        </Placeholder>
    );
};

export default SubCategory;