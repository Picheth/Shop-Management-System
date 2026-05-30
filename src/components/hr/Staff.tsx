import React, { useMemo, useState } from 'react';
import Placeholder from '../ui/Placeholder';
import SettingsForm from '../ui/SettingsForm';
import FormInput from '../ui/FormInput';
import FormSelect from '../ui/FormSelect';
import { useDuplicateValidation } from '../settings/useDuplicateValidation';
import { useFormValidation } from '../settings/useFormValidation';
import { Staff as StaffType } from '../../types';

const initialStaff: StaffType[] = [
    {
        id: '1',
        code: 'EMP-001',
        name: 'Admin User',
        role: 'Manager',
        phone: '012345678',
        email: 'admin@store.com',
        address: 'Phnom Penh',
        active: true,
    },
    {
        id: '2',
        code: 'EMP-002',
        name: 'Sok Dara',
        role: 'Sales',
        phone: '098765432',
        email: 'dara@store.com',
        address: 'Siem Reap',
        active: true,
    },
];

const Staff: React.FC = () => {
    const [staffList, setStaffList] = useState<StaffType[]>(initialStaff);
    const [search, setSearch] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [statusFilter, setStatusFilter] = useState('All');

    const [form, setForm] = useState({
        code: '',
        name: '',
        role: '',
        phone: '',
        email: '',
        address: '',
        active: true,
    });

    // Real-time duplication check for staff code
    const { isDuplicate, isValidating } = useDuplicateValidation('staff', 'code', form.code, editingId);

    const { isInvalid, errors: fieldErrors } = useFormValidation(form, {
        required: ['code', 'name'],
        phone: ['phone'],
        email: ['email'],
        labels: {
            code: 'Staff Code',
            name: 'Full Name',
            phone: 'Phone Number',
            email: 'Email Address'
        }
    });

    const filteredStaff = useMemo(() => {
        let filtered = staffList;

        if (statusFilter !== 'All') {
            const isActive = statusFilter === 'Active';
            filtered = filtered.filter(s => s.active === isActive);
        }

        if (!search) return filtered;

        const term = search.toLowerCase();
        return filtered.filter(
            s =>
                s.code.toLowerCase().includes(term) ||
                s.name.toLowerCase().includes(term) ||
                (s.role || '').toLowerCase().includes(term) ||
                (s.phone || '').toLowerCase().includes(term)
        );
    }, [search, staffList, statusFilter]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: name === 'active' ? value === 'true' : value,
        }));
    };

    const resetForm = () => {
        setForm({
            code: '',
            name: '',
            role: '',
            phone: '',
            email: '',
            address: '',
            active: true,
        });
        setEditingId(null);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (editingId) {
            setStaffList(prev =>
                prev.map(item =>
                    item.id === editingId
                        ? { ...item, ...form, updatedAt: new Date().toISOString() }
                        : item
                )
            );
        } else {
            const newStaff: StaffType = {
                id: Date.now().toString(),
                ...form,
                createdAt: new Date().toISOString(),
            };
            setStaffList(prev => [newStaff, ...prev]);
        }

        resetForm();
    };

    const handleEdit = (staff: StaffType) => {
        setEditingId(staff.id);
        setForm({
            code: staff.code,
            name: staff.name,
            role: staff.role || '',
            phone: staff.phone || '',
            email: staff.email || '',
            address: staff.address || '',
            active: staff.active ?? true,
        });
    };

    const handleDelete = (id: string) => {
        if (!window.confirm('Are you sure you want to delete this staff member?')) return;
        setStaffList(prev => prev.filter(item => item.id !== id));
    };

    const toggleStatus = (id: string) => {
        setStaffList(prev =>
            prev.map(item =>
                item.id === id ? { ...item, active: !item.active } : item
            )
        );
    };

    return (
        <Placeholder title="Staff Management">
            {/* Search & Filter */}
            <div className="mb-6 flex flex-col sm:flex-row gap-4">
                <input
                    type="text"
                    placeholder="Search staff by name, code, role..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
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
                title={editingId ? 'Edit Staff Member' : 'Add New Staff'}
                isEditing={!!editingId}
                onCancel={resetForm}
                onSubmit={handleSubmit}
                isValidating={isValidating}
                isDuplicate={isDuplicate}
                isDisabled={isInvalid}
                submitLabel={editingId ? 'Update Staff' : 'Add Staff'}
            >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <FormInput
                        label="Staff Code"
                        name="code"
                        placeholder="e.g. EMP-001"
                        value={form.code}
                        onChange={handleChange}
                        isValidating={isValidating}
                        isDuplicate={isDuplicate}
                        error={fieldErrors.code}
                        required
                    />

                    <FormInput
                        label="Full Name"
                        name="name"
                        placeholder="Enter full name"
                        value={form.name}
                        onChange={handleChange}
                        error={fieldErrors.name}
                        required
                    />

                    <FormInput
                        label="Role"
                        name="role"
                        placeholder="e.g. Sales, Manager"
                        value={form.role}
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

                    <FormInput
                        label="Email Address"
                        type="email"
                        name="email"
                        placeholder="e.g. email@example.com"
                        value={form.email}
                        onChange={handleChange}
                        error={fieldErrors.email}
                    />

                    <FormSelect
                        label="Status"
                        name="active"
                        value={form.active.toString()}
                        onChange={handleChange}
                        options={[
                            { value: 'true', label: 'Active' },
                            { value: 'false', label: 'Inactive' },
                        ]}
                        required
                    />
                </div>

                <div className="mt-4">
                    <FormInput
                        label="Address"
                        isTextArea
                        name="address"
                        placeholder="Enter residence address..."
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
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-300">Code</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-300">Staff Member</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-300">Role</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-300">Contact</th>
                            <th className="px-4 py-3 text-center text-xs font-semibold uppercase text-gray-500 dark:text-gray-300">Status</th>
                            <th className="px-4 py-3 text-center text-xs font-semibold uppercase text-gray-500 dark:text-gray-300">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {filteredStaff.length > 0 ? (
                            filteredStaff.map(staff => (
                                <tr key={staff.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                    <td className="px-4 py-3 text-sm font-medium text-sky-600 dark:text-sky-400">{staff.code}</td>
                                    <td className="px-4 py-3">
                                        <div className="text-sm font-medium text-gray-900 dark:text-white">{staff.name}</div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">{staff.address}</div>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{staff.role || '-'}</td>
                                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                                        <div>{staff.phone}</div>
                                        <div className="text-xs text-gray-500">{staff.email}</div>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${staff.active ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                                            {staff.active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex justify-center gap-2">
                                            <button onClick={() => handleEdit(staff)} className="px-3 py-1 text-sm bg-amber-500 hover:bg-amber-600 text-white rounded">Edit</button>
                                            <button onClick={() => toggleStatus(staff.id)} className="px-3 py-1 text-sm bg-sky-600 hover:bg-sky-700 text-white rounded">Toggle</button>
                                            <button onClick={() => handleDelete(staff.id)} className="px-3 py-1 text-sm bg-red-500 hover:bg-red-600 text-white rounded">Delete</button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={6} className="text-center py-8 text-gray-500 dark:text-gray-400">No staff members found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </Placeholder>
    );
};

export default Staff;