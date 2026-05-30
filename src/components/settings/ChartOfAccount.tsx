import React, { useMemo, useState } from 'react';
import Placeholder from '../ui/Placeholder';
import { useDuplicateValidation } from './useDuplicateValidation';

interface AccountItem {
    id: string;
    accountCode: string;
    accountName: string;
    accountType:
        | 'Asset'
        | 'Liability'
        | 'Equity'
        | 'Revenue'
        | 'Expense';
    balance: number;
    description: string;
    status: 'Active' | 'Inactive';
}

const initialAccounts: AccountItem[] = [
    {
        id: '1',
        accountCode: '1000',
        accountName: 'Cash on Hand',
        accountType: 'Asset',
        balance: 4500,
        description: 'Main cash account',
        status: 'Active',
    },
    {
        id: '2',
        accountCode: '2000',
        accountName: 'Accounts Payable',
        accountType: 'Liability',
        balance: 1800,
        description: 'Supplier payable account',
        status: 'Active',
    },
    {
        id: '3',
        accountCode: '4000',
        accountName: 'Sales Revenue',
        accountType: 'Revenue',
        balance: 12000,
        description: 'Product sales income',
        status: 'Active',
    },
];

const ChartOfAccount: React.FC = () => {
    const [accounts, setAccounts] =
        useState<AccountItem[]>(initialAccounts);

    const [search, setSearch] = useState('');

    const [editingId, setEditingId] =
        useState<string | null>(null);

    const [form, setForm] = useState({
        accountCode: '',
        accountName: '',
        accountType: 'Asset' as
            | 'Asset'
            | 'Liability'
            | 'Equity'
            | 'Revenue'
            | 'Expense',
        balance: '',
        description: '',
    });

    const { isDuplicate, isValidating } = useDuplicateValidation('chart_of_accounts', 'accountCode', form.accountCode, editingId);

    const filteredAccounts = useMemo(() => {
        if (!search) return accounts;

        const term = search.toLowerCase();

        return accounts.filter(
            account =>
                account.accountCode
                    .toLowerCase()
                    .includes(term) ||
                account.accountName
                    .toLowerCase()
                    .includes(term) ||
                account.accountType
                    .toLowerCase()
                    .includes(term)
        );
    }, [accounts, search]);

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
            accountCode: '',
            accountName: '',
            accountType: 'Asset',
            balance: '',
            description: '',
        });
    };

    const handleSubmit = async (
        e: React.FormEvent
    ) => {
        e.preventDefault();

        if (isDuplicate) {
            alert(`Account code "${form.accountCode}" already exists.`);
            return;
        }

        if (editingId) {
            setAccounts(prev =>
                prev.map(item =>
                    item.id === editingId
                        ? {
                              ...item,
                              accountCode:
                                  form.accountCode,
                              accountName:
                                  form.accountName,
                              accountType:
                                  form.accountType,
                              balance: Number(
                                  form.balance
                              ),
                              description:
                                  form.description,
                          }
                        : item
                )
            );
        } else {
            const newAccount: AccountItem = {
                id: Date.now().toString(),
                accountCode: form.accountCode,
                accountName: form.accountName,
                accountType: form.accountType,
                balance: Number(form.balance),
                description: form.description,
                status: 'Active',
            };

            setAccounts(prev => [
                newAccount,
                ...prev,
            ]);
        }

        resetForm();
    };

    const handleEdit = (
        account: AccountItem
    ) => {
        setEditingId(account.id);

        setForm({
            accountCode: account.accountCode,
            accountName: account.accountName,
            accountType: account.accountType,
            balance: account.balance.toString(),
            description: account.description,
        });
    };

    const handleDelete = (id: string) => {
        const confirmed = window.confirm(
            'Delete this account?'
        );

        if (!confirmed) return;

        setAccounts(prev =>
            prev.filter(item => item.id !== id)
        );
    };

    const toggleStatus = (id: string) => {
        setAccounts(prev =>
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
        <Placeholder title="Chart of Account">

            {/* Search */}
            <div className="mb-6">
                <input
                    type="text"
                    placeholder="Search account..."
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
                            ? 'Edit Account'
                            : 'Add Account'}
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
                        name="accountCode"
                        placeholder="Account Code"
                        value={form.accountCode}
                        onChange={handleChange}
                        className={inputClasses}
                        required
                    />

                    <input
                        type="text"
                        name="accountName"
                        placeholder="Account Name"
                        value={form.accountName}
                        onChange={handleChange}
                        className={inputClasses}
                        required
                    />

                    <select
                        name="accountType"
                        value={form.accountType}
                        onChange={handleChange}
                        className={inputClasses}
                    >
                        <option value="Asset">
                            Asset
                        </option>

                        <option value="Liability">
                            Liability
                        </option>

                        <option value="Equity">
                            Equity
                        </option>

                        <option value="Revenue">
                            Revenue
                        </option>

                        <option value="Expense">
                            Expense
                        </option>
                    </select>

                    <input
                        type="number"
                        name="balance"
                        placeholder="Balance"
                        value={form.balance}
                        onChange={handleChange}
                        className={inputClasses}
                        min="0"
                        required
                    />
                </div>

                <div className="mt-4">
                    <textarea
                        name="description"
                        placeholder="Description"
                        value={form.description}
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
                            ? 'Update Account'
                            : 'Add Account'}
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
                                Account Name
                            </th>

                            <th className="px-4 py-3 text-center text-xs font-semibold uppercase text-gray-500 dark:text-gray-300">
                                Type
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

                        {filteredAccounts.length > 0 ? (
                            filteredAccounts.map(
                                account => (
                                    <tr
                                        key={
                                            account.id
                                        }
                                        className="hover:bg-gray-50 dark:hover:bg-gray-700"
                                    >
                                        <td className="px-4 py-3 text-sm font-medium text-sky-600 dark:text-sky-400">
                                            {
                                                account.accountCode
                                            }
                                        </td>

                                        <td className="px-4 py-3">
                                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                {
                                                    account.accountName
                                                }
                                            </div>

                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                                {
                                                    account.description
                                                }
                                            </div>
                                        </td>

                                        <td className="px-4 py-3 text-center">
                                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400">
                                                {
                                                    account.accountType
                                                }
                                            </span>
                                        </td>

                                        <td className="px-4 py-3 text-sm text-right font-semibold text-gray-900 dark:text-white">
                                            $
                                            {account.balance.toFixed(
                                                2
                                            )}
                                        </td>

                                        <td className="px-4 py-3 text-center">
                                            <span
                                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                    account.status ===
                                                    'Active'
                                                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                }`}
                                            >
                                                {
                                                    account.status
                                                }
                                            </span>
                                        </td>

                                        <td className="px-4 py-3">
                                            <div className="flex justify-center gap-2">

                                                <button
                                                    onClick={() =>
                                                        handleEdit(
                                                            account
                                                        )
                                                    }
                                                    className="px-3 py-1 text-sm bg-amber-500 hover:bg-amber-600 text-white rounded"
                                                >
                                                    Edit
                                                </button>

                                                <button
                                                    onClick={() =>
                                                        toggleStatus(
                                                            account.id
                                                        )
                                                    }
                                                    className="px-3 py-1 text-sm bg-sky-600 hover:bg-sky-700 text-white rounded"
                                                >
                                                    Toggle
                                                </button>

                                                <button
                                                    onClick={() =>
                                                        handleDelete(
                                                            account.id
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
                                    colSpan={6}
                                    className="text-center py-8 text-gray-500 dark:text-gray-400"
                                >
                                    No accounts found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </Placeholder>
    );
};

export default ChartOfAccount;