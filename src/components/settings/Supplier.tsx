import React, { useMemo, useState } from 'react';
import Placeholder from '../ui/Placeholder';
import SettingsForm from '../ui/SettingsForm';
import FormInput from '../ui/FormInput';
import FormSelect from '../ui/FormSelect';
import { useDuplicateValidation } from './useDuplicateValidation';
import { useFormValidation } from './useFormValidation';

interface SupplierItem {
    id: string;
    supplierCode: string;
    supplierName: string;
    shortName: string;
    contactPerson: string;
    phone: string;
    email: string;
    address: string;
    status: 'Active' | 'Inactive';
}

const initialSuppliers: SupplierItem[] = [
    {
        id: '1',
        supplierCode: 'SU400',
        supplierName: 'LH Main Supplier',
        shortName: 'LH',
        contactPerson: 'Li Hay',
        phone: '012345678',
        email: 'lh@example.com',
        address: 'Phnom Penh',
        status: 'Active',
    },
    {
        id: '2',
        supplierCode: 'SU401',
        supplierName: 'LH Used Products',
        shortName: 'LHU',
        contactPerson: 'Li Hay',
        phone: '098765432',
        email: 'used@example.com',
        address: 'Phnom Penh',
        status: 'Active',
    },
];

const Supplier: React.FC = () => {
    const [suppliers, setSuppliers] =
        useState<SupplierItem[]>(initialSuppliers);

    const [search, setSearch] = useState('');

    const [editingId, setEditingId] = useState<
        string | null
    >(null);

    const [statusFilter, setStatusFilter] = useState('All');

    const [form, setForm] = useState({
        supplierCode: '',
        supplierName: '',
        shortName: '',
        contactPerson: '',
        phone: '',
        email: '',
        address: '',
        status: 'Active' as 'Active' | 'Inactive',
    });

    const { isDuplicate, isValidating } = useDuplicateValidation('suppliers', 'supplierCode', form.supplierCode, editingId);

    const { isInvalid, errors: fieldErrors } = useFormValidation(form, {
        required: ['supplierCode', 'supplierName', 'phone'],
        phone: ['phone'],
        email: ['email'],
        labels: {
            supplierCode: 'Supplier Code',
            supplierName: 'Supplier Name',
            phone: 'Phone Number',
            email: 'Email Address'
        }
    });

    const filteredSuppliers = useMemo(() => {
        let filtered = suppliers;

        if (statusFilter !== 'All') {
            filtered = filtered.filter(s => s.status === statusFilter);
        }

        if (!search) return filtered;

        const term = search.toLowerCase();

        return filtered.filter(
            supplier =>
                supplier.supplierCode
                    .toLowerCase()
                    .includes(term) ||
                supplier.supplierName
                    .toLowerCase()
                    .includes(term) ||
                supplier.shortName
                    .toLowerCase()
                    .includes(term) ||
                supplier.contactPerson
                    .toLowerCase()
                    .includes(term)
        );
    }, [search, suppliers, statusFilter]);

    const handleChange = (
  e: React.ChangeEvent<
    | HTMLInputElement
    | HTMLTextAreaElement
    | HTMLSelectElement
  >
) => {
        setForm(prev => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const resetForm = () => {
        setForm({
            supplierCode: '',
            supplierName: '',
            shortName: '',
            contactPerson: '',
            phone: '',
            email: '',
            address: '',
            status: 'Active',
        });

        setEditingId(null);
    };

    const handleSubmit = (
        e: React.FormEvent
    ) => {
        e.preventDefault();

        if (editingId) {
            setSuppliers(prev =>
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
            const newSupplier: SupplierItem = {
                id: Date.now().toString(),
                ...form,
                status: 'Active',
            };

            setSuppliers(prev => [
                newSupplier,
                ...prev,
            ]);
        }

        resetForm();
    };

    const handleEdit = (
        supplier: SupplierItem
    ) => {
        setEditingId(supplier.id);

        setForm({
            supplierCode: supplier.supplierCode,
            supplierName: supplier.supplierName,
            shortName: supplier.shortName,
            contactPerson:
                supplier.contactPerson,
            phone: supplier.phone,
            email: supplier.email,
            address: supplier.address,
            status: supplier.status,
        });
    };

    const handleDelete = (id: string) => {
        const confirmed = window.confirm(
            'Delete this supplier?'
        );

        if (!confirmed) return;

        setSuppliers(prev =>
            prev.filter(item => item.id !== id)
        );
    };

    const toggleStatus = (id: string) => {
        setSuppliers(prev =>
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
        <Placeholder title="Supplier Management">

            {/* Search */}
            <div className="mb-6 flex flex-col sm:flex-row gap-4">
                <input
                    type="text"
                    placeholder="Search supplier..."
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
                title={editingId ? 'Edit Supplier' : 'Add Supplier'}
                isEditing={!!editingId}
                onCancel={resetForm}
                onSubmit={handleSubmit}
                isValidating={isValidating}
                isDuplicate={isDuplicate}
                isDisabled={isInvalid}
                submitLabel={editingId ? 'Update Supplier' : 'Add Supplier'}
            >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <FormInput
                        label="Supplier Code"
                        name="supplierCode"
                        placeholder="e.g. SUP-001"
                        value={form.supplierCode}
                        onChange={handleChange}
                        isValidating={isValidating}
                        isDuplicate={isDuplicate}
                        error={fieldErrors.supplierCode}
                        required
                    />

                    <FormInput
                        label="Supplier Name"
                        name="supplierName"
                        placeholder="e.g. Global Tech Solutions"
                        value={form.supplierName}
                        onChange={handleChange}
                        error={fieldErrors.supplierName}
                        required
                    />

                    <FormInput
                        label="Short Name"
                        name="shortName"
                        placeholder="e.g. GlobalTech"
                        value={form.shortName}
                        onChange={handleChange}
                        required
                    />

                    <FormInput
                        label="Contact Person"
                        name="contactPerson"
                        placeholder="Name of primary contact"
                        value={form.contactPerson}
                        onChange={handleChange}
                        required
                    />

                    <FormInput
                        label="Phone Number"
                        type="tel"
                        name="phone"
                        placeholder="e.g. +855..."
                        value={form.phone}
                        onChange={handleChange}
                        error={fieldErrors.phone}
                        required
                    />

                    <FormInput
                        label="Email Address"
                        type="email"
                        name="email"
                        placeholder="e.g. contact@supplier.com"
                        value={form.email}
                        onChange={handleChange}
                        error={fieldErrors.email}
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
                                Supplier
                            </th>

                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-300">
                                Contact
                            </th>

                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-300">
                                Phone
                            </th>

                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-300">
                                Email
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

                        {filteredSuppliers.length > 0 ? (
                            filteredSuppliers.map(
                                supplier => (
                                    <tr
                                        key={
                                            supplier.id
                                        }
                                        className="hover:bg-gray-50 dark:hover:bg-gray-700"
                                    >
                                        <td className="px-4 py-3 text-sm font-medium text-sky-600 dark:text-sky-400">
                                            {
                                                supplier.supplierCode
                                            }
                                        </td>

                                        <td className="px-4 py-3">
                                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                {
                                                    supplier.supplierName
                                                }
                                            </div>

                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                                {
                                                    supplier.shortName
                                                }
                                            </div>
                                        </td>

                                        <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                                            {
                                                supplier.contactPerson
                                            }
                                        </td>

                                        <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                                            {
                                                supplier.phone
                                            }
                                        </td>

                                        <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                                            {
                                                supplier.email
                                            }
                                        </td>

                                        <td className="px-4 py-3 text-center">
                                            <span
                                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                    supplier.status ===
                                                    'Active'
                                                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                }`}
                                            >
                                                {
                                                    supplier.status
                                                }
                                            </span>
                                        </td>

                                        <td className="px-4 py-3">
                                            <div className="flex justify-center gap-2">

                                                <button
                                                    onClick={() =>
                                                        handleEdit(
                                                            supplier
                                                        )
                                                    }
                                                    className="px-3 py-1 text-sm bg-amber-500 hover:bg-amber-600 text-white rounded"
                                                >
                                                    Edit
                                                </button>

                                                <button
                                                    onClick={() =>
                                                        toggleStatus(
                                                            supplier.id
                                                        )
                                                    }
                                                    className="px-3 py-1 text-sm bg-sky-600 hover:bg-sky-700 text-white rounded"
                                                >
                                                    Toggle
                                                </button>

                                                <button
                                                    onClick={() =>
                                                        handleDelete(
                                                            supplier.id
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
                                    No suppliers found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </Placeholder>
    );
};

export default Supplier;