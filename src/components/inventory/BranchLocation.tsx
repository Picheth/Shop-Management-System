import React, { useMemo, useState } from 'react';
import Placeholder from '../ui/Placeholder';

interface BranchLocationItem {
    id: string;
    branchCode: string;
    branchName: string;
    locationName: string;
    manager: string;
    phone: string;
    address: string;
    status: 'Active' | 'Inactive';
}

const initialBranchLocations: BranchLocationItem[] = [
    {
        id: '1',
        branchCode: 'BRA-001',
        branchName: 'Main Branch',
        locationName: 'Phnom Penh',
        manager: 'Picheth',
        phone: '012345678',
        address: 'Street 271, Phnom Penh',
        status: 'Active',
    },
    {
        id: '2',
        branchCode: 'BRA-002',
        branchName: 'Toul Kork Branch',
        locationName: 'Toul Kork',
        manager: 'Dara',
        phone: '098765432',
        address: 'Toul Kork, Phnom Penh',
        status: 'Active',
    },
];

const BranchLocation: React.FC = () => {
    const [branches, setBranches] =
        useState<BranchLocationItem[]>(
            initialBranchLocations
        );

    const [search, setSearch] = useState('');

    const [editingId, setEditingId] =
        useState<string | null>(null);

    const [form, setForm] = useState({
        branchCode: '',
        branchName: '',
        locationName: '',
        manager: '',
        phone: '',
        address: '',
    });

    const filteredBranches = useMemo(() => {
        if (!search) return branches;

        const term = search.toLowerCase();

        return branches.filter(
            branch =>
                branch.branchCode
                    .toLowerCase()
                    .includes(term) ||
                branch.branchName
                    .toLowerCase()
                    .includes(term) ||
                branch.locationName
                    .toLowerCase()
                    .includes(term) ||
                branch.manager
                    .toLowerCase()
                    .includes(term)
        ); // Correctly filter branches
    }, [search, branches]);

    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement
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
            branchCode: '',
            branchName: '',
            locationName: '',
            manager: '',
            phone: '',
            address: '',
        });
    };

    const handleSubmit = (
        e: React.FormEvent
    ) => {
        e.preventDefault();

        if (editingId) {
            setBranches(prev =>
                prev.map(item =>
                    item.id === editingId
                        ? {
                              ...item,
                              ...form,
                          }
                        : item
                )
            );
        } else {
            const newBranch: BranchLocationItem = {
                id: Date.now().toString(),
                ...form,
                status: 'Active',
            };

            setBranches(prev => [
                newBranch,
                ...prev,
            ]);
        }

        resetForm();
    };

    const handleEdit = (
        branch: BranchLocationItem
    ) => {
        setEditingId(branch.id);

        setForm({
            branchCode: branch.branchCode,
            branchName: branch.branchName,
            locationName: branch.locationName,
            manager: branch.manager,
            phone: branch.phone,
            address: branch.address,
        });
    };

    const handleDelete = (id: string) => {
        const confirmed = window.confirm(
            'Delete this branch location?'
        );

        if (!confirmed) return;

        setBranches(prev =>
            prev.filter(item => item.id !== id)
        );
    };

    const toggleStatus = (id: string) => {
        setBranches(prev =>
            prev.map(item =>
                item.id === id
                    ? {
                          ...item,
                          status:
                              item.status ===
                              'Active'
                                  ? 'Inactive'
                                  : 'Active',
                      }
                    : item
            )
        );
    };

    const inputClasses =
        'w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500';

    return (
        <Placeholder title="Branch & Location Management">

            {/* Search */}
            <div className="mb-6">
                <input
                    type="text"
                    placeholder="Search branch..."
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
                            ? 'Edit Branch'
                            : 'Add Branch'}
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
                        name="branchCode"
                        placeholder="Branch Code"
                        value={form.branchCode}
                        onChange={handleChange}
                        className={inputClasses}
                        required
                    />

                    <input
                        type="text"
                        name="branchName"
                        placeholder="Branch Name"
                        value={form.branchName}
                        onChange={handleChange}
                        className={inputClasses}
                        required
                    />

                    <input
                        type="text"
                        name="locationName"
                        placeholder="Location"
                        value={form.locationName}
                        onChange={handleChange}
                        className={inputClasses}
                        required
                    />

                    <input
                        type="text"
                        name="manager"
                        placeholder="Manager Name"
                        value={form.manager}
                        onChange={handleChange}
                        className={inputClasses}
                    />

                    <input
                        type="text"
                        name="phone"
                        placeholder="Phone Number"
                        value={form.phone}
                        onChange={handleChange}
                        className={inputClasses}
                    />
                </div>

                <div className="mt-4">
                    <textarea
                        name="address"
                        placeholder="Address"
                        value={form.address}
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
                            ? 'Update Branch'
                            : 'Add Branch'}
                    </button>
                </div>
            </form>

            {/* Table */}
            <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
                <table className="min-w-full bg-white dark:bg-gray-800">

                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-300">
                                Code
                            </th>

                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-300">
                                Branch
                            </th>

                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-300">
                                Location
                            </th>

                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-300">
                                Manager
                            </th>

                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-300">
                                Phone
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

                        {filteredBranches.length > 0 ? (
                            filteredBranches.map(
                                branch => (
                                    <tr
                                        key={branch.id}
                                        className="hover:bg-gray-50 dark:hover:bg-gray-700"
                                    >
                                        <td className="px-4 py-3 text-sm font-medium text-sky-600 dark:text-sky-400">
                                            {
                                                branch.branchCode
                                            }
                                        </td>

                                        <td className="px-4 py-3">
                                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                {
                                                    branch.branchName
                                                }
                                            </div>

                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                                {
                                                    branch.address
                                                }
                                            </div>
                                        </td>

                                        <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                                            {
                                                branch.locationName
                                            }
                                        </td>

                                        <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                                            {
                                                branch.manager
                                            }
                                        </td>

                                        <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                                            {
                                                branch.phone
                                            }
                                        </td>

                                        <td className="px-4 py-3 text-center">
                                            <span
                                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                    branch.status ===
                                                    'Active'
                                                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                }`}
                                            >
                                                {
                                                    branch.status
                                                }
                                            </span>
                                        </td>

                                        <td className="px-4 py-3">
                                            <div className="flex justify-center gap-2">

                                                <button
                                                    onClick={() =>
                                                        handleEdit(
                                                            branch
                                                        )
                                                    }
                                                    className="px-3 py-1 text-sm bg-amber-500 hover:bg-amber-600 text-white rounded"
                                                >
                                                    Edit
                                                </button>

                                                <button
                                                    onClick={() =>
                                                        toggleStatus(
                                                            branch.id
                                                        )
                                                    }
                                                    className="px-3 py-1 text-sm bg-sky-600 hover:bg-sky-700 text-white rounded"
                                                >
                                                    Toggle
                                                </button>

                                                <button
                                                    onClick={() =>
                                                        handleDelete(
                                                            branch.id
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
                                    No branches found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </Placeholder>
    );
};

export default BranchLocation;