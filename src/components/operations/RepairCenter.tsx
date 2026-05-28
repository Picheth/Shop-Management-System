import React, {
    useMemo,
    useState,
} from 'react';
import Placeholder from '../ui/Placeholder';
import { DataProduct, Branch, StockTransfer, Page } from '../../types';

type RepairStatus =
    | 'Pending'
    | 'In Progress'
    | 'Completed'
    | 'Cancelled';

interface RepairItem {
    id: string;
    customer: string;
    phone: string;
    device: string;
    serialNumber: string;
    issue: string;
    technician: string;
    branch: string;
    entryDate: string;
    estimatedCost: number;
    status: RepairStatus;
}

const initialRepairs: RepairItem[] = [
    {
        id: 'REP-001',
        customer: 'Dara Sok',
        phone: '012345678',
        device: 'iPhone 14 Pro',
        serialNumber: 'IP14-001',
        issue: 'Screen broken',
        technician: 'Nika',
        branch: 'Main Branch',
        entryDate: '2026-05-20',
        estimatedCost: 120,
        status: 'Pending',
    },
    {
        id: 'REP-002',
        customer: 'Chan Pheak',
        phone: '098888888',
        device: 'Samsung S24',
        serialNumber: 'SS24-009',
        issue: 'Battery issue',
        technician: 'Vanna',
        branch: 'TK Branch',
        entryDate: '2026-05-21',
        estimatedCost: 80,
        status: 'In Progress',
    },
];

interface RepairCenterProps {
    products: DataProduct[];
    setProducts: React.Dispatch<React.SetStateAction<DataProduct[]>>;
    branches: Branch[];
    onNavigate: (page: Page) => void;
    stockTransfers: StockTransfer[];
    setStockTransfers: React.Dispatch<React.SetStateAction<StockTransfer[]>>;
}

