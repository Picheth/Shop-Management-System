import React, { useMemo, useState } from 'react';
import Placeholder from '../ui/Placeholder';

interface ProfitLossItem {
    id: string;
    name: string;
    type:
        | 'Income'
        | 'Expense';
    category: string;
    amount: number;
    date: string;
}

const initialData: ProfitLossItem[] = [
    {
        id: '1',
        name: 'Mobile Phone Sales',
        type: 'Income',
        category: 'Sales',
        amount: 18500,
        date: '2026-05-01',
    },
    {
        id: '2',
        name: 'Repair Service Income',
        type: 'Income',
        category: 'Service',
        amount: 4200,
        date: '2026-05-03',
    },
    {
        id: '3',
        name: 'Accessory Sales',
        type: 'Income',
        category: 'Sales',
        amount: 3500,
        date: '2026-05-05',
    },
    {
        id: '4',
        name: 'Shop Rent',
        type: 'Expense',
        category: 'Operating Expense',
        amount: 1800,
        date: '2026-05-02',
    },
    {
        id: '5',
        name: 'Staff Salary',
        type: 'Expense',
        category: 'Payroll',
        amount: 5200,
        date: '2026-05-10',
    },
    {
        id: '6',
        name: 'Electricity Bill',
        type: 'Expense',
        category: 'Utilities',
        amount: 450,
        date: '2026-05-12',
    },
    {
        id: '7',
        name: 'Marketing Expense',
        type: 'Expense',
        category: 'Advertising',
        amount: 600,
        date: '2026-05-14',
    },
];

