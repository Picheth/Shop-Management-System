import React, { useMemo, useState } from 'react';
import Placeholder from '../ui/Placeholder';

interface ReceivableItem {
    id: string;
    receivableNo: string;
    customer: string;
    branch: string;
    invoiceNo: string;
    amount: number;
    receivedAmount: number;
    dueDate: string;
    status: 'Pending' | 'Partial' | 'Paid';
    note: string;
}

const initialReceivables: ReceivableItem[] = [
    {
        id: '1',
        receivableNo: 'AR-001',
        customer: 'John Mobile Shop',
        branch: 'Main Branch',
        invoiceNo: 'SAL-1001',
        amount: 1500,
        receivedAmount: 500,
        dueDate: '2026-06-05',
        status: 'Partial',
        note: 'iPhone accessories order',
    },
    {
        id: '2',
        receivableNo: 'AR-002',
        customer: 'Dara Telecom',
        branch: 'Toul Kork Branch',
        invoiceNo: 'SAL-1002',
        amount: 950,
        receivedAmount: 0,
        dueDate: '2026-06-10',
        status: 'Pending',
        note: 'Phone repair invoice',
    },
];

const AccountsReceivable: React.FC = () => {
    const [receivables, setReceivables] =
        useState<ReceivableItem[]>(
            initialReceivables
        );

    const [search, setSearch] =
        useState('');

    const [editingId, setEditingId] =
        useState<string | null>(null);

    const [form, setForm] = useState({
        receivableNo: '',
        customer: '',
        branch: '',
        invoiceNo: '',
        amount: '',
        receivedAmount: '',
        dueDate: '',
        status: 'Pending' as
            | 'Pending'
            | 'Partial'
            | 'Paid',
        note: '',
    });

    const filteredReceivables =
        useMemo(() => {
            if (!search)
                return receivables;

            const term =
                search.toLowerCase();

            return receivables.filter(
                receivable =>
                    receivable.receivableNo
                        .toLowerCase()
                        .includes(term) ||
                    receivable.customer
                        .toLowerCase()
                        .includes(term) ||
                    receivable.invoiceNo
                        .toLowerCase()
                        .includes(term) ||
                    receivable.branch
                        .toLowerCase()
                        .includes(term)
            );
        }, [receivables, search]);

    const totalReceivable =
        useMemo(() => {
            return filteredReceivables.reduce(
                (sum, item) =>
                    sum +
                    (item.amount -
                        item.receivedAmount),
                0
            );
        }, [filteredReceivables]);

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
            receivableNo: '',
            customer: '',
            branch: '',
            invoiceNo: '',
            amount: '',
            receivedAmount: '',
            dueDate: '',
            status: 'Pending',
            note: '',
        });
    };

    const handleSubmit = (
        e: React.FormEvent
    ) => {
        e.preventDefault();

        const amount = Number(
            form.amount
        );

        const receivedAmount =
            Number(
                form.receivedAmount
            );

        let computedStatus:
            | 'Pending'
            | 'Partial'
            | 'Paid' =
            form.status;

        if (receivedAmount <= 0) {
            computedStatus =
                'Pending';
        } else if (
            receivedAmount >= amount
        ) {
            computedStatus = 'Paid';
        } else {
            computedStatus =
                'Partial';
        }

        if (editingId) {
            setReceivables(prev =>
                prev.map(item =>
                    item.id === editingId
                        ? {
                              ...item,
                              receivableNo:
                                  form.receivableNo,
                              customer:
                                  form.customer,
                              branch:
                                  form.branch,
                              invoiceNo:
                                  form.invoiceNo,
                              amount,
                              receivedAmount,
                              dueDate:
                                  form.dueDate,
                              status:
                                  computedStatus,
                              note: form.note,
                          }
                        : item
                )
            );
        } else {
            const newReceivable: ReceivableItem =
                {
                    id: Date.now().toString(),
                    receivableNo:
                        form.receivableNo,
                    customer:
                        form.customer,
                    branch:
                        form.branch,
                    invoiceNo:
                        form.invoiceNo,
                    amount,
                    receivedAmount,
                    dueDate:
                        form.dueDate,
                    status:
                        computedStatus,
                    note: form.note,
                };

            setReceivables(prev => [
                newReceivable,
                ...prev,
            ]);
        }

        resetForm();
    };

    const handleEdit = (
        receivable: ReceivableItem
    ) => {
        setEditingId(receivable.id);

        setForm({
            receivableNo:
                receivable.receivableNo,
            customer:
                receivable.customer,
            branch:
                receivable.branch,
            invoiceNo:
                receivable.invoiceNo,
            amount:
                receivable.amount.toString(),
            receivedAmount:
                receivable.receivedAmount.toString(),
            dueDate:
                receivable.dueDate,
            status:
                receivable.status,
            note:
                receivable.note,
        });
    };

    const handleDelete = (
        id: string
    ) => {
        const confirmed =
            window.confirm(
                'Delete this receivable record?'
            );

        if (!confirmed) return;

        setReceivables(prev =>
            prev.filter(
                item => item.id !== id
            )
        );
    };

    const inputClasses =
        'w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500';

    return (
        <Placeholder title="Accounts Receivable">

            {/* Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">

                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Outstanding Receivable
                    </p>

                    <h2 className="text-2xl font-bold text-sky-600 mt-2">
                        $
                        {totalReceivable.toFixed(
                            2
                        )}
                    </h2>
                </div>

                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Pending Invoices
                    </p>

                    <h2 className="text-2xl font-bold text-amber-500 mt-2">
                        {
                            receivables.filter(
                                r =>
                                    r.status ===
                                    'Pending'
                            ).length
                        }
                    </h2>
                </div>

                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Paid Invoices
                    </p>

                    <h2 className="text-2xl font-bold text-green-600 mt-2">
                        {
                            receivables.filter(
                                r =>
                                    r.status ===
                                    'Paid'
                            ).length
                        }
                    </h2>
                </div>
            </div>

            {/* Search */}
            <div className="mb-6">
                <input
                    type="text"
                    placeholder="Search receivable..."
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
                            ? 'Edit Receivable'
                            : 'Add Receivable'}
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

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

                    <input
                        type="text"
                        name="receivableNo"
                        placeholder="Receivable No"
                        value={
                            form.receivableNo
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
                        name="customer"
                        placeholder="Customer"
                        value={
                            form.customer
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
                        type="text"
                        name="invoiceNo"
                        placeholder="Invoice No"
                        value={
                            form.invoiceNo
                        }
                        onChange={
                            handleChange
                        }
                        className={
                            inputClasses
                        }
                    />

                    <input
                        type="number"
                        name="amount"
                        placeholder="Total Amount"
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
                        type="number"
                        name="receivedAmount"
                        placeholder="Received Amount"
                        value={
                            form.receivedAmount
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
                        name="dueDate"
                        value={
                            form.dueDate
                        }
                        onChange={
                            handleChange
                        }
                        className={
                            inputClasses
                        }
                        required
                    />
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
                            ? 'Update Receivable'
                            : 'Add Receivable'}
                    </button>
                </div>
            </form>

            {/* Table */}
            <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
                <table className="min-w-full bg-white dark:bg-gray-800">

                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-300">
                                Receivable No
                            </th>

                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-300">
                                Customer
                            </th>

                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-300">
                                Invoice
                            </th>

                            <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-gray-500 dark:text-gray-300">
                                Amount
                            </th>

                            <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-gray-500 dark:text-gray-300">
                                Received
                            </th>

                            <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-gray-500 dark:text-gray-300">
                                Balance
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

                        {filteredReceivables.length >
                        0 ? (
                            filteredReceivables.map(
                                receivable => {
                                    const balance =
                                        receivable.amount -
                                        receivable.receivedAmount;

                                    return (
                                        <tr
                                            key={
                                                receivable.id
                                            }
                                            className="hover:bg-gray-50 dark:hover:bg-gray-700"
                                        >
                                            <td className="px-4 py-3">
                                                <div className="text-sm font-medium text-sky-600 dark:text-sky-400">
                                                    {
                                                        receivable.receivableNo
                                                    }
                                                </div>

                                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                                    Due:{' '}
                                                    {
                                                        receivable.dueDate
                                                    }
                                                </div>
                                            </td>

                                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                                                {
                                                    receivable.customer
                                                }
                                            </td>

                                            <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                                                {
                                                    receivable.invoiceNo
                                                }
                                            </td>

                                            <td className="px-4 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">
                                                $
                                                {receivable.amount.toFixed(
                                                    2
                                                )}
                                            </td>

                                            <td className="px-4 py-3 text-right text-sm text-green-600 font-semibold">
                                                $
                                                {receivable.receivedAmount.toFixed(
                                                    2
                                                )}
                                            </td>

                                            <td className="px-4 py-3 text-right text-sm text-red-600 font-semibold">
                                                $
                                                {balance.toFixed(
                                                    2
                                                )}
                                            </td>

                                            <td className="px-4 py-3 text-center">
                                                <span
                                                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                        receivable.status ===
                                                        'Paid'
                                                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                            : receivable.status ===
                                                                'Partial'
                                                              ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                                              : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                    }`}
                                                >
                                                    {
                                                        receivable.status
                                                    }
                                                </span>
                                            </td>

                                            <td className="px-4 py-3">
                                                <div className="flex justify-center gap-2">

                                                    <button
                                                        onClick={() =>
                                                            handleEdit(
                                                                receivable
                                                            )
                                                        }
                                                        className="px-3 py-1 text-sm bg-amber-500 hover:bg-amber-600 text-white rounded"
                                                    >
                                                        Edit
                                                    </button>

                                                    <button
                                                        onClick={() =>
                                                            handleDelete(
                                                                receivable.id
                                                            )
                                                        }
                                                        className="px-3 py-1 text-sm bg-red-500 hover:bg-red-600 text-white rounded"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                }
                            )
                        ) : (
                            <tr>
                                <td
                                    colSpan={
                                        8
                                    }
                                    className="text-center py-8 text-gray-500 dark:text-gray-400"
                                >
                                    No receivable
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

export default AccountsReceivable;