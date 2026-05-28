import React, { useMemo, useState } from 'react';
import Placeholder from '../ui/Placeholder';

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

    const [form, setForm] = useState({
        supplierCode: '',
        supplierName: '',
        shortName: '',
        contactPerson: '',
        phone: '',
        email: '',
        address: '',
    });

    const filteredSuppliers = useMemo(() => {
        if (!search) return suppliers;

        const term = search.toLowerCase();

        return suppliers.filter(
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
    }, [search, suppliers]);

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
        setForm({
            supplierCode: '',
            supplierName: '',
            shortName: '',
            contactPerson: '',
            phone: '',
            email: '',
            address: '',
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

    const inputClasses =
        'w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500';

    return (
        <Placeholder title="Supplier Management">

            {/* Search */}
            <div className="mb-6">
                <input
                    type="text"
                    placeholder="Search supplier..."
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
                            ? 'Edit Supplier'
                            : 'Add Supplier'}
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
                        name="supplierCode"
                        placeholder="Supplier Code"
                        value={form.supplierCode}
                        onChange={handleChange}
                        className={inputClasses}
                        required
                    />

                    <input
                        type="text"
                        name="supplierName"
                        placeholder="Supplier Name"
                        value={form.supplierName}
                        onChange={handleChange}
                        className={inputClasses}
                        required
                    />

                    <input
                        type="text"
                        name="shortName"
                        placeholder="Short Name"
                        value={form.shortName}
                        onChange={handleChange}
                        className={inputClasses}
                        required
                    />

                    <input
                        type="text"
                        name="contactPerson"
                        placeholder="Contact Person"
                        value={form.contactPerson}
                        onChange={handleChange}
                        className={inputClasses}
                        required
                    />

                    <input
                        type="text"
                        name="phone"
                        placeholder="Phone Number"
                        value={form.phone}
                        onChange={handleChange}
                        className={inputClasses}
                        required
                    />

                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={form.email}
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
                            ? 'Update Supplier'
                            : 'Add Supplier'}
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