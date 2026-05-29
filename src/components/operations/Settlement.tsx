import React, {
    useMemo,
    useState,
} from 'react';
import Placeholder from '../ui/Placeholder';

type SettlementStatus =
    | 'Pending'
    | 'Paid'
    | 'Partial'
    | 'Cancelled';

interface SettlementItem {
    id: string;
    referenceNo: string;
    customer: string;
    invoiceNo: string;
    paymentMethod: string;
    amount: number;
    paidAmount: number;
    balance: number;
    settlementDate: string;
    status: SettlementStatus;
    note?: string;
}

const initialSettlements: SettlementItem[] =
    [
        {
            id: '1',
            referenceNo:
                'SET-001',
            customer:
                'Dara Sok',
            invoiceNo:
                'INV-1001',
            paymentMethod:
                'Cash',
            amount: 350,
            paidAmount: 350,
            balance: 0,
            settlementDate:
                '2026-05-20',
            status: 'Paid',
            note: 'Full payment completed',
        },
        {
            id: '2',
            referenceNo:
                'SET-002',
            customer:
                'Nika Shop',
            invoiceNo:
                'INV-1002',
            paymentMethod:
                'ABA Transfer',
            amount: 500,
            paidAmount: 300,
            balance: 200,
            settlementDate:
                '2026-05-21',
            status: 'Partial',
            note: 'Waiting remaining balance',
        },
    ];

