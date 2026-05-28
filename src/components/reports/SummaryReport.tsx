import React, { useMemo, useState } from 'react';
import Placeholder from '../ui/Placeholder';

interface SummaryItem {
    id: string;
    label: string;
    category: 'Sales' | 'Repair' | 'Expense' | 'Profit';
    amount: number;
    date: string;
}

const initialData: SummaryItem[] = [
    { id: '1', label: 'Daily Sales', category: 'Sales', amount: 5200, date: '2026-05-20' },
    { id: '2', label: 'Repair Income', category: 'Repair', amount: 1800, date: '2026-05-20' },
    { id: '3', label: 'Accessories Sales', category: 'Sales', amount: 3100, date: '2026-05-19' },
    { id: '4', label: 'Staff Salary', category: 'Expense', amount: 2200, date: '2026-05-19' },
    { id: '5', label: 'Shop Rent', category: 'Expense', amount: 1200, date: '2026-05-18' },
];

const SummaryReport: React.FC = () => {
    const [data] = useState<SummaryItem[]>(initialData);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState<'All' | SummaryItem['category']>('All');

    const filteredData = useMemo(() => {
        let result = data;

        if (filter !== 'All') {
            result = result.filter(i => i.category === filter);
        }

        if (search) {
            const term = search.toLowerCase();
            result = result.filter(
                i =>
                    i.label.toLowerCase().includes(term) ||
                    i.category.toLowerCase().includes(term)
            );
        }

        return result;
    }, [data, search, filter]);

    const totals = useMemo(() => {
        const totalSales = data.filter(i => i.category === 'Sales').reduce((s, i) => s + i.amount, 0);
        const totalRepair = data.filter(i => i.category === 'Repair').reduce((s, i) => s + i.amount, 0);
        const totalExpense = data.filter(i => i.category === 'Expense').reduce((s, i) => s + i.amount, 0);
        const profit = totalSales + totalRepair - totalExpense;

        return { totalSales, totalRepair, totalExpense, profit };
    }, [data]);

    const inputClasses =
        'w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500';

    return (
        <Placeholder title="Summary Report">

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">

                <div className="bg-white dark:bg-gray-800 border rounded-xl p-5">
                    <p className="text-sm text-gray-500">Total Sales</p>
                    <h2 className="text-2xl font-bold text-green-600 mt-2">
                        ${totals.totalSales.toFixed(2)}
                    </h2>
                </div>

                <div className="bg-white dark:bg-gray-800 border rounded-xl p-5">
                    <p className="text-sm text-gray-500">Repair Income</p>
                    <h2 className="text-2xl font-bold text-sky-600 mt-2">
                        ${totals.totalRepair.toFixed(2)}
                    </h2>
                </div>

                <div className="bg-white dark:bg-gray-800 border rounded-xl p-5">
                    <p className="text-sm text-gray-500">Expenses</p>
                    <h2 className="text-2xl font-bold text-red-500 mt-2">
                        ${totals.totalExpense.toFixed(2)}
                    </h2>
                </div>

                <div className="bg-white dark:bg-gray-800 border rounded-xl p-5">
                    <p className="text-sm text-gray-500">Profit</p>
                    <h2 className={`text-2xl font-bold mt-2 ${totals.profit >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                        ${totals.profit.toFixed(2)}
                    </h2>
                </div>
            </div>

            {/* Profit Banner */}
            <div className={`rounded-2xl p-6 mb-6 text-white ${totals.profit >= 0 ? 'bg-gradient-to-r from-sky-600 to-blue-700' : 'bg-gradient-to-r from-red-600 to-rose-700'}`}>
                <p className="text-sm uppercase tracking-wide opacity-80">Business Summary</p>
                <h2 className="text-3xl font-bold mt-2">
                    {totals.profit >= 0 ? 'Profit' : 'Loss'}: ${Math.abs(totals.profit).toFixed(2)}
                </h2>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <input
                    type="text"
                    placeholder="Search summary..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className={inputClasses}
                />

                <select
                    value={filter}
                    onChange={e => setFilter(e.target.value as any)}
                    className={inputClasses}
                >
                    <option value="All">All</option>
                    <option value="Sales">Sales</option>
                    <option value="Repair">Repair</option>
                    <option value="Expense">Expense</option>
                    <option value="Profit">Profit</option>
                </select>
            </div>

            {/* Table */}
            <div className="overflow-x-auto border rounded-xl dark:border-gray-700">
                <table className="min-w-full bg-white dark:bg-gray-800">

                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Label</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Category</th>
                            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Amount</th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {filteredData.length > 0 ? (
                            filteredData.map(item => (
                                <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{item.date}</td>
                                    <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{item.label}</td>
                                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{item.category}</td>
                                    <td className="px-4 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">
                                        ${item.amount.toFixed(2)}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={4} className="text-center py-8 text-gray-500">
                                    No data found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

        </Placeholder>
    );
};

export default SummaryReport;