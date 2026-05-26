import React, { useMemo, useState } from 'react';
import Placeholder from '../ui/Placeholder';

interface PayrollItem {
    id: string;
    payrollNo: string;
    employeeName: string;
    position: string;
    branch: string;
    salaryMonth: string;
    basicSalary: number;
    allowance: number;
    deduction: number;
    netSalary: number;
    paymentDate: string;
    paymentMethod: 'Cash' | 'ABA' | 'Bank';
    status: 'Pending' | 'Paid';
}

const initialPayrolls: PayrollItem[] = [
    {
        id: '1',
        payrollNo: 'PAY-001',
        employeeName: 'Dara Sok',
        position: 'Sales Manager',
        branch: 'Main Branch',
        salaryMonth: 'May 2026',
        basicSalary: 850,
        allowance: 120,
        deduction: 40,
        netSalary: 930,
        paymentDate: '2026-05-25',
        paymentMethod: 'ABA',
        status: 'Paid',
    },
    {
        id: '2',
        payrollNo: 'PAY-002',
        employeeName: 'Nika Chan',
        position: 'Technician',
        branch: 'TK Branch',
        salaryMonth: 'May 2026',
        basicSalary: 600,
        allowance: 80,
        deduction: 20,
        netSalary: 660,
        paymentDate: '2026-05-28',
        paymentMethod: 'Cash',
        status: 'Pending',
    },
];

