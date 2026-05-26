import React, { useMemo, useState } from 'react';
import Placeholder from '../ui/Placeholder';

interface AccountItem {
    id: string;
    name: string;
    category:
        | 'Asset'
        | 'Liability'
        | 'Equity';
    amount: number;
}

const initialAccounts: AccountItem[] = [
    {
        id: '1',
        name: 'Cash on Hand',
        category: 'Asset',
        amount: 8500,
    },
    {
        id: '2',
        name: 'Bank Account',
        category: 'Asset',
        amount: 22000,
    },
    {
        id: '3',
        name: 'Inventory',
        category: 'Asset',
        amount: 14000,
    },
    {
        id: '4',
        name: 'Accounts Receivable',
        category: 'Asset',
        amount: 4800,
    },
    {
        id: '5',
        name: 'Accounts Payable',
        category: 'Liability',
        amount: 6200,
    },
    {
        id: '6',
        name: 'Loan Payable',
        category: 'Liability',
        amount: 15000,
    },
    {
        id: '7',
        name: 'Owner Capital',
        category: 'Equity',
        amount: 18100,
    },
];

const BalanceSheet: React.FC = () => {
    const [accounts] =
        useState<AccountItem[]>(
            initialAccounts
        );

    const assets =
        useMemo(
            () =>
                accounts.filter(
                    a =>
                        a.category ===
                        'Asset'
                ),
            [accounts]
        );

    const liabilities =
        useMemo(
            () =>
                accounts.filter(
                    a =>
                        a.category ===
                        'Liability'
                ),
            [accounts]
        );

    const equity =
        useMemo(
            () =>
                accounts.filter(
                    a =>
                        a.category ===
                        'Equity'
                ),
            [accounts]
        );

    const totalAssets =
        assets.reduce(
            (sum, item) =>
                sum +
                item.amount,
            0
        );

    const totalLiabilities =
        liabilities.reduce(
            (sum, item) =>
                sum +
                item.amount,
            0
        );

    const totalEquity =
        equity.reduce(
            (sum, item) =>
                sum +
                item.amount,
            0
        );

    const totalLiabilitiesAndEquity =
        totalLiabilities +
        totalEquity;

    const renderSection = (
        title: string,
        items: AccountItem[],
        total: number,
        totalClass: string
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
                    className={`font-bold ${totalClass}`}
                >
                    $
                    {total.toFixed(2)}
                </span>
            </div>
        </div>
    );

    return (
        <Placeholder title="Balance Sheet">

            {/* Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">

                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Total Assets
                    </p>

                    <h2 className="text-2xl font-bold text-sky-600 mt-2">
                        $
                        {totalAssets.toFixed(
                            2
                        )}
                    </h2>
                </div>

                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Total Liabilities
                    </p>

                    <h2 className="text-2xl font-bold text-red-500 mt-2">
                        $
                        {totalLiabilities.toFixed(
                            2
                        )}
                    </h2>
                </div>

                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Total Equity
                    </p>

                    <h2 className="text-2xl font-bold text-green-600 mt-2">
                        $
                        {totalEquity.toFixed(
                            2
                        )}
                    </h2>
                </div>
            </div>

            {/* Balance Equation */}
            <div className="bg-gradient-to-r from-sky-600 to-blue-700 rounded-2xl p-6 mb-6 text-white">
                <h2 className="text-xl font-bold mb-2">
                    Balance Sheet Equation
                </h2>

                <p className="text-lg">
                    Assets = Liabilities + Equity
                </p>

                <div className="mt-4 flex flex-col md:flex-row md:items-center md:gap-6 text-sm">

                    <div>
                        Assets:
                        <span className="font-semibold ml-2">
                            $
                            {totalAssets.toFixed(
                                2
                            )}
                        </span>
                    </div>

                    <div>
                        Liabilities + Equity:
                        <span className="font-semibold ml-2">
                            $
                            {totalLiabilitiesAndEquity.toFixed(
                                2
                            )}
                        </span>
                    </div>
                </div>
            </div>

            {/* Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

                {renderSection(
                    'Assets',
                    assets,
                    totalAssets,
                    'text-sky-600'
                )}

                <div className="space-y-6">

                    {renderSection(
                        'Liabilities',
                        liabilities,
                        totalLiabilities,
                        'text-red-500'
                    )}

                    {renderSection(
                        'Equity',
                        equity,
                        totalEquity,
                        'text-green-600'
                    )}
                </div>
            </div>

            {/* Footer */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5">
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
                            Balance Status
                        </p>

                        <p
                            className={`text-sm font-semibold mt-1 ${
                                totalAssets ===
                                totalLiabilitiesAndEquity
                                    ? 'text-green-600'
                                    : 'text-red-500'
                            }`}
                        >
                            {totalAssets ===
                            totalLiabilitiesAndEquity
                                ? 'Balanced'
                                : 'Not Balanced'}
                        </p>
                    </div>
                </div>
            </div>
        </Placeholder>
    );
};

export default BalanceSheet;