import React, { useMemo, useState } from 'react';
import Placeholder from '../ui/Placeholder';

interface PayableItem {
    id: string;
    payableNo: string;
    supplier: string;
    branch: string;
    invoiceNo: string;
    amount: number;
    paidAmount: number;
    dueDate: string;
    status: 'Pending' | 'Partial' | 'Paid';
    note: string;
}

const initialPayables: PayableItem[] = [
    {
        id: '1',
        payableNo: 'AP-001',
        supplier: 'LH Supplier',
        branch: 'Main Branch',
        invoiceNo: 'INV-1001',
        amount: 1200,
        paidAmount: 400,
        dueDate: '2026-06-05',
        status: 'Partial',
        note: 'Phone accessories order',
    },
    {
        id: '2',
        payableNo: 'AP-002',
        supplier: 'Tech Import',
        branch: 'Toul Kork Branch',
        invoiceNo: 'INV-1002',
        amount: 850,
        paidAmount: 0,
        dueDate: '2026-06-10',
        status: 'Pending',
        note: 'Display replacement parts',
    },
];

const AccountsPayable: React.FC = () => {
    const [payables, setPayables] =
        useState<PayableItem[]>(
            initialPayables
        );

    const [search, setSearch] =
        useState('');

    const [editingId, setEditingId] =
        useState<string | null>(null);

    const [form, setForm] = useState({
        payableNo: '',
        supplier: '',
        branch: '',
        invoiceNo: '',
        amount: '',
        paidAmount: '',
        dueDate: '',
        status: 'Pending' as
            | 'Pending'
            | 'Partial'
            | 'Paid',
        note: '',
    });

    const filteredPayables = useMemo(() => {
        if (!search) return payables;

        const term =
            search.toLowerCase();

        return payables.filter(
            payable =>
                payable.payableNo
                    .toLowerCase()
                    .includes(term) ||
                payable.supplier
                    .toLowerCase()
                    .includes(term) ||
                payable.invoiceNo
                    .toLowerCase()
                    .includes(term) ||
                payable.branch
                    .toLowerCase()
                    .includes(term)
        );
    }, [payables, search]);

    const totalPayable =
        useMemo(() => {
            return filteredPayables.reduce(
                (sum, item) =>
                    sum +
                    (item.amount -
                        item.paidAmount),
                0
            );
        }, [filteredPayables]);

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
            payableNo: '',
            supplier: '',
            branch: '',
            invoiceNo: '',
            amount: '',
            paidAmount: '',
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

        const paidAmount = Number(
            form.paidAmount
        );

        let computedStatus:
            | 'Pending'
            | 'Partial'
            | 'Paid' =
            form.status;

        if (paidAmount <= 0) {
            computedStatus =
                'Pending';
        } else if (
            paidAmount >= amount
        ) {
            computedStatus = 'Paid';
        } else {
            computedStatus =
                'Partial';
        }

        if (editingId) {
            setPayables(prev =>
                prev.map(item =>
                    item.id === editingId
                        ? {
                              ...item,
                              payableNo:
                                  form.payableNo,
                              supplier:
                                  form.supplier,
                              branch:
                                  form.branch,
                              invoiceNo:
                                  form.invoiceNo,
                              amount,
                              paidAmount,
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
            const newPayable: PayableItem =
                {
                    id: Date.now().toString(),
                    payableNo:
                        form.payableNo,
                    supplier:
                        form.supplier,
                    branch:
                        form.branch,
                    invoiceNo:
                        form.invoiceNo,
                    amount,
                    paidAmount,
                    dueDate:
                        form.dueDate,
                    status:
                        computedStatus,
                    note: form.note,
                };

            setPayables(prev => [
                newPayable,
                ...prev,
            ]);
        }

        resetForm();
    };

    const handleEdit = (
        payable: PayableItem
    ) => {
        setEditingId(payable.id);

        setForm({
            payableNo:
                payable.payableNo,
            supplier:
                payable.supplier,
            branch: payable.branch,
            invoiceNo:
                payable.invoiceNo,
            amount:
                payable.amount.toString(),
            paidAmount:
                payable.paidAmount.toString(),
            dueDate:
                payable.dueDate,
            status:
                payable.status,
            note: payable.note,
        });
    };

    const handleDelete = (
        id: string
    ) => {
        const confirmed =
            window.confirm(
                'Delete this payable record?'
            );

        if (!confirmed) return;

        setPayables(prev =>
            prev.filter(
                item => item.id !== id
            )
        );
    };

    const inputClasses =
        'w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500';

    return (
        <Placeholder title="Accounts Payable">

            {/* Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">

                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Outstanding Balance
                    </p>

                    <h2 className="text-2xl font-bold text-red-600 mt-2">
                        $
                        {totalPayable.toFixed(
                            2
                        )}
                    </h2>
                </div>

                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Pending Bills
                    </p>

                    <h2 className="text-2xl font-bold text-amber-500 mt-2">
                        {
                            payables.filter(
                                p =>
                                    p.status ===
                                    'Pending'
                            ).length
                        }
                    </h2>
                </div>

                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Paid Bills
                    </p>

                    <h2 className="text-2xl font-bold text-green-600 mt-2">
                        {
                            payables.filter(
                                p =>
                                    p.status ===
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
                    placeholder="Search payable..."
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
                            ? 'Edit Payable'
                            : 'Add Payable'}
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
                        name="payableNo"
                        placeholder="Payable No"
                        value={
                            form.payableNo
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
                        name="supplier"
                        placeholder="Supplier"
                        value={
                            form.supplier
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
                        name="paidAmount"
                        placeholder="Paid Amount"
                        value={
                            form.paidAmount
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
                            ? 'Update Payable'
                            : 'Add Payable'}
                    </button>
                </div>
            </form>

            {/* Table */}
            <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
                <table className="min-w-full bg-white dark:bg-gray-800">

                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-300">
                                Payable No
                            </th>

                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-300">
                                Supplier
                            </th>

                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-300">
                                Invoice
                            </th>

                            <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-gray-500 dark:text-gray-300">
                                Amount
                            </th>

                            <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-gray-500 dark:text-gray-300">
                                Paid
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

                        {filteredPayables.length >
                        0 ? (
                            filteredPayables.map(
                                payable => {
                                    const balance =
                                        payable.amount -
                                        payable.paidAmount;

                                    return (
                                        <tr
                                            key={
                                                payable.id
                                            }
                                            className="hover:bg-gray-50 dark:hover:bg-gray-700"
                                        >
                                            <td className="px-4 py-3">
                                                <div className="text-sm font-medium text-sky-600 dark:text-sky-400">
                                                    {
                                                        payable.payableNo
                                                    }
                                                </div>

                                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                                    Due:{' '}
                                                    {
                                                        payable.dueDate
                                                    }
                                                </div>
                                            </td>

                                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                                                {
                                                    payable.supplier
                                                }
                                            </td>

                                            <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                                                {
                                                    payable.invoiceNo
                                                }
                                            </td>

                                            <td className="px-4 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">
                                                $
                                                {payable.amount.toFixed(
                                                    2
                                                )}
                                            </td>

                                            <td className="px-4 py-3 text-right text-sm text-green-600 font-semibold">
                                                $
                                                {payable.paidAmount.toFixed(
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
                                                        payable.status ===
                                                        'Paid'
                                                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                            : payable.status ===
                                                                'Partial'
                                                              ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                                              : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                    }`}
                                                >
                                                    {
                                                        payable.status
                                                    }
                                                </span>
                                            </td>

                                            <td className="px-4 py-3">
                                                <div className="flex justify-center gap-2">

                                                    <button
                                                        onClick={() =>
                                                            handleEdit(
                                                                payable
                                                            )
                                                        }
                                                        className="px-3 py-1 text-sm bg-amber-500 hover:bg-amber-600 text-white rounded"
                                                    >
                                                        Edit
                                                    </button>

                                                    <button
                                                        onClick={() =>
                                                            handleDelete(
                                                                payable.id
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
                                    No payable
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

export default AccountsPayable;