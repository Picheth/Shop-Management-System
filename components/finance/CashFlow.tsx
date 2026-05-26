import React, { useMemo, useState } from 'react';
import Placeholder from '../ui/Placeholder';

interface CashFlowItem {
    id: string;
    type: 'Income' | 'Expense';
    category: string;
    referenceNo: string;
    branch: string;
    description: string;
    amount: number;
    date: string;
    paymentMethod: 'Cash' | 'ABA' | 'Bank' | 'Card';
}

const initialCashFlows: CashFlowItem[] = [
    {
        id: '1',
        type: 'Income',
        category: 'Sales',
        referenceNo: 'SAL-1001',
        branch: 'Main Branch',
        description: 'Phone sales income',
        amount: 1500,
        date: '2026-05-20',
        paymentMethod: 'ABA',
    },
    {
        id: '2',
        type: 'Expense',
        category: 'Utilities',
        referenceNo: 'EXP-1001',
        branch: 'Main Branch',
        description: 'Electricity payment',
        amount: 220,
        date: '2026-05-21',
        paymentMethod: 'Cash',
    },
    {
        id: '3',
        type: 'Income',
        category: 'Repair Service',
        referenceNo: 'REP-2001',
        branch: 'TK Branch',
        description: 'Repair service income',
        amount: 120,
        date: '2026-05-22',
        paymentMethod: 'Cash',
    },
];

