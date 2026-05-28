import React, { useMemo, useState } from 'react';
import Placeholder from '../ui/Placeholder';

interface IncomeItem {
    id: string;
    name: string;
    category:
        | 'Revenue'
        | 'Cost of Goods Sold'
        | 'Operating Expense'
        | 'Other Income'
        | 'Other Expense';
    amount: number;
}

const initialIncomeData: IncomeItem[] = [
    {
        id: '1',
        name: 'Product Sales',
        category: 'Revenue',
        amount: 48000,
    },
    {
        id: '2',
        name: 'Repair Service Revenue',
        category: 'Revenue',
        amount: 7500,
    },
    {
        id: '3',
        name: 'Accessories Sales',
        category: 'Revenue',
        amount: 6200,
    },
    {
        id: '4',
        name: 'Inventory Cost',
        category: 'Cost of Goods Sold',
        amount: 27500,
    },
    {
        id: '5',
        name: 'Staff Salary',
        category: 'Operating Expense',
        amount: 5200,
    },
    {
        id: '6',
        name: 'Shop Rental',
        category: 'Operating Expense',
        amount: 1800,
    },
    {
        id: '7',
        name: 'Electricity & Internet',
        category: 'Operating Expense',
        amount: 650,
    },
    {
        id: '8',
        name: 'Advertising Expense',
        category: 'Operating Expense',
        amount: 900,
    },
    {
        id: '9',
        name: 'Bank Interest',
        category: 'Other Income',
        amount: 120,
    },
    {
        id: '10',
        name: 'Bank Fee',
        category: 'Other Expense',
        amount: 60,
    },
];

