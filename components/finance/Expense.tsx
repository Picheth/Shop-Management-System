import React, { useMemo, useState } from 'react';
import Placeholder from '../ui/Placeholder';

interface ExpenseItem {
    id: string;
    expenseNo: string;
    category: string;
    branch: string;
    description: string;
    amount: number;
    expenseDate: string;
    paymentMethod: 'Cash' | 'Bank' | 'ABA' | 'Card';
    status: 'Paid' | 'Pending';
}

const initialExpenses: ExpenseItem[] = [
    {
        id: '1',
        expenseNo: 'EXP-001',
        category: 'Utilities',
        branch: 'Main Branch',
        description: 'Electricity bill',
        amount: 120,
        expenseDate: '2026-05-20',
        paymentMethod: 'ABA',
        status: 'Paid',
    },
    {
        id: '2',
        expenseNo: 'EXP-002',
        category: 'Office Supplies',
        branch: 'Toul Kork Branch',
        description: 'Printer paper and ink',
        amount: 85,
        expenseDate: '2026-05-21',
        paymentMethod: 'Cash',
        status: 'Pending',
    },
];

const Expense: React.FC = () => {
    const [expenses, setExpenses] =
        useState<ExpenseItem[]>(initialExpenses);

    const [search, setSearch] = useState('');

    const [editingId, setEditingId] =
        useState<string | null>(null);

    const [form, setForm] = useState({
        expenseNo: '',
        category: '',
        branch: '',
        description: '',
        amount: '',
        expenseDate: '',
        paymentMethod: 'Cash' as
            | 'Cash'
            | 'Bank'
            | 'ABA'
            | 'Card',
        status: 'Pending' as
            | 'Paid'
            | 'Pending',
    });

    const filteredExpenses = useMemo(() => {
        if (!search) return expenses;

        const term = search.toLowerCase();

        return expenses.filter(
            expense =>
                expense.expenseNo
                    .toLowerCase()
                    .includes(term) ||
                expense.category
                    .toLowerCase()
                    .includes(term) ||
                expense.branch
                    .toLowerCase()
                    .includes(term) ||
                expense.description
                    .toLowerCase()
                    .includes(term)
        );
    }, [expenses, search]);

    const totalExpense = useMemo(() => {
        return filteredExpenses.reduce(
            (sum, item) => sum + item.amount,
            0
        );
    }, [filteredExpenses]);

    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement |
            HTMLTextAreaElement |
            HTMLSelectElement
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
            expenseNo: '',
            category: '',
            branch: '',
            description: '',
            amount: '',
            expenseDate: '',
            paymentMethod: 'Cash',
            status: 'Pending',
        });
    };

    const handleSubmit = (
        e: React.FormEvent
    ) => {
        e.preventDefault();

        if (editingId) {
            setExpenses(prev =>
                prev.map(item =>
                    item.id === editingId
                        ? {
                              ...item,
                              expenseNo:
                                  form.expenseNo,
                              category:
                                  form.category,
                              branch: form.branch,
                              description:
                                  form.description,
                              amount: Number(
                                  form.amount
                              ),
                              expenseDate:
                                  form.expenseDate,
                              paymentMethod:
                                  form.paymentMethod,
                              status: form.status,
                          }
                        : item
                )
            );
        } else {
            const newExpense: ExpenseItem = {
                id: Date.now().toString(),
                expenseNo: form.expenseNo,
                category: form.category,
                branch: form.branch,
                description: form.description,
                amount: Number(form.amount),
                expenseDate:
                    form.expenseDate,
                paymentMethod:
                    form.paymentMethod,
                status: form.status,
            };

            setExpenses(prev => [
                newExpense,
                ...prev,
            ]);
        }

        resetForm();
    };

    const handleEdit = (
        expense: ExpenseItem
    ) => {
        setEditingId(expense.id);

        setForm({
            expenseNo: expense.expenseNo,
            category: expense.category,
            branch: expense.branch,
            description: expense.description,
            amount: expense.amount.toString(),
            expenseDate:
                expense.expenseDate,
            paymentMethod:
                expense.paymentMethod,
            status: expense.status,
        });
    };

    const handleDelete = (id: string) => {
        const confirmed = window.confirm(
            'Delete this expense?'
        );

        if (!confirmed) return;

        setExpenses(prev =>
            prev.filter(item => item.id !== id)
        );
    };

    const inputClasses =
        'w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500';

    return (
        <Placeholder title="Expense Management">

            {/* Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">

                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Total Expenses
                    </p>

                    <h2 className="text-2xl font-bold text-red-600 mt-2">
                        $
                        {totalExpense.toFixed(
                            2
                        )}
                    </h2>
                </div>

                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Paid
                    </p>

                    <h2 className="text-2xl font-bold text-green-600 mt-2">
                        {
                            expenses.filter(
                                e =>
                                    e.status ===
                                    'Paid'
                            ).length
                        }
                    </h2>
                </div>

                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Pending
                    </p>

                    <h2 className="text-2xl font-bold text-amber-500 mt-2">
                        {
                            expenses.filter(
                                e =>
                                    e.status ===
                                    'Pending'
                            ).length
                        }
                    </h2>
                </div>
            </div>

            {/* Search */}
            <div className="mb-6">
                <input
                    type="text"
                    placeholder="Search expense..."
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
                            ? 'Edit Expense'
                            : 'Add Expense'}
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

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

                    <input
                        type="text"
                        name="expenseNo"
                        placeholder="Expense No"
                        value={form.expenseNo}
                        onChange={handleChange}
                        className={inputClasses}
                        required
                    />

                    <input
                        type="text"
                        name="category"
                        placeholder="Category"
                        value={form.category}
                        onChange={handleChange}
                        className={inputClasses}
                        required
                    />

                    <input
                        type="text"
                        name="branch"
                        placeholder="Branch"
                        value={form.branch}
                        onChange={handleChange}
                        className={inputClasses}
                        required
                    />

                    <input
                        type="number"
                        name="amount"
                        placeholder="Amount"
                        value={form.amount}
                        onChange={handleChange}
                        className={inputClasses}
                        min="0"
                        required
                    />

                    <input
                        type="date"
                        name="expenseDate"
                        value={form.expenseDate}
                        onChange={handleChange}
                        className={inputClasses}
                        required
                    />

                    <select
                        name="paymentMethod"
                        value={form.paymentMethod}
                        onChange={handleChange}
                        className={inputClasses}
                    >
                        <option value="Cash">
                            Cash
                        </option>

                        <option value="Bank">
                            Bank
                        </option>

                        <option value="ABA">
                            ABA
                        </option>

                        <option value="Card">
                            Card
                        </option>
                    </select>

                    <select
                        name="status"
                        value={form.status}
                        onChange={handleChange}
                        className={inputClasses}
                    >
                        <option value="Pending">
                            Pending
                        </option>

                        <option value="Paid">
                            Paid
                        </option>
                    </select>
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
                            ? 'Update Expense'
                            : 'Add Expense'}
                    </button>
                </div>
            </form>

            {/* Table */}
            <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
                <table className="min-w-full bg-white dark:bg-gray-800">

                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-300">
                                Expense No
                            </th>

                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-300">
                                Category
                            </th>

                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-300">
                                Branch
                            </th>

                            <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-gray-500 dark:text-gray-300">
                                Amount
                            </th>

                            <th className="px-4 py-3 text-center text-xs font-semibold uppercase text-gray-500 dark:text-gray-300">
                                Payment
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

                        {filteredExpenses.length > 0 ? (
                            filteredExpenses.map(
                                expense => (
                                    <tr
                                        key={
                                            expense.id
                                        }
                                        className="hover:bg-gray-50 dark:hover:bg-gray-700"
                                    >
                                        <td className="px-4 py-3">
                                            <div className="text-sm font-medium text-sky-600 dark:text-sky-400">
                                                {
                                                    expense.expenseNo
                                                }
                                            </div>

                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                                {
                                                    expense.expenseDate
                                                }
                                            </div>
                                        </td>

                                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                                            {
                                                expense.category
                                            }
                                        </td>

                                        <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                                            {
                                                expense.branch
                                            }
                                        </td>

                                        <td className="px-4 py-3 text-right text-sm font-semibold text-red-600">
                                            $
                                            {expense.amount.toFixed(
                                                2
                                            )}
                                        </td>

                                        <td className="px-4 py-3 text-center">
                                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400">
                                                {
                                                    expense.paymentMethod
                                                }
                                            </span>
                                        </td>

                                        <td className="px-4 py-3 text-center">
                                            <span
                                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                    expense.status ===
                                                    'Paid'
                                                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                        : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                                }`}
                                            >
                                                {
                                                    expense.status
                                                }
                                            </span>
                                        </td>

                                        <td className="px-4 py-3">
                                            <div className="flex justify-center gap-2">

                                                <button
                                                    onClick={() =>
                                                        handleEdit(
                                                            expense
                                                        )
                                                    }
                                                    className="px-3 py-1 text-sm bg-amber-500 hover:bg-amber-600 text-white rounded"
                                                >
                                                    Edit
                                                </button>

                                                <button
                                                    onClick={() =>
                                                        handleDelete(
                                                            expense.id
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
                                    colSpan={7}
                                    className="text-center py-8 text-gray-500 dark:text-gray-400"
                                >
                                    No expenses found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </Placeholder>
    );
};

export default Expense;