const CashFlow: React.FC = () => {
    const [cashFlows, setCashFlows] =
        useState<CashFlowItem[]>(
            initialCashFlows
        );

    const [search, setSearch] =
        useState('');

    const [filterType, setFilterType] =
        useState<
            'All' | 'Income' | 'Expense'
        >('All');

    const [editingId, setEditingId] =
        useState<string | null>(null);

    const [form, setForm] = useState({
        type: 'Income' as
            | 'Income'
            | 'Expense',
        category: '',
        referenceNo: '',
        branch: '',
        description: '',
        amount: '',
        date: '',
        paymentMethod: 'Cash' as
            | 'Cash'
            | 'ABA'
            | 'Bank'
            | 'Card',
    });

    const filteredCashFlows =
        useMemo(() => {
            let filtered = cashFlows;

            if (filterType !== 'All') {
                filtered =
                    filtered.filter(
                        item =>
                            item.type ===
                            filterType
                    );
            }

            if (search) {
                const term =
                    search.toLowerCase();

                filtered =
                    filtered.filter(
                        item =>
                            item.referenceNo
                                .toLowerCase()
                                .includes(
                                    term
                                ) ||
                            item.category
                                .toLowerCase()
                                .includes(
                                    term
                                ) ||
                            item.branch
                                .toLowerCase()
                                .includes(
                                    term
                                ) ||
                            item.description
                                .toLowerCase()
                                .includes(
                                    term
                                )
                    );
            }

            return filtered;
        }, [
            cashFlows,
            search,
            filterType,
        ]);

    const totalIncome =
        useMemo(() => {
            return cashFlows
                .filter(
                    item =>
                        item.type ===
                        'Income'
                )
                .reduce(
                    (sum, item) =>
                        sum + item.amount,
                    0
                );
        }, [cashFlows]);

    const totalExpense =
        useMemo(() => {
            return cashFlows
                .filter(
                    item =>
                        item.type ===
                        'Expense'
                )
                .reduce(
                    (sum, item) =>
                        sum + item.amount,
                    0
                );
        }, [cashFlows]);

    const netCashFlow =
        totalIncome - totalExpense;

    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement |
            HTMLTextAreaElement |
            HTMLSelectElement
        >
    ) => {
        setForm(prev => ({
            ...prev,
            [e.target.name]:
                e.target.value,
        }));
    };

    const resetForm = () => {
        setEditingId(null);

        setForm({
            type: 'Income',
            category: '',
            referenceNo: '',
            branch: '',
            description: '',
            amount: '',
            date: '',
            paymentMethod: 'Cash',
        });
    };

    const handleSubmit = (
        e: React.FormEvent
    ) => {
        e.preventDefault();

        if (editingId) {
            setCashFlows(prev =>
                prev.map(item =>
                    item.id === editingId
                        ? {
                              ...item,
                              type: form.type,
                              category:
                                  form.category,
                              referenceNo:
                                  form.referenceNo,
                              branch:
                                  form.branch,
                              description:
                                  form.description,
                              amount:
                                  Number(
                                      form.amount
                                  ),
                              date: form.date,
                              paymentMethod:
                                  form.paymentMethod,
                          }
                        : item
                )
            );
        } else {
            const newItem: CashFlowItem =
                {
                    id: Date.now().toString(),
                    type: form.type,
                    category:
                        form.category,
                    referenceNo:
                        form.referenceNo,
                    branch:
                        form.branch,
                    description:
                        form.description,
                    amount: Number(
                        form.amount
                    ),
                    date: form.date,
                    paymentMethod:
                        form.paymentMethod,
                };

            setCashFlows(prev => [
                newItem,
                ...prev,
            ]);
        }

        resetForm();
    };

    const handleEdit = (
        item: CashFlowItem
    ) => {
        setEditingId(item.id);

        setForm({
            type: item.type,
            category:
                item.category,
            referenceNo:
                item.referenceNo,
            branch: item.branch,
            description:
                item.description,
            amount:
                item.amount.toString(),
            date: item.date,
            paymentMethod:
                item.paymentMethod,
        });
    };

    const handleDelete = (
        id: string
    ) => {
        const confirmed =
            window.confirm(
                'Delete this cash flow record?'
            );

        if (!confirmed) return;

        setCashFlows(prev =>
            prev.filter(
                item => item.id !== id
            )
        );
    };

    const inputClasses =
        'w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500';

    return (
        <Placeholder title="Cash Flow">

            {/* Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">

                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Total Income
                    </p>

                    <h2 className="text-2xl font-bold text-green-600 mt-2">
                        $
                        {totalIncome.toFixed(
                            2
                        )}
                    </h2>
                </div>

                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Total Expense
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
                        Net Cash Flow
                    </p>

                    <h2
                        className={`text-2xl font-bold mt-2 ${
                            netCashFlow >= 0
                                ? 'text-sky-600'
                                : 'text-red-600'
                        }`}
                    >
                        $
                        {netCashFlow.toFixed(
                            2
                        )}
                    </h2>
                </div>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">

                <input
                    type="text"
                    placeholder="Search cash flow..."
                    value={search}
                    onChange={e =>
                        setSearch(
                            e.target.value
                        )
                    }
                    className={
                        inputClasses
                    }
                />

                <select
                    value={filterType}
                    onChange={e =>
                        setFilterType(
                            e.target
                                .value as
                                | 'All'
                                | 'Income'
                                | 'Expense'
                        )
                    }
                    className={
                        inputClasses
                    }
                >
                    <option value="All">
                        All Types
                    </option>

                    <option value="Income">
                        Income
                    </option>

                    <option value="Expense">
                        Expense
                    </option>
                </select>
            </div>

            {/* Form */}
            <form
                onSubmit={
                    handleSubmit
                }
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 mb-6"
            >
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {editingId
                            ? 'Edit Cash Flow'
                            : 'Add Cash Flow'}
                    </h2>

                    {editingId && (
                        <button
                            type="button"
                            onClick={
                                resetForm
                            }
                            className="text-sm text-red-500 hover:text-red-600"
                        >
                            Cancel Edit
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

                    <select
                        name="type"
                        value={
                            form.type
                        }
                        onChange={
                            handleChange
                        }
                        className={
                            inputClasses
                        }
                    >
                        <option value="Income">
                            Income
                        </option>

                        <option value="Expense">
                            Expense
                        </option>
                    </select>

                    <input
                        type="text"
                        name="category"
                        placeholder="Category"
                        value={
                            form.category
                        }
                        onChange={
                            handleChange
                        }
                        className={
                            inputClasses
                        }
                        required
                    />

                    <input
                        type="text"
                        name="referenceNo"
                        placeholder="Reference No"
                        value={
                            form.referenceNo
                        }
                        onChange={
                            handleChange
                        }
                        className={
                            inputClasses
                        }
                        required
                    />

                    <input
                        type="text"
                        name="branch"
                        placeholder="Branch"
                        value={
                            form.branch
                        }
                        onChange={
                            handleChange
                        }
                        className={
                            inputClasses
                        }
                        required
                    />

                    <input
                        type="number"
                        name="amount"
                        placeholder="Amount"
                        value={
                            form.amount
                        }
                        onChange={
                            handleChange
                        }
                        className={
                            inputClasses
                        }
                        min="0"
                        required
                    />

                    <input
                        type="date"
                        name="date"
                        value={
                            form.date
                        }
                        onChange={
                            handleChange
                        }
                        className={
                            inputClasses
                        }
                        required
                    />

                    <select
                        name="paymentMethod"
                        value={
                            form.paymentMethod
                        }
                        onChange={
                            handleChange
                        }
                        className={
                            inputClasses
                        }
                    >
                        <option value="Cash">
                            Cash
                        </option>

                        <option value="ABA">
                            ABA
                        </option>

                        <option value="Bank">
                            Bank
                        </option>

                        <option value="Card">
                            Card
                        </option>
                    </select>
                </div>

                <div className="mt-4">
                    <textarea
                        name="description"
                        placeholder="Description"
                        value={
                            form.description
                        }
                        onChange={
                            handleChange
                        }
                        className={`${inputClasses} h-24`}
                    />
                </div>

                <div className="flex justify-end mt-4">
                    <button
                        type="submit"
                        className="bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-md"
                    >
                        {editingId
                            ? 'Update Record'
                            : 'Add Record'}
                    </button>
                </div>
            </form>

            {/* Table */}
            <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
                <table className="min-w-full bg-white dark:bg-gray-800">

                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-300">
                                Reference
                            </th>

                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-300">
                                Category
                            </th>

                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-300">
                                Branch
                            </th>

                            <th className="px-4 py-3 text-center text-xs font-semibold uppercase text-gray-500 dark:text-gray-300">
                                Type
                            </th>

                            <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-gray-500 dark:text-gray-300">
                                Amount
                            </th>

                            <th className="px-4 py-3 text-center text-xs font-semibold uppercase text-gray-500 dark:text-gray-300">
                                Payment
                            </th>

                            <th className="px-4 py-3 text-center text-xs font-semibold uppercase text-gray-500 dark:text-gray-300">
                                Actions
                            </th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">

                        {filteredCashFlows.length >
                        0 ? (
                            filteredCashFlows.map(
                                item => (
                                    <tr
                                        key={
                                            item.id
                                        }
                                        className="hover:bg-gray-50 dark:hover:bg-gray-700"
                                    >
                                        <td className="px-4 py-3">
                                            <div className="text-sm font-medium text-sky-600 dark:text-sky-400">
                                                {
                                                    item.referenceNo
                                                }
                                            </div>

                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                                {
                                                    item.date
                                                }
                                            </div>
                                        </td>

                                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                                            {
                                                item.category
                                            }
                                        </td>

                                        <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                                            {
                                                item.branch
                                            }
                                        </td>

                                        <td className="px-4 py-3 text-center">
                                            <span
                                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                    item.type ===
                                                    'Income'
                                                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                }`}
                                            >
                                                {
                                                    item.type
                                                }
                                            </span>
                                        </td>

                                        <td
                                            className={`px-4 py-3 text-right text-sm font-semibold ${
                                                item.type ===
                                                'Income'
                                                    ? 'text-green-600'
                                                    : 'text-red-600'
                                            }`}
                                        >
                                            $
                                            {item.amount.toFixed(
                                                2
                                            )}
                                        </td>

                                        <td className="px-4 py-3 text-center">
                                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400">
                                                {
                                                    item.paymentMethod
                                                }
                                            </span>
                                        </td>

                                        <td className="px-4 py-3">
                                            <div className="flex justify-center gap-2">

                                                <button
                                                    onClick={() =>
                                                        handleEdit(
                                                            item
                                                        )
                                                    }
                                                    className="px-3 py-1 text-sm bg-amber-500 hover:bg-amber-600 text-white rounded"
                                                >
                                                    Edit
                                                </button>

                                                <button
                                                    onClick={() =>
                                                        handleDelete(
                                                            item.id
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
                                    colSpan={
                                        7
                                    }
                                    className="text-center py-8 text-gray-500 dark:text-gray-400"
                                >
                                    No cash flow
                                    records found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </Placeholder>
    );
};

export default CashFlow;