const Payroll: React.FC = () => {
    const [payrolls, setPayrolls] =
        useState<PayrollItem[]>(
            initialPayrolls
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
        payrollNo: '',
        employeeName: '',
        position: '',
        branch: '',
        salaryMonth: '',
        basicSalary: '',
        allowance: '',
        deduction: '',
        paymentDate: '',
        paymentMethod: 'Cash' as
            | 'Cash'
            | 'ABA'
            | 'Bank',
        status: 'Pending' as
            | 'Pending'
            | 'Paid',
    });

    const filteredPayrolls =
        useMemo(() => {
            let filtered = payrolls;

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
                            item.payrollNo
                                .toLowerCase()
                                .includes(
                                    term
                                ) ||
                            item.employeeName
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
                                )
                    );
            }

            return filtered;
        }, [
            payrolls,
            search,
            filterStatus,
        ]);

    const totalSalary =
        useMemo(() => {
            return payrolls.reduce(
                (sum, item) =>
                    sum +
                    item.netSalary,
                0
            );
        }, [payrolls]);

    const totalPaid =
        useMemo(() => {
            return payrolls
                .filter(
                    item =>
                        item.status ===
                        'Paid'
                )
                .reduce(
                    (sum, item) =>
                        sum +
                        item.netSalary,
                    0
                );
        }, [payrolls]);

    const totalPending =
        useMemo(() => {
            return payrolls
                .filter(
                    item =>
                        item.status ===
                        'Pending'
                )
                .reduce(
                    (sum, item) =>
                        sum +
                        item.netSalary,
                    0
                );
        }, [payrolls]);

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
            payrollNo: '',
            employeeName: '',
            position: '',
            branch: '',
            salaryMonth: '',
            basicSalary: '',
            allowance: '',
            deduction: '',
            paymentDate: '',
            paymentMethod: 'Cash',
            status: 'Pending',
        });
    };

    const handleSubmit = (
        e: React.FormEvent
    ) => {
        e.preventDefault();

        const basicSalary =
            Number(
                form.basicSalary
            );

        const allowance =
            Number(
                form.allowance
            );

        const deduction =
            Number(
                form.deduction
            );

        const netSalary =
            basicSalary +
            allowance -
            deduction;

        if (editingId) {
            setPayrolls(prev =>
                prev.map(item =>
                    item.id === editingId
                        ? {
                              ...item,
                              payrollNo:
                                  form.payrollNo,
                              employeeName:
                                  form.employeeName,
                              position:
                                  form.position,
                              branch:
                                  form.branch,
                              salaryMonth:
                                  form.salaryMonth,
                              basicSalary,
                              allowance,
                              deduction,
                              netSalary,
                              paymentDate:
                                  form.paymentDate,
                              paymentMethod:
                                  form.paymentMethod,
                              status:
                                  form.status,
                          }
                        : item
                )
            );
        } else {
            const newPayroll: PayrollItem =
                {
                    id: Date.now().toString(),
                    payrollNo:
                        form.payrollNo,
                    employeeName:
                        form.employeeName,
                    position:
                        form.position,
                    branch:
                        form.branch,
                    salaryMonth:
                        form.salaryMonth,
                    basicSalary,
                    allowance,
                    deduction,
                    netSalary,
                    paymentDate:
                        form.paymentDate,
                    paymentMethod:
                        form.paymentMethod,
                    status:
                        form.status,
                };

            setPayrolls(prev => [
                newPayroll,
                ...prev,
            ]);
        }

        resetForm();
    };

    const handleEdit = (
        item: PayrollItem
    ) => {
        setEditingId(item.id);

        setForm({
            payrollNo:
                item.payrollNo,
            employeeName:
                item.employeeName,
            position:
                item.position,
            branch: item.branch,
            salaryMonth:
                item.salaryMonth,
            basicSalary:
                item.basicSalary.toString(),
            allowance:
                item.allowance.toString(),
            deduction:
                item.deduction.toString(),
            paymentDate:
                item.paymentDate,
            paymentMethod:
                item.paymentMethod,
            status: item.status,
        });
    };

    const handleDelete = (
        id: string
    ) => {
        const confirmed =
            window.confirm(
                'Delete this payroll record?'
            );

        if (!confirmed) return;

        setPayrolls(prev =>
            prev.filter(
                item => item.id !== id
            )
        );
    };

    const inputClasses =
        'w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500';

    return (
        <Placeholder title="Payroll">

            {/* Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">

                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Total Payroll
                    </p>

                    <h2 className="text-2xl font-bold text-sky-600 mt-2">
                        $
                        {totalSalary.toFixed(
                            2
                        )}
                    </h2>
                </div>

                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Paid Salary
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
                        Pending Salary
                    </p>

                    <h2 className="text-2xl font-bold text-red-600 mt-2">
                        $
                        {totalPending.toFixed(
                            2
                        )}
                    </h2>
                </div>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">

                <input
                    type="text"
                    placeholder="Search payroll..."
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
                            ? 'Edit Payroll'
                            : 'Add Payroll'}
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
                        name="payrollNo"
                        placeholder="Payroll No"
                        value={
                            form.payrollNo
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
                        name="employeeName"
                        placeholder="Employee Name"
                        value={
                            form.employeeName
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
                        name="salaryMonth"
                        placeholder="Salary Month"
                        value={
                            form.salaryMonth
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
                        name="basicSalary"
                        placeholder="Basic Salary"
                        value={
                            form.basicSalary
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
                        name="allowance"
                        placeholder="Allowance"
                        value={
                            form.allowance
                        }
                        onChange={
                            handleChange
                        }
                        className={
                            inputClasses
                        }
                        min="0"
                    />

                    <input
                        type="number"
                        name="deduction"
                        placeholder="Deduction"
                        value={
                            form.deduction
                        }
                        onChange={
                            handleChange
                        }
                        className={
                            inputClasses
                        }
                        min="0"
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

                <div className="flex justify-end mt-4">
                    <button
                        type="submit"
                        className="bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-md"
                    >
                        {editingId
                            ? 'Update Payroll'
                            : 'Add Payroll'}
                    </button>
                </div>
            </form>

            {/* Table */}
            <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
                <table className="min-w-full bg-white dark:bg-gray-800">

                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-300">
                                Payroll No
                            </th>

                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-300">
                                Employee
                            </th>

                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-300">
                                Position
                            </th>

                            <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-gray-500 dark:text-gray-300">
                                Net Salary
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

                        {filteredPayrolls.length >
                        0 ? (
                            filteredPayrolls.map(
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
                                                    item.payrollNo
                                                }
                                            </div>

                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                                {
                                                    item.salaryMonth
                                                }
                                            </div>
                                        </td>

                                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                                            {
                                                item.employeeName
                                            }
                                        </td>

                                        <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                                            {
                                                item.position
                                            }
                                        </td>

                                        <td className="px-4 py-3 text-right text-sm font-semibold text-green-600">
                                            $
                                            {item.netSalary.toFixed(
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
                                        6
                                    }
                                    className="text-center py-8 text-gray-500 dark:text-gray-400"
                                >
                                    No payroll records
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

export default Payroll;