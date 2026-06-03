import React, { useMemo, useState } from 'react';
import Placeholder from '../ui/Placeholder';
import SettingsForm from '../ui/SettingsForm';
import FormInput from '../ui/FormInput';
import FormSelect from '../ui/FormSelect';
import { useDuplicateValidation } from '../../hooks/useDuplicateValidation';
import { useFormValidation } from '../../hooks/useFormValidation';

interface ContactItem {
    id: string;
    name: string;
    company: string;
    phone: string;
    email: string;
    address: string;
    type: 'Customer' | 'Supplier' | 'Partner';
    status: 'Active' | 'Inactive';
}

const initialContacts: ContactItem[] = [
    {
        id: '1',
        name: 'John Smith',
        company: 'Tech Mobile',
        phone: '012345678',
        email: 'john@techmobile.com',
        address: 'Phnom Penh',
        type: 'Customer',
        status: 'Active',
    },
    {
        id: '2',
        name: 'Li Hay',
        company: 'LH Supplier',
        phone: '098765432',
        email: 'lihay@example.com',
        address: 'Siem Reap',
        type: 'Supplier',
        status: 'Active',
    },
];

const Contact: React.FC = () => {
    const [contacts, setContacts] =
        useState<ContactItem[]>(initialContacts);

    const [search, setSearch] = useState('');

    const [editingId, setEditingId] =
        useState<string | null>(null);

    const [statusFilter, setStatusFilter] = useState('All');

    const [form, setForm] = useState({
        name: '',
        company: '',
        phone: '',
        email: '',
        address: '',
        type: 'Customer' as
            | 'Customer'
            | 'Supplier'
            | 'Partner',
        status: 'Active' as 'Active' | 'Inactive',
    });

    const { isDuplicate, isValidating } = useDuplicateValidation('contacts', 'name', form.name, editingId);

    const { isInvalid, errors: fieldErrors } = useFormValidation(form, {
        required: ['name', 'phone'],
        phone: ['phone'],
        email: ['email'],
        labels: {
            name: 'Full Name',
            phone: 'Phone Number',
            email: 'Email Address'
        }
    });

    const filteredContacts = useMemo(() => {
        let filtered = contacts;

        if (statusFilter !== 'All') {
            filtered = filtered.filter(c => c.status === statusFilter);
        }

        if (!search) return filtered;

        const term = search.toLowerCase();

        return filtered.filter(
            contact =>
                contact.name
                    .toLowerCase()
                    .includes(term) ||
                contact.company
                    .toLowerCase()
                    .includes(term) ||
                contact.phone
                    .toLowerCase()
                    .includes(term) ||
                contact.email
                    .toLowerCase()
                    .includes(term)
        );
    }, [contacts, search, statusFilter]);

    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement |
            HTMLTextAreaElement |
            HTMLSelectElement
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
            name: '',
            company: '',
            phone: '',
            email: '',
            address: '',
            type: 'Customer',
            status: 'Active',
        });
    };

    const handleSubmit = (
        e: React.FormEvent
    ) => {
        e.preventDefault();

        if (editingId) {
            setContacts(prev =>
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
            const newContact: ContactItem = {
                id: Date.now().toString(),
                ...form,
            };

            setContacts(prev => [
                newContact,
                ...prev,
            ]);
        }

        resetForm();
    };

    const handleEdit = (
        contact: ContactItem
    ) => {
        setEditingId(contact.id);

        setForm({
            name: contact.name,
            company: contact.company,
            phone: contact.phone,
            email: contact.email,
            address: contact.address,
            type: contact.type,
            status: contact.status,
        });
    };

    const handleDelete = (id: string) => {
        const confirmed = window.confirm(
            'Delete this contact?'
        );

        if (!confirmed) return;

        setContacts(prev =>
            prev.filter(item => item.id !== id)
        );
    };

    const toggleStatus = (id: string) => {
        setContacts(prev =>
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
        <Placeholder title="Contact Management">

            {/* Search */}
            <div className="mb-6 flex flex-col sm:flex-row gap-4">
                <input
                    type="text"
                    placeholder="Search contact..."
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
                title={editingId ? 'Edit Contact' : 'Add Contact'}
                isEditing={!!editingId}
                onCancel={resetForm}
                onSubmit={handleSubmit}
                isValidating={isValidating}
                isDuplicate={isDuplicate}
                isDisabled={isInvalid}
                submitLabel={editingId ? 'Update Contact' : 'Add Contact'}
            >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <FormInput
                        label="Full Name"
                        name="name"
                        placeholder="e.g. John Doe"
                        value={form.name}
                        onChange={handleChange}
                        isValidating={isValidating}
                        isDuplicate={isDuplicate}
                        error={fieldErrors.name}
                        required
                    />

                    <FormInput
                        label="Company"
                        name="company"
                        placeholder="e.g. Acme Corp"
                        value={form.company}
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
                        required
                    />

                    <FormInput
                        label="Email Address"
                        type="email"
                        name="email"
                        placeholder="e.g. john@example.com"
                        value={form.email}
                        onChange={handleChange}
                        error={fieldErrors.email}
                    />

                    <FormSelect
                        label="Contact Type"
                        name="type"
                        value={form.type}
                        onChange={handleChange}
                        options={[
                            { value: 'Customer', label: 'Customer' },
                            { value: 'Supplier', label: 'Supplier' },
                            { value: 'Partner', label: 'Partner' },
                        ]}
                        required
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
                        placeholder="Full contact address..."
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
                                Name
                            </th>

                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-300">
                                Company
                            </th>

                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-300">
                                Phone
                            </th>

                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-300">
                                Email
                            </th>

                            <th className="px-4 py-3 text-center text-xs font-semibold uppercase text-gray-500 dark:text-gray-300">
                                Type
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

                        {filteredContacts.length > 0 ? (
                            filteredContacts.map(
                                contact => (
                                    <tr
                                        key={
                                            contact.id
                                        }
                                        className="hover:bg-gray-50 dark:hover:bg-gray-700"
                                    >
                                        <td className="px-4 py-3">
                                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                {
                                                    contact.name
                                                }
                                            </div>

                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                                {
                                                    contact.address
                                                }
                                            </div>
                                        </td>

                                        <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                                            {
                                                contact.company
                                            }
                                        </td>

                                        <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                                            {
                                                contact.phone
                                            }
                                        </td>

                                        <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                                            {
                                                contact.email
                                            }
                                        </td>

                                        <td className="px-4 py-3 text-center">
                                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400">
                                                {
                                                    contact.type
                                                }
                                            </span>
                                        </td>

                                        <td className="px-4 py-3 text-center">
                                            <span
                                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                    contact.status ===
                                                    'Active'
                                                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                }`}
                                            >
                                                {
                                                    contact.status
                                                }
                                            </span>
                                        </td>

                                        <td className="px-4 py-3">
                                            <div className="flex justify-center gap-2">

                                                <button
                                                    onClick={() =>
                                                        handleEdit(
                                                            contact
                                                        )
                                                    }
                                                    className="px-3 py-1 text-sm bg-amber-500 hover:bg-amber-600 text-white rounded"
                                                >
                                                    Edit
                                                </button>

                                                <button
                                                    onClick={() =>
                                                        toggleStatus(
                                                            contact.id
                                                        )
                                                    }
                                                    className="px-3 py-1 text-sm bg-sky-600 hover:bg-sky-700 text-white rounded"
                                                >
                                                    Toggle
                                                </button>

                                                <button
                                                    onClick={() =>
                                                        handleDelete(
                                                            contact.id
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
                                    No contacts found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </Placeholder>
    );
};

export default Contact;