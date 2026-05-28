import React, { useMemo, useState } from 'react';
import Placeholder from '../ui/Placeholder';

interface StaffItem {
    id: string;
    employeeCode: string;
    fullName: string;
    gender: 'Male' | 'Female';
    position: string;
    branch: string;
    phone: string;
    email: string;
    salary: number;
    joinDate: string;
    status: 'Active' | 'Inactive';
}

const initialStaffs: StaffItem[] = [
    {
        id: '1',
        employeeCode: 'EMP-001',
        fullName: 'Dara Sok',
        gender: 'Male',
        position: 'Manager',
        branch: 'Main Branch',
        phone: '012345678',
        email: 'dara@example.com',
        salary: 850,
        joinDate: '2025-01-15',
        status: 'Active',
    },
    {
        id: '2',
        employeeCode: 'EMP-002',
        fullName: 'Srey Nika',
        gender: 'Female',
        position: 'Cashier',
        branch: 'TK Branch',
        phone: '098888888',
        email: 'nika@example.com',
        salary: 450,
        joinDate: '2025-03-10',
        status: 'Active',
    },
];

const Staff: React.FC = () => {
    const [staffs, setStaffs] =
        useState<StaffItem[]>(
            initialStaffs
        );

    const [search, setSearch] =
        useState('');

    const [filterStatus, setFilterStatus] =
        useState<
            'All' | 'Active' | 'Inactive'
        >('All');

    const [editingId, setEditingId] =
        useState<string | null>(null);

    const [form, setForm] = useState({
        employeeCode: '',
        fullName: '',
        gender: 'Male' as
            | 'Male'
            | 'Female',
        position: '',
        branch: '',
        phone: '',
        email: '',
        salary: '',
        joinDate: '',
        status: 'Active' as
            | 'Active'
            | 'Inactive',
    });

    const filteredStaffs =
        useMemo(() => {
            let filtered = staffs;

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
                            item.fullName
                                .toLowerCase()
                                .includes(
                                    term
                                ) ||
                            item.employeeCode
                                .toLowerCase()
                                .includes(
                                    term
                                ) ||
                            item.position
                                .toLowerCase()
                                .includes(
                                    term
                                ) ||
                            item.branch
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
            staffs,
            search,
            filterStatus,
        ]);

    const totalStaff =
        staffs.length;

    const activeStaff =
        staffs.filter(
            s => s.status === 'Active'
        ).length;

    const inactiveStaff =
        staffs.filter(
            s =>
                s.status ===
                'Inactive'
        ).length;

    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement |
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
            employeeCode: '',
            fullName: '',
            gender: 'Male',
            position: '',
            branch: '',
            phone: '',
            email: '',
            salary: '',
            joinDate: '',
            status: 'Active',
        });
    };

    const handleSubmit = (
        e: React.FormEvent
    ) => {
        e.preventDefault();

        const newStaff: StaffItem =
            {
                id:
                    editingId ||
                    Date.now().toString(),
                employeeCode:
                    form.employeeCode,
                fullName:
                    form.fullName,
                gender: form.gender,
                position:
                    form.position,
                branch: form.branch,
                phone: form.phone,
                email: form.email,
                salary: Number(
                    form.salary
                ),
                joinDate:
                    form.joinDate,
                status: form.status,
            };

        if (editingId) {
            setStaffs(prev =>
                prev.map(item =>
                    item.id === editingId
                        ? newStaff
                        : item
                )
            );
        } else {
            setStaffs(prev => [
                newStaff,
                ...prev,
            ]);
        }

        resetForm();
    };

    const handleEdit = (
        item: StaffItem
    ) => {
        setEditingId(item.id);

        setForm({
            employeeCode:
                item.employeeCode,
            fullName:
                item.fullName,
            gender: item.gender,
            position:
                item.position,
            branch: item.branch,
            phone: item.phone,
            email: item.email,
            salary:
                item.salary.toString(),
            joinDate:
                item.joinDate,
            status: item.status,
        });
    };

    const handleDelete = (
        id: string
    ) => {
        const confirmed =
            window.confirm(
                'Delete this staff record?'
            );

        if (!confirmed) return;

        setStaffs(prev =>
            prev.filter(
                item => item.id !== id
            )
        );
    };

    const inputClasses =
        'w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500';

    return (
        <Placeholder title="Staff Management">

            {/* Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">

                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Total Staff
                    </p>

                    <h2 className="text-2xl font-bold text-sky-600 mt-2">
                        {totalStaff}
                    </h2>
                </div>

                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Active Staff
                    </p>

                    <h2 className="text-2xl font-bold text-green-600 mt-2">
                        {activeStaff}
                    </h2>
                </div>

                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Inactive Staff
                    </p>

                    <h2 className="text-2xl font-bold text-red-600 mt-2">
                        {inactiveStaff}
                    </h2>
                </div>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">

                <input
                    type="text"
                    placeholder="Search staff..."
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
                                | 'Active'
                                | 'Inactive'
                        )
                    }
                    className={
                        inputClasses
                    }
                >
                    <option value="All">
                        All Status
                    </option>

                    <option value="Active">
                        Active
                    </option>

                    <option value="Inactive">
                        Inactive
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
                            ? 'Edit Staff'
                            : 'Add Staff'}
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
                        name="employeeCode"
                        placeholder="Employee Code"
                        value={
                            form.employeeCode
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
                        name="fullName"
                        placeholder="Full Name"
                        value={
                            form.fullName
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
                        name="gender"
                        value={
                            form.gender
                        }
                        onChange={
                            handleChange
                        }
                        className={
                            inputClasses
                        }
                    >
                        <option value="Male">
                            Male
                        </option>

                        <option value="Female">
                            Female
                        </option>
                    </select>

                    <input
                        type="text"
                        name="position"
                        placeholder="Position"
                        value={
                            form.position
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
                        name="phone"
                        placeholder="Phone Number"
                        value={
                            form.phone
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
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={
                            form.email
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
                        name="salary"
                        placeholder="Salary"
                        value={
                            form.salary
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
                        name="joinDate"
                        value={
                            form.joinDate
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
                        <option value="Active">
                            Active
                        </option>

                        <option value="Inactive">
                            Inactive
                        </option>
                    </select>
                </div>

                <div className="flex justify-end mt-4">
                    <button
                        type="submit"
                        className="bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-md"
                    >
                        {editingId
                            ? 'Update Staff'
                            : 'Add Staff'}
                    </button>
                </div>
            </form>

            {/* Table */}
            <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
                <table className="min-w-full bg-white dark:bg-gray-800">

                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-300">
                                Employee
                            </th>

                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-300">
                                Position
                            </th>

                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-300">
                                Branch
                            </th>

                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-300">
                                Contact
                            </th>

                            <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-gray-500 dark:text-gray-300">
                                Salary
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

                        {filteredStaffs.length >
                        0 ? (
                            filteredStaffs.map(
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
                                                    item.fullName
                                                }
                                            </div>

                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                                {
                                                    item.employeeCode
                                                }
                                            </div>
                                        </td>

                                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                                            {
                                                item.position
                                            }
                                        </td>

                                        <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                                            {
                                                item.branch
                                            }
                                        </td>

                                        <td className="px-4 py-3">
                                            <div className="text-sm text-gray-900 dark:text-white">
                                                {
                                                    item.phone
                                                }
                                            </div>

                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                                {
                                                    item.email
                                                }
                                            </div>
                                        </td>

                                        <td className="px-4 py-3 text-right text-sm font-semibold text-green-600">
                                            $
                                            {item.salary.toFixed(
                                                2
                                            )}
                                        </td>

                                        <td className="px-4 py-3 text-center">
                                            <span
                                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                    item.status ===
                                                    'Active'
                                                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
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
                                    No staff records
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

export default Staff;