const IncomeStatement: React.FC = () => {
    const [incomeData] =
        useState<IncomeItem[]>(
            initialIncomeData
        );

    const revenueItems =
        useMemo(
            () =>
                incomeData.filter(
                    item =>
                        item.category ===
                        'Revenue'
                ),
            [incomeData]
        );

    const cogsItems =
        useMemo(
            () =>
                incomeData.filter(
                    item =>
                        item.category ===
                        'Cost of Goods Sold'
                ),
            [incomeData]
        );

    const operatingExpenseItems =
        useMemo(
            () =>
                incomeData.filter(
                    item =>
                        item.category ===
                        'Operating Expense'
                ),
            [incomeData]
        );

    const otherIncomeItems =
        useMemo(
            () =>
                incomeData.filter(
                    item =>
                        item.category ===
                        'Other Income'
                ),
            [incomeData]
        );

    const otherExpenseItems =
        useMemo(
            () =>
                incomeData.filter(
                    item =>
                        item.category ===
                        'Other Expense'
                ),
            [incomeData]
        );

    const totalRevenue =
        revenueItems.reduce(
            (sum, item) =>
                sum +
                item.amount,
            0
        );

    const totalCOGS =
        cogsItems.reduce(
            (sum, item) =>
                sum +
                item.amount,
            0
        );

    const grossProfit =
        totalRevenue -
        totalCOGS;

    const totalOperatingExpenses =
        operatingExpenseItems.reduce(
            (sum, item) =>
                sum +
                item.amount,
            0
        );

    const operatingIncome =
        grossProfit -
        totalOperatingExpenses;

    const totalOtherIncome =
        otherIncomeItems.reduce(
            (sum, item) =>
                sum +
                item.amount,
            0
        );

    const totalOtherExpenses =
        otherExpenseItems.reduce(
            (sum, item) =>
                sum +
                item.amount,
            0
        );

    const netIncome =
        operatingIncome +
        totalOtherIncome -
        totalOtherExpenses;

    const renderSection = (
        title: string,
        items: IncomeItem[],
        total: number,
        totalColor: string
    ) => (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {title}
                </h2>
            </div>

            <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {items.map(item => (
                    <div
                        key={item.id}
                        className="flex justify-between items-center px-5 py-3"
                    >
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                            {item.name}
                        </span>

                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                            $
                            {item.amount.toFixed(
                                2
                            )}
                        </span>
                    </div>
                ))}
            </div>

            <div className="flex justify-between items-center px-5 py-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
                <span className="font-semibold text-gray-900 dark:text-white">
                    Total
                </span>

                <span
                    className={`font-bold ${totalColor}`}
                >
                    $
                    {total.toFixed(2)}
                </span>
            </div>
        </div>
    );

    return (
        <Placeholder title="Income Statement">

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">

                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Revenue
                    </p>

                    <h2 className="text-2xl font-bold text-sky-600 mt-2">
                        $
                        {totalRevenue.toFixed(
                            2
                        )}
                    </h2>
                </div>

                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Gross Profit
                    </p>

                    <h2 className="text-2xl font-bold text-green-600 mt-2">
                        $
                        {grossProfit.toFixed(
                            2
                        )}
                    </h2>
                </div>

                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Operating Income
                    </p>

                    <h2 className="text-2xl font-bold text-amber-500 mt-2">
                        $
                        {operatingIncome.toFixed(
                            2
                        )}
                    </h2>
                </div>

                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Net Income
                    </p>

                    <h2
                        className={`text-2xl font-bold mt-2 ${
                            netIncome >= 0
                                ? 'text-green-600'
                                : 'text-red-500'
                        }`}
                    >
                        $
                        {netIncome.toFixed(
                            2
                        )}
                    </h2>
                </div>
            </div>

            {/* Statement Sections */}
            <div className="space-y-6">

                {renderSection(
                    'Revenue',
                    revenueItems,
                    totalRevenue,
                    'text-sky-600'
                )}

                {renderSection(
                    'Cost of Goods Sold',
                    cogsItems,
                    totalCOGS,
                    'text-red-500'
                )}

                {/* Gross Profit */}
                <div className="bg-gradient-to-r from-green-600 to-emerald-700 rounded-2xl p-6 text-white">
                    <p className="text-sm uppercase tracking-wide opacity-80">
                        Gross Profit
                    </p>

                    <h2 className="text-3xl font-bold mt-2">
                        $
                        {grossProfit.toFixed(
                            2
                        )}
                    </h2>

                    <p className="mt-2 text-sm opacity-90">
                        Revenue − Cost of Goods Sold
                    </p>
                </div>

                {renderSection(
                    'Operating Expenses',
                    operatingExpenseItems,
                    totalOperatingExpenses,
                    'text-red-500'
                )}

                {/* Operating Income */}
                <div className="bg-gradient-to-r from-amber-500 to-orange-600 rounded-2xl p-6 text-white">
                    <p className="text-sm uppercase tracking-wide opacity-80">
                        Operating Income
                    </p>

                    <h2 className="text-3xl font-bold mt-2">
                        $
                        {operatingIncome.toFixed(
                            2
                        )}
                    </h2>

                    <p className="mt-2 text-sm opacity-90">
                        Gross Profit − Operating Expenses
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    {renderSection(
                        'Other Income',
                        otherIncomeItems,
                        totalOtherIncome,
                        'text-green-600'
                    )}

                    {renderSection(
                        'Other Expenses',
                        otherExpenseItems,
                        totalOtherExpenses,
                        'text-red-500'
                    )}
                </div>

                {/* Net Income */}
                <div
                    className={`rounded-2xl p-6 text-white ${
                        netIncome >= 0
                            ? 'bg-gradient-to-r from-sky-600 to-blue-700'
                            : 'bg-gradient-to-r from-red-600 to-rose-700'
                    }`}
                >
                    <p className="text-sm uppercase tracking-wide opacity-80">
                        Net Income
                    </p>

                    <h2 className="text-4xl font-bold mt-2">
                        $
                        {netIncome.toFixed(
                            2
                        )}
                    </h2>

                    <p className="mt-2 text-sm opacity-90">
                        Operating Income + Other Income − Other Expenses
                    </p>
                </div>
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
                            Profit Status
                        </p>

                        <p
                            className={`text-sm font-semibold mt-1 ${
                                netIncome >= 0
                                    ? 'text-green-600'
                                    : 'text-red-500'
                            }`}
                        >
                            {netIncome >= 0
                                ? 'Profitable'
                                : 'Loss'}
                        </p>
                    </div>
                </div>
            </div>
        </Placeholder>
    );
};

export default IncomeStatement;