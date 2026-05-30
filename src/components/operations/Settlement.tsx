import React, {
    useMemo,
    useState,
} from 'react';
import Placeholder from '../ui/Placeholder';
import SettingsForm from '../ui/SettingsForm';
import FormInput from '../ui/FormInput';
import FormSelect from '../ui/FormSelect';
import { useFormValidation } from '../settings/useFormValidation';

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

        const { isInvalid, errors: fieldErrors } = useFormValidation(form, {
            required: ['customer', 'invoiceNo', 'settlementDate', 'amount', 'paidAmount'],
            minMax: { amount: { min: 0 }, paidAmount: { min: 0 } },
            labels: {
                customer: 'Customer',
                invoiceNo: 'Invoice No',
                settlementDate: 'Settlement Date',
                amount: 'Total Amount',
                paidAmount: 'Paid Amount'
            }
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
            <SettingsForm
                title={editingId ? 'Edit Settlement' : 'Add New Settlement'}
                isEditing={!!editingId}
                onCancel={resetForm}
                onSubmit={handleSubmit}
                isDisabled={isInvalid}
                submitLabel={editingId ? 'Update Settlement' : 'Add Settlement'}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <FormInput
                        label="Customer"
                            name="customer"
                        placeholder="Customer Name"
                            value={
                                form.customer
                            }
                            onChange={
                                handleChange
                            }
                        error={fieldErrors.customer}
                        required
                    />

                    <FormInput
                        label="Invoice No"
                            name="invoiceNo"
                            placeholder="Invoice No"
                            value={
                                form.invoiceNo
                            }
                            onChange={
                                handleChange
                            }
                        error={fieldErrors.invoiceNo}
                        required
                    />

                    <FormSelect
                        label="Payment Method"
                            name="paymentMethod"
                            value={
                                form.paymentMethod
                            }
                            onChange={
                                handleChange
                            }
                        options={[
                            { value: 'Cash', label: 'Cash' },
                            { value: 'ABA Transfer', label: 'ABA Transfer' },
                            { value: 'Bank Transfer', label: 'Bank Transfer' },
                            { value: 'Credit Card', label: 'Credit Card' },
                        ]}
                        required
                    />

                    <FormInput
                        label="Settlement Date"
                            type="date"
                            name="settlementDate"
                            value={
                                form.settlementDate
                            }
                            onChange={
                                handleChange
                            }
                        error={fieldErrors.settlementDate}
                        required
                    />

                    <FormInput
                        label="Total Amount"
                            type="number"
                            name="amount"
                            placeholder="Total Amount"
                            value={
                                form.amount
                            }
                            onChange={
                                handleChange
                            }
                        error={fieldErrors.amount}
                            min="0"
                            required
                        />

                    <FormInput
                        label="Paid Amount"
                            type="number"
                            name="paidAmount"
                            placeholder="Paid Amount"
                            value={
                                form.paidAmount
                            }
                            onChange={
                                handleChange
                            }
                        error={fieldErrors.paidAmount}
                            min="0"
                            required
                        />

                    <FormSelect
                        label="Status"
                            name="status"
                            value={
                                form.status
                            }
                            onChange={
                                handleChange
                            }
                        options={[
                            { value: 'Pending', label: 'Pending' },
                            { value: 'Paid', label: 'Paid' },
                            { value: 'Partial', label: 'Partial' },
                            { value: 'Cancelled', label: 'Cancelled' },
                        ]}
                        required
                    />
                </div>

                <div className="mt-4">
                    <FormInput
                        label="Note"
                        isTextArea
                            name="note"
                            placeholder="Settlement Note"
                            value={
                                form.note
                            }
                            onChange={
                                handleChange
                            }
                        className="h-24"
                    />
                </div>
            </SettingsForm>

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