import React, { useMemo, useState } from 'react';
import Placeholder from '../ui/Placeholder';
import { useDuplicateValidation } from './useDuplicateValidation';

interface ExpenseCategoryItem {
    id: string;
    code: string;
    name: string;
    description: string;
    budget: number;
    status: 'Active' | 'Inactive';
}

const initialCategories: ExpenseCategoryItem[] = [
    {
        id: '1',
        code: 'EXP-001',
        name: 'Office Supplies',
        description: 'Office materials and stationery',
        budget: 500,
        status: 'Active',
    },
    {
        id: '2',
        code: 'EXP-002',
        name: 'Utilities',
        description: 'Electricity, water, internet',
        budget: 1200,
        status: 'Active',
    },
    {
        id: '3',
        code: 'EXP-003',
        name: 'Transportation',
        description: 'Fuel and delivery expenses',
        budget: 800,
        status: 'Inactive',
    },
];

const ExpenseCategory: React.FC = () => {
    const [categories, setCategories] =
        useState<ExpenseCategoryItem[]>(
            initialCategories
        );

    const [search, setSearch] = useState('');

    const [editingId, setEditingId] =
        useState<string | null>(null);

    const [form, setForm] = useState({
        code: '',
        name: '',
        description: '',
        budget: '',
    });

    const { isDuplicate, isValidating } = useDuplicateValidation('expense_categories', 'code', form.code, editingId);

    const filteredCategories = useMemo(() => {
        if (!search) return categories;

        const term = search.toLowerCase();

        return categories.filter(
            category =>
                category.code
                    .toLowerCase()
                    .includes(term) ||
                category.name
                    .toLowerCase()
                    .includes(term) ||
                category.description
                    .toLowerCase()
                    .includes(term)
        );
    }, [search, categories]);

    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement
        >
    ) => {
        setForm(prev => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const resetForm = () => {
        setEditingId(null);

        setForm({
            code: '',
            name: '',
            description: '',
            budget: '',
        });
    };

    const handleSubmit = async (
        e: React.FormEvent
    ) => {
        e.preventDefault();

        if (isDuplicate) {
            alert(`Expense category code "${form.code}" already exists.`);
            return;
        }

        if (editingId) {
            setCategories(prev =>
                prev.map(item =>
                    item.id === editingId
                        ? {
                              ...item,
                              code: form.code,
                              name: form.name,
                              description:
                                  form.description,
                              budget: Number(
                                  form.budget
                              ),
                          }
                        : item
                )
            );
        } else {
            const newCategory: ExpenseCategoryItem =
                {
                    id: Date.now().toString(),
                    code: form.code,
                    name: form.name,
                    description:
                        form.description,
                    budget: Number(
                        form.budget
                    ),
                    status: 'Active',
                };

            setCategories(prev => [
                newCategory,
                ...prev,
            ]);
        }

        resetForm();
    };

    const handleEdit = (
        category: ExpenseCategoryItem
    ) => {
        setEditingId(category.id);

        setForm({
            code: category.code,
            name: category.name,
            description: category.description,
            budget: category.budget.toString(),
        });
    };

    const handleDelete = (id: string) => {
        const confirmed = window.confirm(
            'Delete this expense category?'
        );

        if (!confirmed) return;

        setCategories(prev =>
            prev.filter(item => item.id !== id)
        );
    };

    const toggleStatus = (id: string) => {
        setCategories(prev =>
            prev.map(item =>
                item.id === id
                    ? {
                          ...item,
                          status:
                              item.status ===
                              'Active'
                                  ? 'Inactive'
                                  : 'Active',
                      }
                    : item
            )
        );
    };

    const inputClasses =
        'w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500';

    return (
        <Placeholder title="Expense Category Management">

            {/* Search */}
            <div className="mb-6">
                <input
                    type="text"
                    placeholder="Search expense category..."
                    value={search}
                    onChange={e =>
                        setSearch(e.target.value)
                    }
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
                            ? 'Edit Expense Category'
                            : 'Add Expense Category'}
                    </h2>

                    {editingId && (
                        <button
                            type="button"
                            onClick={resetForm}
                            className="text-sm text-red-500 hover:text-red-600"
                        >
                            Cancel Edit
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

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

                    <input
                        type="number"
                        name="budget"
                        placeholder="Monthly Budget"
                        value={form.budget}
                        onChange={handleChange}
                        className={inputClasses}
                        min="0"
                        required
                    />
                </div>

                <div className="mt-4">
                    <textarea
                        name="description"
                        placeholder="Description"
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
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-300">
                                Code
                            </th>

                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-300">
                                Name
                            </th>

                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-300">
                                Description
                            </th>

                            <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-gray-500 dark:text-gray-300">
                                Budget
                            </th>

                            <th className="px-4 py-3 text-center text-xs font-semibold uppercase text-gray-500 dark:text-gray-300">
                                Status
                            </th>

                            <th className="px-4 py-3 text-center text-xs font-semibold uppercase text-gray-500 dark:text-gray-300">
                                Actions
                            </th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">

                        {filteredCategories.length > 0 ? (
                            filteredCategories.map(
                                category => (
                                    <tr
                                        key={
                                            category.id
                                        }
                                        className="hover:bg-gray-50 dark:hover:bg-gray-700"
                                    >
                                        <td className="px-4 py-3 text-sm font-medium text-sky-600 dark:text-sky-400">
                                            {
                                                category.code
                                            }
                                        </td>

                                        <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                                            {
                                                category.name
                                            }
                                        </td>

                                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                                            {
                                                category.description
                                            }
                                        </td>

                                        <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white font-medium">
                                            $
                                            {category.budget.toFixed(
                                                2
                                            )}
                                        </td>

                                        <td className="px-4 py-3 text-center">
                                            <span
                                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                    category.status ===
                                                    'Active'
                                                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                }`}
                                            >
                                                {
                                                    category.status
                                                }
                                            </span>
                                        </td>

                                        <td className="px-4 py-3">
                                            <div className="flex justify-center gap-2">

                                                <button
                                                    onClick={() =>
                                                        handleEdit(
                                                            category
                                                        )
                                                    }
                                                    className="px-3 py-1 text-sm bg-amber-500 hover:bg-amber-600 text-white rounded"
                                                >
                                                    Edit
                                                </button>

                                                <button
                                                    onClick={() =>
                                                        toggleStatus(
                                                            category.id
                                                        )
                                                    }
                                                    className="px-3 py-1 text-sm bg-sky-600 hover:bg-sky-700 text-white rounded"
                                                >
                                                    Toggle
                                                </button>

                                                <button
                                                    onClick={() =>
                                                        handleDelete(
                                                            category.id
                                                        )
                                                    }
                                                    className="px-3 py-1 text-sm bg-red-500 hover:bg-red-600 text-white rounded"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            )
                        ) : (
                            <tr>
                                <td
                                    colSpan={6}
                                    className="text-center py-8 text-gray-500 dark:text-gray-400"
                                >
                                    No expense categories found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </Placeholder>
    );
};

export default ExpenseCategory;