const RepairCenter: React.FC<RepairCenterProps> =
    ({ products, setProducts, branches, onNavigate, stockTransfers, setStockTransfers }) => {
        const [repairs, setRepairs] = useState<RepairItem[]>(initialRepairs);

        const [
            search,
            setSearch,
        ] = useState('');

        const [
            filterStatus,
            setFilterStatus,
        ] = useState<
            | 'All'
            | RepairStatus
        >('All');

        const [
            editingId,
            setEditingId,
        ] = useState<
            string | null
        >(null);

        const [
            selectedRepair,
            setSelectedRepair,
        ] =
            useState<RepairItem | null>(
                null
            );

        const [form, setForm] =
            useState({
                customer: '',
                phone: '',
                device: '',
                serialNumber: '',
                issue: '',
                technician: '',
                branch: '',
                entryDate: '',
                estimatedCost: '',
                status:
                    'Pending' as RepairStatus,
            });

        const filteredRepairs =
            useMemo(() => {
                let filtered =
                    repairs;

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
                                item.id
                                    .toLowerCase()
                                    .includes(
                                        term
                                    ) ||
                                item.customer
                                    .toLowerCase()
                                    .includes(
                                        term
                                    ) ||
                                item.device
                                    .toLowerCase()
                                    .includes(
                                        term
                                    ) ||
                                item.phone
                                    .toLowerCase()
                                    .includes(
                                        term
                                    )
                        );
                }

                return filtered;
            }, [
                repairs,
                search,
                filterStatus,
            ]);

        const totalRepairs =
            repairs.length;

        const pendingRepairs =
            repairs.filter(
                r =>
                    r.status ===
                    'Pending'
            ).length;

        const completedRepairs =
            repairs.filter(
                r =>
                    r.status ===
                    'Completed'
            ).length;

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
                    phone: '',
                    device: '',
                    serialNumber:
                        '',
                    issue: '',
                    technician:
                        '',
                    branch: '',
                    entryDate:
                        '',
                    estimatedCost:
                        '',
                    status:
                        'Pending',
                });
            };

        const handleSubmit = (
            e: React.FormEvent
        ) => {
            e.preventDefault();

            const repairData: RepairItem =
                {
                    id:
                        editingId ||
                        `REP-${String(
                            repairs.length +
                                1
                        ).padStart(
                            3,
                            '0'
                        )}`,
                    customer:
                        form.customer,
                    phone:
                        form.phone,
                    device:
                        form.device,
                    serialNumber:
                        form.serialNumber,
                    issue:
                        form.issue,
                    technician:
                        form.technician,
                    branch:
                        form.branch,
                    entryDate:
                        form.entryDate,
                    estimatedCost:
                        Number(
                            form.estimatedCost
                        ),
                    status:
                        form.status,
                };

            if (
                editingId
            ) {
                setRepairs(
                    prev =>
                        prev.map(
                            item =>
                                item.id ===
                                editingId
                                    ? repairData
                                    : item
                        )
                );
            } else {
                setRepairs(
                    prev => [
                        repairData,
                        ...prev,
                    ]
                );
            }

            resetForm();
        };

        const handleEdit = (
            item: RepairItem
        ) => {
            setEditingId(
                item.id
            );

            setForm({
                customer:
                    item.customer,
                phone:
                    item.phone,
                device:
                    item.device,
                serialNumber:
                    item.serialNumber,
                issue:
                    item.issue,
                technician:
                    item.technician,
                branch:
                    item.branch,
                entryDate:
                    item.entryDate,
                estimatedCost:
                    item.estimatedCost.toString(),
                status:
                    item.status,
            });
        };

        const handleDelete = (
            id: string
        ) => {
            const confirmed =
                window.confirm(
                    'Delete this repair record?'
                );

            if (
                !confirmed
            )
                return;

            setRepairs(
                prev =>
                    prev.filter(
                        item =>
                            item.id !==
                            id
                    )
            );
        };

        const updateStatus =
            (
                id: string,
                status: RepairStatus
            ) => {
                setRepairs(
                    prev =>
                        prev.map(
                            item =>
                                item.id ===
                                id
                                    ? {
                                          ...item,
                                          status,
                                      }
                                    : item
                        )
                );

                if (
                    selectedRepair &&
                    selectedRepair.id ===
                        id
                ) {
                    setSelectedRepair(
                        {
                            ...selectedRepair,
                            status,
                        }
                    );
                }
            };

        const inputClasses =
            'w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500';

        return (
            <Placeholder title="Repair Center">

                {/* Summary */}
                <div className="@container grid grid-cols-1 @[400px]:grid-cols-2 @[700px]:grid-cols-3 gap-4 mb-6">

                    <div className="card">
                        <p className="text-sm text-brand-secondary dark:text-gray-400">
                            Total Repairs
                        </p>

                        <h2 className="text-2xl font-bold text-sky-600 mt-2">
                            {
                                totalRepairs
                            }
                        </h2>
                    </div>

                    <div className="card">
                        <p className="text-sm text-brand-secondary dark:text-gray-400">
                            Pending Repairs
                        </p>

                        <h2 className="text-2xl font-bold text-amber-500 mt-2">
                            {
                                pendingRepairs
                            }
                        </h2>
                    </div>

                    <div className="card">
                        <p className="text-sm text-brand-secondary dark:text-gray-400">
                            Completed Repairs
                        </p>

                        <h2 className="text-2xl font-bold text-green-600 mt-2">
                            {
                                completedRepairs
                            }
                        </h2>
                    </div>
                </div>

                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">

                    <input
                        type="text"
                        placeholder="Search repair..."
                        value={
                            search
                        }
                        onChange={e =>
                            setSearch(
                                e.target
                                    .value
                            )
                        }
                        className="input-field"
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
                                    | RepairStatus
                            )
                        }
                        className="input-field"
                    >
                        <option value="All">
                            All Status
                        </option>

                        <option value="Pending">
                            Pending
                        </option>

                        <option value="In Progress">
                            In Progress
                        </option>

                        <option value="Completed">
                            Completed
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
                    className="card mb-6"
                >
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {editingId
                                ? 'Edit Repair'
                                : 'Add Repair'}
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
                            placeholder="Customer Name"
                            value={
                                form.customer
                            }
                            onChange={
                                handleChange
                            }
                            className="input-field"
                            required
                        />

                        <input
                            type="text"
                            name="phone"
                            placeholder="Phone"
                            value={
                                form.phone
                            }
                            onChange={
                                handleChange
                            }
                            className="input-field"
                            required
                        />

                        <input
                            type="text"
                            name="device"
                            placeholder="Device"
                            value={
                                form.device
                            }
                            onChange={
                                handleChange
                            }
                            className="input-field"
                            required
                        />

                        <input
                            type="text"
                            name="serialNumber"
                            placeholder="Serial Number"
                            value={
                                form.serialNumber
                            }
                            onChange={
                                handleChange
                            }
                            className="input-field"
                        />

                        <input
                            type="text"
                            name="technician"
                            placeholder="Technician"
                            value={
                                form.technician
                            }
                            onChange={
                                handleChange
                            }
                            className="input-field"
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
                            className="input-field"
                            required
                        />

                        <input
                            type="date"
                            name="entryDate"
                            value={
                                form.entryDate
                            }
                            onChange={
                                handleChange
                            }
                            className="input-field"
                            required
                        />

                        <input
                            type="number"
                            name="estimatedCost"
                            placeholder="Estimated Cost"
                            value={
                                form.estimatedCost
                            }
                            onChange={
                                handleChange
                            }
                            className="input-field"
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
                            className="input-field"
                        >
                            <option value="Pending">
                                Pending
                            </option>

                            <option value="In Progress">
                                In Progress
                            </option>

                            <option value="Completed">
                                Completed
                            </option>

                            <option value="Cancelled">
                                Cancelled
                            </option>
                        </select>
                    </div>

                    <div className="mt-4">
                        <textarea
                            name="issue"
                            placeholder="Issue Description"
                            value={
                                form.issue
                            }
                            onChange={
                                handleChange
                            }
                            className="input-field h-24"
                            required
                        />
                    </div>

                    <div className="flex justify-end mt-4">
                        <button
                            type="submit"
                            className="btn-primary"
                        >
                            {editingId
                                ? 'Update Repair'
                                : 'Add Repair'}
                        </button>
                    </div>
                </form>

                {/* Table */}
                <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
                    <table className="min-w-full bg-white dark:bg-gray-800">

                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-300">
                                    Repair ID
                                </th>

                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-300">
                                    Customer
                                </th>

                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-300">
                                    Device
                                </th>

                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-300">
                                    Technician
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

                            {filteredRepairs.length >
                            0 ? (
                                filteredRepairs.map(
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
                                                        item.id
                                                    }
                                                </div>

                                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                                    {
                                                        item.entryDate
                                                    }
                                                </div>
                                            </td>

                                            <td className="px-4 py-3">
                                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                    {
                                                        item.customer
                                                    }
                                                </div>

                                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                                    {
                                                        item.phone
                                                    }
                                                </div>
                                            </td>

                                            <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                                                {
                                                    item.device
                                                }
                                            </td>

                                            <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                                                {
                                                    item.technician
                                                }
                                            </td>

                                            <td className="px-4 py-3 text-center">
                                                <select
                                                    value={
                                                        item.status
                                                    }
                                                    onChange={e =>
                                                        updateStatus(
                                                            item.id,
                                                            e
                                                                .target
                                                                .value as RepairStatus
                                                        )
                                                    }
                                                    className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 text-xs"
                                                >
                                                    <option value="Pending">
                                                        Pending
                                                    </option>

                                                    <option value="In Progress">
                                                        In
                                                        Progress
                                                    </option>

                                                    <option value="Completed">
                                                        Completed
                                                    </option>

                                                    <option value="Cancelled">
                                                        Cancelled
                                                    </option>
                                                </select>
                                            </td>

                                            <td className="px-4 py-3">
                                                <div className="flex justify-center gap-2">

                                                    <button
                                                        onClick={() =>
                                                            setSelectedRepair(
                                                                item
                                                            )
                                                        }
                                                        className="px-3 py-1 text-sm bg-sky-500 hover:bg-sky-600 text-white rounded"
                                                    >
                                                        View
                                                    </button>

                                                    <button
                                                        onClick={() =>
                                                            handleEdit(
                                                                item
                                                            )
                                                        }
                                                        className="px-3 py-1 text-sm bg-brand-accent hover:bg-amber-600 text-white rounded"
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
                                            6
                                        }
                                        className="text-center py-8 text-gray-500 dark:text-gray-400"
                                    >
                                        No repair
                                        records
                                        found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Detail Modal */}
                {selectedRepair && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-2xl p-6">

                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                    Repair
                                    Detail
                                </h2>

                                <button
                                    onClick={() =>
                                        setSelectedRepair(
                                            null
                                        )
                                    }
                                    className="text-gray-500 hover:text-red-500 text-xl"
                                >
                                    ×
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                <div>
                                    <p className="text-xs text-gray-500 uppercase mb-1">
                                        Repair ID
                                    </p>

                                    <p className="font-medium text-gray-900 dark:text-white">
                                        {
                                            selectedRepair.id
                                        }
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs text-gray-500 uppercase mb-1">
                                        Status
                                    </p>

                                    <select
                                        value={
                                            selectedRepair.status
                                        }
                                        onChange={e =>
                                            updateStatus(
                                                selectedRepair.id,
                                                e
                                                    .target
                                                    .value as RepairStatus
                                            )
                                        }
                                        className="input-field"
                                    >
                                        <option value="Pending">
                                            Pending
                                        </option>

                                        <option value="In Progress">
                                            In
                                            Progress
                                        </option>

                                        <option value="Completed">
                                            Completed
                                        </option>

                                        <option value="Cancelled">
                                            Cancelled
                                        </option>
                                    </select>
                                </div>

                                <div>
                                    <p className="text-xs text-gray-500 uppercase mb-1">
                                        Customer
                                    </p>

                                    <p className="font-medium text-gray-900 dark:text-white">
                                        {
                                            selectedRepair.customer
                                        }
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs text-gray-500 uppercase mb-1">
                                        Phone
                                    </p>

                                    <p className="font-medium text-gray-900 dark:text-white">
                                        {
                                            selectedRepair.phone
                                        }
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs text-gray-500 uppercase mb-1">
                                        Device
                                    </p>

                                    <p className="font-medium text-gray-900 dark:text-white">
                                        {
                                            selectedRepair.device
                                        }
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs text-gray-500 uppercase mb-1">
                                        Serial Number
                                    </p>

                                    <p className="font-medium text-gray-900 dark:text-white">
                                        {
                                            selectedRepair.serialNumber
                                        }
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs text-gray-500 uppercase mb-1">
                                        Technician
                                    </p>

                                    <p className="font-medium text-gray-900 dark:text-white">
                                        {
                                            selectedRepair.technician
                                        }
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs text-gray-500 uppercase mb-1">
                                        Branch
                                    </p>

                                    <p className="font-medium text-gray-900 dark:text-white">
                                        {
                                            selectedRepair.branch
                                        }
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs text-gray-500 uppercase mb-1">
                                        Estimated
                                        Cost
                                    </p>

                                    <p className="font-semibold text-green-600">
                                        $
                                        {selectedRepair.estimatedCost.toFixed(
                                            2
                                        )}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs text-gray-500 uppercase mb-1">
                                        Entry Date
                                    </p>

                                    <p className="font-medium text-gray-900 dark:text-white">
                                        {
                                            selectedRepair.entryDate
                                        }
                                    </p>
                                </div>
                            </div>

                            <div className="mt-5">
                                <p className="text-xs text-gray-500 uppercase mb-2">
                                    Issue
                                    Description
                                </p>

                                <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 text-sm text-gray-700 dark:text-gray-300">
                                    {
                                        selectedRepair.issue
                                    }
                                </div>
                            </div>

                            <div className="flex justify-end mt-6">
                                <button
                                    onClick={() =>
                                        setSelectedRepair(
                                            null
                                        )
                                    }
                                    className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white px-4 py-2 rounded-md"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </Placeholder>
        );
    };

export default RepairCenter;