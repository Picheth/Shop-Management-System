import React, { useMemo, useState } from 'react';
import Placeholder from '../ui/Placeholder';
import SettingsForm from '../ui/SettingsForm';
import FormInput from '../ui/FormInput';
import FormSelect from '../ui/FormSelect';
import { useDuplicateValidation } from '../../hooks/useDuplicateValidation';
import { useFormValidation } from '../../hooks/useFormValidation';
import { Branch as BranchType } from '../../types';


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

    const [statusFilter, setStatusFilter] = useState('All');

    const [form, setForm] = useState({
        branchCode: '',
        branchName: '',
        locationName: '',
        manager: '',
        phone: '',
        address: '',
        status: 'Active' as 'Active' | 'Inactive',
    });

    const { isDuplicate, isValidating } = useDuplicateValidation('branches', 'branchCode', form.branchCode, editingId);

    const { isInvalid, errors: fieldErrors } = useFormValidation(form, {
        required: ['branchCode', 'branchName', 'locationName'],
        phone: ['phone'],
        labels: {
            branchCode: 'Branch Code',
            branchName: 'Branch Name',
            locationName: 'Location',
            phone: 'Phone Number'
        }
    });

    const filteredBranches = useMemo(() => {
        let filtered = branches;

        if (statusFilter !== 'All') {
            filtered = filtered.filter(b => b.status === statusFilter);
        }

        if (!search) return filtered;

        const term = search.toLowerCase();

        return filtered.filter(
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
    }, [search, branches, statusFilter]);

    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
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
            status: 'Active',
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
            status: branch.status,
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

    return (
        <Placeholder title="Branch & Location Management">

            {/* Search */}
            <div className="mb-6 flex flex-col sm:flex-row gap-4">
                <input
                    type="text"
                    placeholder="Search branch..."
                    value={search}
                    onChange={e =>
                        setSearch(e.target.value)
                    }
                    className="flex-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />

                <select
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                    className="sm:w-48 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                    <option value="All">All Statuses</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                </select>
            </div>

            {/* Form */}
            <SettingsForm
                title={editingId ? 'Edit Branch' : 'Add Branch'}
                isEditing={!!editingId}
                onCancel={resetForm}
                onSubmit={handleSubmit}
                isValidating={isValidating}
                isDuplicate={isDuplicate}
                isDisabled={isInvalid}
                submitLabel={editingId ? 'Update Branch' : 'Add Branch'}
            >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <FormInput
                        label="Branch Code"
                        name="branchCode"
                        placeholder="e.g. BRA-001"
                        value={form.branchCode}
                        onChange={handleChange}
                        isValidating={isValidating}
                        isDuplicate={isDuplicate}
                        error={fieldErrors.branchCode}
                        required
                    />

                    <FormInput
                        label="Branch Name"
                        name="branchName"
                        placeholder="e.g. Main Branch"
                        value={form.branchName}
                        onChange={handleChange}
                        error={fieldErrors.branchName}
                        required
                    />

                    <FormInput
                        label="Location"
                        name="locationName"
                        placeholder="e.g. Phnom Penh"
                        value={form.locationName}
                        onChange={handleChange}
                        error={fieldErrors.locationName}
                        required
                    />

                    <FormInput
                        label="Manager"
                        name="manager"
                        placeholder="Name of manager"
                        value={form.manager}
                        onChange={handleChange}
                    />

                    <FormInput
                        label="Phone Number"
                        type="tel"
                        name="phone"
                        placeholder="e.g. 012 345 678"
                        value={form.phone}
                        onChange={handleChange}
                        error={fieldErrors.phone}
                    />

                    <FormSelect
                        label="Status"
                        name="status"
                        value={form.status}
                        onChange={handleChange}
                        options={[
                            { value: 'Active', label: 'Active' },
                            { value: 'Inactive', label: 'Inactive' },
                        ]}
                        required
                    />
                </div>

                <div className="mt-4">
                    <FormInput
                        label="Address"
                        isTextArea
                        name="address"
                        placeholder="Full physical address..."
                        value={form.address}
                        onChange={handleChange}
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