const Settlement: React.FC =
    () => {
        const [
            settlements,
            setSettlements,
        ] = useState<
            SettlementItem[]
        >(
            initialSettlements
        );

        const [
            search,
            setSearch,
        ] = useState('');

        const [
            filterStatus,
            setFilterStatus,
        ] = useState<
            | 'All'
            | SettlementStatus
        >('All');

        const [
            editingId,
            setEditingId,
        ] = useState<
            string | null
        >(null);

        const [form, setForm] =
            useState({
                customer: '',
                invoiceNo: '',
                paymentMethod:
                    'Cash',
                amount: '',
                paidAmount: '',
                settlementDate:
                    '',
                status:
                    'Pending' as SettlementStatus,
                note: '',
            });

        const filteredSettlements =
            useMemo(() => {
                let filtered =
                    settlements;

                if (
                    filterStatus !==
                    'All'
                ) {
                    filtered =
                        filtered.filter(
                            item =>
                                item.status === filterStatus // Correctly filter by status
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
                                item.customer
                                    .toLowerCase()
                                    .includes(
                                        term
                                    ) ||
                                item.invoiceNo
                                    .toLowerCase()
                                    .includes(
                                        term
                                    )
                        );
                }

                return filtered;
            }, [
                settlements,
                search,
                filterStatus,
            ]);

        const totalAmount =
            settlements.reduce(
                (
                    sum,
                    item
                ) =>
                    sum +
                    item.amount,
                0
            );

        const totalPaid =
            settlements.reduce(
                (
                    sum,
                    item
                ) =>
                    sum +
                    item.paidAmount,
                0
            );

        const totalBalance =
            settlements.reduce(
                (
                    sum,
                    item
                ) =>
                    sum +
                    item.balance,
                0
            );

        const handleChange = (
            e: React.ChangeEvent<
                | HTMLInputElement
                | HTMLTextAreaElement
                | HTMLSelectElement
            >
        ) => {
            setForm(prev => ({
                ...prev,
                [e.target.name]:
                    e.target.value,
            }));
        };

        const resetForm =
            () => {
                setEditingId(
                    null
                );

                setForm({
                    customer: '',
                    invoiceNo: '',
                    paymentMethod:
                        'Cash',
                    amount: '',
                    paidAmount:
                        '',
                    settlementDate:
                        '',
                    status:
                        'Pending',
                    note: '',
                });
            };

        const handleSubmit = (
            e: React.FormEvent
        ) => {
            e.preventDefault();

            const amount =
                Number(
                    form.amount
                );

            const paidAmount =
                Number(
                    form.paidAmount
                );

            const balance =
                amount -
                paidAmount;

            let status: SettlementStatus =
                form.status;

            if (
                paidAmount === 0
            ) {
                status =
                    'Pending';
            } else if (
                paidAmount >=
                amount
            ) {
                status =
                    'Paid';
            } else {
                status =
                    'Partial';
            }

            const settlement: SettlementItem =
                {
                    id:
                        editingId ||
                        Date.now().toString(),
                    referenceNo:
                        editingId
                            ? settlements.find(
                                  s =>
                                      s.id ===
                                      editingId
                              )
                                  ?.referenceNo ||
                              ''
                            : `SET-${String(
                                  settlements.length +
                                      1
                              ).padStart(
                                  3,
                                  '0'
                              )}`,
                    customer:
                        form.customer,
                    invoiceNo:
                        form.invoiceNo,
                    paymentMethod:
                        form.paymentMethod,
                    amount,
                    paidAmount,
                    balance,
                    settlementDate:
                        form.settlementDate,
                    status,
                    note: form.note,
                };

            if (
                editingId
            ) {
                setSettlements(
                    prev =>
                        prev.map(
                            item =>
                                item.id ===
                                editingId
                                    ? settlement
                                    : item
                        )
                );
            } else {
                setSettlements(
                    prev => [
                        settlement,
                        ...prev,
                    ]
                );
            }

            resetForm();
        };

        const handleEdit = (
            item: SettlementItem
        ) => {
            setEditingId(
                item.id
            );

            setForm({
                customer:
                    item.customer,
                invoiceNo:
                    item.invoiceNo,
                paymentMethod:
                    item.paymentMethod,
                amount:
                    item.amount.toString(),
                paidAmount:
                    item.paidAmount.toString(),
                settlementDate:
                    item.settlementDate,
                status:
                    item.status,
                note:
                    item.note || '',
            });
        };

        const handleDelete = (
            id: string
        ) => {
            const confirmed =
                window.confirm(
                    'Delete this settlement?'
                );

            if (
                !confirmed
            )
                return;

            setSettlements(
                prev =>
                    prev.filter(
                        item =>
                            item.id !==
                            id
                    )
            );
        };

        const statusClasses = (
            status: SettlementStatus
        ) => {
            switch (
                status
            ) {
                case 'Paid':
                    return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';

                case 'Partial':
                    return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';

                case 'Cancelled':
                    return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';

                default:
                    return 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400';
            }
        };

        const inputClasses =
            'w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500';

        return (
            <Placeholder title="Settlement">

                {/* Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">

                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Total Amount
                        </p>

                        <h2 className="text-2xl font-bold text-sky-600 mt-2">
                            $
                            {totalAmount.toFixed(
                                2
                            )}
                        </h2>
                    </div>

                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Total Paid
                        </p>

                        <h2 className="text-2xl font-bold text-green-600 mt-2">
                            $
                            {totalPaid.toFixed(
                                2
                            )}
                        </h2>
                    </div>

                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Remaining Balance
                        </p>

                        <h2 className="text-2xl font-bold text-red-500 mt-2">
                            $
                            {totalBalance.toFixed(
                                2
                            )}
                        </h2>
                    </div>
                </div>

                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">

                    <input
                        type="text"
                        placeholder="Search settlement..."
                        value={
                            search
                        }
                        onChange={e =>
                            setSearch(
                                e.target
                                    .value
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
                                    | SettlementStatus
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

                        <option value="Partial">
                            Partial
                        </option>

                        <option value="Cancelled">
                            Cancelled
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
                                ? 'Edit Settlement'
                                : 'Add Settlement'}
                        </h2>

                        {editingId && (
                            <button
                                type="button"
                                onClick={
                                    resetForm
                                }
                                className="text-sm text-red-500 hover:text-red-600"
                            >
                                Cancel
                            </button>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

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

                            <option value="ABA Transfer">
                                ABA
                                Transfer
                            </option>

                            <option value="Bank Transfer">
                                Bank
                                Transfer
                            </option>

                            <option value="Credit Card">
                                Credit
                                Card
                            </option>
                        </select>

                        <input
                            type="date"
                            name="settlementDate"
                            value={
                                form.settlementDate
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

                            <option value="Partial">
                                Partial
                            </option>

                            <option value="Cancelled">
                                Cancelled
                            </option>
                        </select>
                    </div>

                    <div className="mt-4">
                        <textarea
                            name="note"
                            placeholder="Settlement Note"
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
                            {editingId ? 'Update Settlement' : 'Add Settlement'}
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
                                    Customer
                                </th>

                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-300">
                                    Invoice
                                </th>

                                <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-gray-500 dark:text-gray-300">
                                    Amount
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

                            {filteredSettlements.length >
                            0 ? (
                                filteredSettlements.map(
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
                                                        item.settlementDate
                                                    }
                                                </div>
                                            </td>

                                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                                                {
                                                    item.customer
                                                }
                                            </td>

                                            <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                                                {
                                                    item.invoiceNo
                                                }
                                            </td>

                                            <td className="px-4 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">
                                                $
                                                {item.amount.toFixed(
                                                    2
                                                )}
                                            </td>

                                            <td className="px-4 py-3 text-right text-sm font-semibold text-red-500">
                                                $
                                                {item.balance.toFixed(
                                                    2
                                                )}
                                            </td>

                                            <td className="px-4 py-3 text-center">
                                                <span
                                                    className={`px-2 py-1 rounded-full text-xs font-medium ${statusClasses(
                                                        item.status
                                                    )}`}
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
                                        No settlement
                                        records
                                        found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Placeholder>
        );
    };

export default Settlement;