const ProfitAndLoss: React.FC =
    () => {
        const [records] =
            useState<
                ProfitLossItem[]
            >(
                initialData
            );

        const [
            search,
            setSearch,
        ] = useState('');

        const [
            filterType,
            setFilterType,
        ] = useState<
            | 'All'
            | 'Income'
            | 'Expense'
        >('All');

        const filteredRecords =
            useMemo(() => {
                let filtered =
                    records;

                if (
                    filterType !==
                    'All'
                ) {
                    filtered =
                        filtered.filter(
                            item =>
                                item.type ===
                                filterType
                        );
                }

                if (search) {
                    const term =
                        search.toLowerCase();

                    filtered =
                        filtered.filter(
                            item =>
                                item.name
                                    .toLowerCase()
                                    .includes(
                                        term
                                    ) ||
                                item.category
                                    .toLowerCase()
                                    .includes(
                                        term
                                    )
                        );
                }

                return filtered;
            }, [
                records,
                search,
                filterType,
            ]);

        const incomeItems =
            records.filter(
                item =>
                    item.type ===
                    'Income'
            );

        const expenseItems =
            records.filter(
                item =>
                    item.type ===
                    'Expense'
            );

        const totalIncome =
            incomeItems.reduce(
                (
                    sum,
                    item
                ) =>
                    sum +
                    item.amount,
                0
            );

        const totalExpenses =
            expenseItems.reduce(
                (
                    sum,
                    item
                ) =>
                    sum +
                    item.amount,
                0
            );

        const netProfit =
            totalIncome -
            totalExpenses;

        const inputClasses =
            'w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500';

        return (
            <Placeholder title="Profits & Loss">

                {/* Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">

                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Total Income
                        </p>

                        <h2 className="text-2xl font-bold text-green-600 mt-2">
                            $
                            {totalIncome.toFixed(
                                2
                            )}
                        </h2>
                    </div>

                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Total Expenses
                        </p>

                        <h2 className="text-2xl font-bold text-red-500 mt-2">
                            $
                            {totalExpenses.toFixed(
                                2
                            )}
                        </h2>
                    </div>

                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Net Profit / Loss
                        </p>

                        <h2
                            className={`text-2xl font-bold mt-2 ${
                                netProfit >= 0
                                    ? 'text-sky-600'
                                    : 'text-red-500'
                            }`}
                        >
                            $
                            {netProfit.toFixed(
                                2
                            )}
                        </h2>
                    </div>
                </div>

                {/* Profit Banner */}
                <div
                    className={`rounded-2xl p-6 mb-6 text-white ${
                        netProfit >= 0
                            ? 'bg-gradient-to-r from-sky-600 to-blue-700'
                            : 'bg-gradient-to-r from-red-600 to-rose-700'
                    }`}
                >
                    <p className="text-sm uppercase tracking-wide opacity-80">
                        Business Performance
                    </p>

                    <h2 className="text-4xl font-bold mt-2">
                        {netProfit >= 0
                            ? 'Profit'
                            : 'Loss'}
                    </h2>

                    <p className="mt-2 text-lg">
                        $
                        {Math.abs(
                            netProfit
                        ).toFixed(2)}
                    </p>
                </div>

                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">

                    <input
                        type="text"
                        placeholder="Search records..."
                        value={
                            search
                        }
                        onChange={e =>
                            setSearch(
                                e.target
                                    .value
                            )
                        }
                        className={
                            inputClasses
                        }
                    />

                    <select
                        value={
                            filterType
                        }
                        onChange={e =>
                            setFilterType(
                                e.target
                                    .value as
                                    | 'All'
                                    | 'Income'
                                    | 'Expense'
                            )
                        }
                        className={
                            inputClasses
                        }
                    >
                        <option value="All">
                            All Types
                        </option>

                        <option value="Income">
                            Income
                        </option>

                        <option value="Expense">
                            Expense
                        </option>
                    </select>
                </div>

                {/* Table */}
                <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
                    <table className="min-w-full bg-white dark:bg-gray-800">

                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>

                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-300">
                                    Date
                                </th>

                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-300">
                                    Description
                                </th>

                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-300">
                                    Category
                                </th>

                                <th className="px-4 py-3 text-center text-xs font-semibold uppercase text-gray-500 dark:text-gray-300">
                                    Type
                                </th>

                                <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-gray-500 dark:text-gray-300">
                                    Amount
                                </th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">

                            {filteredRecords.length >
                            0 ? (
                                filteredRecords.map(
                                    item => (
                                        <tr
                                            key={
                                                item.id
                                            }
                                            className="hover:bg-gray-50 dark:hover:bg-gray-700"
                                        >

                                            <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                                                {
                                                    item.date
                                                }
                                            </td>

                                            <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                                                {
                                                    item.name
                                                }
                                            </td>

                                            <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                                                {
                                                    item.category
                                                }
                                            </td>

                                            <td className="px-4 py-3 text-center">
                                                <span
                                                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                        item.type ===
                                                        'Income'
                                                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                    }`}
                                                >
                                                    {
                                                        item.type
                                                    }
                                                </span>
                                            </td>

                                            <td
                                                className={`px-4 py-3 text-right text-sm font-semibold ${
                                                    item.type ===
                                                    'Income'
                                                        ? 'text-green-600'
                                                        : 'text-red-500'
                                                }`}
                                            >
                                                $
                                                {item.amount.toFixed(
                                                    2
                                                )}
                                            </td>
                                        </tr>
                                    )
                                )
                            ) : (
                                <tr>
                                    <td
                                        colSpan={
                                            5
                                        }
                                        className="text-center py-8 text-gray-500 dark:text-gray-400"
                                    >
                                        No records
                                        found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer */}
                <div className="mt-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">

                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Report Generated
                            </p>

                            <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                                {new Date().toLocaleDateString()}
                            </p>
                        </div>

                        <div className="text-right">
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Financial Status
                            </p>

                            <p
                                className={`text-sm font-semibold mt-1 ${
                                    netProfit >= 0
                                        ? 'text-green-600'
                                        : 'text-red-500'
                                }`}
                            >
                                {netProfit >= 0
                                    ? 'Profitable'
                                    : 'Loss'}
                            </p>
                        </div>
                    </div>
                </div>
            </Placeholder>
        );
    };

export default ProfitAndLoss;