import React, { useMemo, useState } from 'react';
import Placeholder from '../ui/Placeholder';

interface TaxPaymentItem {
    id: string;
    paymentNo: string;
    taxType: string;
    taxPeriod: string;
    branch: string;
    amount: number;
    paymentDate: string;
    paymentMethod: 'Cash' | 'Bank' | 'ABA' | 'Card';
    status: 'Pending' | 'Paid';
    note: string;
}

const initialTaxPayments: TaxPaymentItem[] = [
    {
        id: '1',
        paymentNo: 'TAX-001',
        taxType: 'VAT',
        taxPeriod: 'May 2026',
        branch: 'Main Branch',
        amount: 350,
        paymentDate: '2026-05-20',
        paymentMethod: 'ABA',
        status: 'Paid',
        note: 'Monthly VAT payment',
    },
    {
        id: '2',
        paymentNo: 'TAX-002',
        taxType: 'Salary Tax',
        taxPeriod: 'May 2026',
        branch: 'TK Branch',
        amount: 180,
        paymentDate: '2026-05-25',
        paymentMethod: 'Bank',
        status: 'Pending',
        note: 'Employee salary tax',
    },
];

const TaxPayment: React.FC = () => {
    const [taxPayments, setTaxPayments] =
        useState<TaxPaymentItem[]>(
            initialTaxPayments
        );

    const [search, setSearch] =
        useState('');

    const [filterStatus, setFilterStatus] =
        useState<
            'All' | 'Pending' | 'Paid'
        >('All');

    const [editingId, setEditingId] =
        useState<string | null>(null);

    const [form, setForm] = useState({
        paymentNo: '',
        taxType: '',
        taxPeriod: '',
        branch: '',
        amount: '',
        paymentDate: '',
        paymentMethod: 'Cash' as
            | 'Cash'
            | 'Bank'
            | 'ABA'
            | 'Card',
        status: 'Pending' as
            | 'Pending'
            | 'Paid',
        note: '',
    });

    const filteredPayments =
        useMemo(() => {
            let filtered =
                taxPayments;

            if (
                filterStatus !== 'All'
            ) {
                filtered =
                    filtered.filter(
                        item =>
                            item.status ===
                            filterStatus
                    );
            }

            if (search) {
                const term =
                    search.toLowerCase();

                filtered =
                    filtered.filter(
                        item =>
                            item.paymentNo
                                .toLowerCase()
                                .includes(
                                    term
                                ) ||
                            item.taxType
                                .toLowerCase()
                                .includes(
                                    term
                                ) ||
                            item.taxPeriod
                                .toLowerCase()
                                .includes(
                                    term
                                ) ||
                            item.branch
                                .toLowerCase()
                                .includes(
                                    term
                                )
                    );
            }

            return filtered;
        }, [
            taxPayments,
            search,
            filterStatus,
        ]);

    const totalTaxPaid =
        useMemo(() => {
            return taxPayments
                .filter(
                    item =>
                        item.status ===
                        'Paid'
                )
                .reduce(
                    (sum, item) =>
                        sum + item.amount,
                    0
                );
        }, [taxPayments]);

    const totalPendingTax =
        useMemo(() => {
            return taxPayments
                .filter(
                    item =>
                        item.status ===
                        'Pending'
                )
                .reduce(
                    (sum, item) =>
                        sum + item.amount,
                    0
                );
        }, [taxPayments]);

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
            paymentNo: '',
            taxType: '',
            taxPeriod: '',
            branch: '',
            amount: '',
            paymentDate: '',
            paymentMethod: 'Cash',
            status: 'Pending',
            note: '',
        });
    };

    const handleSubmit = (
        e: React.FormEvent
    ) => {
        e.preventDefault();

        if (editingId) {
            setTaxPayments(prev =>
                prev.map(item =>
                    item.id === editingId
                        ? {
                              ...item,
                              paymentNo:
                                  form.paymentNo,
                              taxType:
                                  form.taxType,
                              taxPeriod:
                                  form.taxPeriod,
                              branch:
                                  form.branch,
                              amount:
                                  Number(
                                      form.amount
                                  ),
                              paymentDate:
                                  form.paymentDate,
                              paymentMethod:
                                  form.paymentMethod,
                              status:
                                  form.status,
                              note: form.note,
                          }
                        : item
                )
            );
        } else {
            const newPayment: TaxPaymentItem =
                {
                    id: Date.now().toString(),
                    paymentNo:
                        form.paymentNo,
                    taxType:
                        form.taxType,
                    taxPeriod:
                        form.taxPeriod,
                    branch:
                        form.branch,
                    amount: Number(
                        form.amount
                    ),
                    paymentDate:
                        form.paymentDate,
                    paymentMethod:
                        form.paymentMethod,
                    status:
                        form.status,
                    note: form.note,
                };

            setTaxPayments(prev => [
                newPayment,
                ...prev,
            ]);
        }

        resetForm();
    };

    const handleEdit = (
        item: TaxPaymentItem
    ) => {
        setEditingId(item.id);

        setForm({
            paymentNo:
                item.paymentNo,
            taxType: item.taxType,
            taxPeriod:
                item.taxPeriod,
            branch: item.branch,
            amount:
                item.amount.toString(),
            paymentDate:
                item.paymentDate,
            paymentMethod:
                item.paymentMethod,
            status: item.status,
            note: item.note,
        });
    };

    const handleDelete = (
        id: string
    ) => {
        const confirmed =
            window.confirm(
                'Delete this tax payment record?'
            );

        if (!confirmed) return;

        setTaxPayments(prev =>
            prev.filter(
                item => item.id !== id
            )
        );
    };

    const inputClasses =
        'w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500';

    return (
        <Placeholder title="Tax Payment">

            {/* Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">

                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Paid Tax
                    </p>

                    <h2 className="text-2xl font-bold text-green-600 mt-2">
                        $
                        {totalTaxPaid.toFixed(
                            2
                        )}
                    </h2>
                </div>

                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Pending Tax
                    </p>

                    <h2 className="text-2xl font-bold text-red-600 mt-2">
                        $
                        {totalPendingTax.toFixed(
                            2
                        )}
                    </h2>
                </div>

                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Total Records
                    </p>

                    <h2 className="text-2xl font-bold text-sky-600 mt-2">
                        {
                            taxPayments.length
                        }
                    </h2>
                </div>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">

                <input
                    type="text"
                    placeholder="Search tax payment..."
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
                    value={
                        filterStatus
                    }
                    onChange={e =>
                        setFilterStatus(
                            e.target
                                .value as
                                | 'All'
                                | 'Pending'
                                | 'Paid'
                        )
                    }
                    className={
                        inputClasses
                    }
                >
                    <option value="All">
                        All Status
                    </option>

                    <option value="Pending">
                        Pending
                    </option>

                    <option value="Paid">
                        Paid
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
                            ? 'Edit Tax Payment'
                            : 'Add Tax Payment'}
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

                    <input
                        type="text"
                        name="paymentNo"
                        placeholder="Payment No"
                        value={
                            form.paymentNo
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
                        name="taxType"
                        placeholder="Tax Type"
                        value={
                            form.taxType
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
                        name="taxPeriod"
                        placeholder="Tax Period"
                        value={
                            form.taxPeriod
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
                        name="paymentDate"
                        value={
                            form.paymentDate
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

                    <select
                        name="status"
                        value={
                            form.status
                        }
                        onChange={
                            handleChange
                        }
                        className={
                            inputClasses
                        }
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
                        name="note"
                        placeholder="Note"
                        value={
                            form.note
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
                            ? 'Update Payment'
                            : 'Add Payment'}
                    </button>
                </div>
            </form>

            {/* Table */}
            <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
                <table className="min-w-full bg-white dark:bg-gray-800">

                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-300">
                                Payment No
                            </th>

                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-300">
                                Tax Type
                            </th>

                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-300">
                                Tax Period
                            </th>

                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-300">
                                Branch
                            </th>

                            <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-gray-500 dark:text-gray-300">
                                Amount
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

                        {filteredPayments.length >
                        0 ? (
                            filteredPayments.map(
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
                                                    item.paymentNo
                                                }
                                            </div>

                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                                {
                                                    item.paymentDate
                                                }
                                            </div>
                                        </td>

                                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                                            {
                                                item.taxType
                                            }
                                        </td>

                                        <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                                            {
                                                item.taxPeriod
                                            }
                                        </td>

                                        <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                                            {
                                                item.branch
                                            }
                                        </td>

                                        <td className="px-4 py-3 text-right text-sm font-semibold text-red-600">
                                            $
                                            {item.amount.toFixed(
                                                2
                                            )}
                                        </td>

                                        <td className="px-4 py-3 text-center">
                                            <span
                                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                    item.status ===
                                                    'Paid'
                                                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                        : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                                }`}
                                            >
                                                {
                                                    item.status
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
                                    No tax payment
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

export default TaxPayment;