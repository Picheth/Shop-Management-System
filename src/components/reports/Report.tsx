import React, { useMemo, useState } from 'react';
import Placeholder from '../ui/Placeholder';

type ReportType =
    | 'Sales'
    | 'Repair'
    | 'Finance'
    | 'Inventory';

interface ReportItem {
    id: string;
    title: string;
    type: ReportType;
    date: string;
    description: string;
    amount?: number;
}

const initialReports: ReportItem[] = [
    {
        id: 'RPT-001',
        title: 'Daily Sales Report',
        type: 'Sales',
        date: '2026-05-20',
        description: 'Summary of all sales transactions for the day.',
        amount: 12500,
    },
    {
        id: 'RPT-002',
        title: 'Repair Summary',
        type: 'Repair',
        date: '2026-05-20',
        description: 'All repair jobs status overview.',
    },
    {
        id: 'RPT-003',
        title: 'Monthly Finance Report',
        type: 'Finance',
        date: '2026-05-01',
        description: 'Profit, loss, expenses, and revenue overview.',
        amount: 42000,
    },
    {
        id: 'RPT-004',
        title: 'Inventory Report',
        type: 'Inventory',
        date: '2026-05-18',
        description: 'Stock levels and product movement analysis.',
    },
];

const Report: React.FC = () => {
    const [reports] = useState<ReportItem[]>(initialReports);
    const [search, setSearch] = useState('');
    const [filterType, setFilterType] = useState<'All' | ReportType>('All');

    const filteredReports = useMemo(() => {
        let data = reports;

        if (filterType !== 'All') {
            data = data.filter(r => r.type === filterType);
        }

        if (search) {
            const term = search.toLowerCase();
            data = data.filter(
                r =>
                    r.title.toLowerCase().includes(term) ||
                    r.description.toLowerCase().includes(term) ||
                    r.type.toLowerCase().includes(term)
            );
        }

        return data;
    }, [reports, search, filterType]);

    const inputClasses =
        'w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500';

    return (
        <Placeholder title="Report">

            {/* Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">

                <div className="bg-white dark:bg-gray-800 border rounded-xl p-5">
                    <p className="text-sm text-gray-500">Total Reports</p>
                    <h2 className="text-2xl font-bold text-sky-600 mt-2">
                        {reports.length}
                    </h2>
                </div>

                <div className="bg-white dark:bg-gray-800 border rounded-xl p-5">
                    <p className="text-sm text-gray-500">Sales Reports</p>
                    <h2 className="text-2xl font-bold text-green-600 mt-2">
                        {reports.filter(r => r.type === 'Sales').length}
                    </h2>
                </div>

                <div className="bg-white dark:bg-gray-800 border rounded-xl p-5">
                    <p className="text-sm text-gray-500">Repair Reports</p>
                    <h2 className="text-2xl font-bold text-amber-600 mt-2">
                        {reports.filter(r => r.type === 'Repair').length}
                    </h2>
                </div>

                <div className="bg-white dark:bg-gray-800 border rounded-xl p-5">
                    <p className="text-sm text-gray-500">Finance Reports</p>
                    <h2 className="text-2xl font-bold text-red-500 mt-2">
                        {reports.filter(r => r.type === 'Finance').length}
                    </h2>
                </div>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">

                <input
                    type="text"
                    placeholder="Search reports..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className={inputClasses}
                />

                <select
                    value={filterType}
                    onChange={e => setFilterType(e.target.value as any)}
                    className={inputClasses}
                >
                    <option value="All">All Types</option>
                    <option value="Sales">Sales</option>
                    <option value="Repair">Repair</option>
                    <option value="Finance">Finance</option>
                    <option value="Inventory">Inventory</option>
                </select>
            </div>

            {/* Report List */}
            <div className="space-y-4">
                {filteredReports.length > 0 ? (
                    filteredReports.map(report => (
                        <div
                            key={report.id}
                            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 hover:shadow-md transition"
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                        {report.title}
                                    </h3>

                                    <p className="text-sm text-gray-500 mt-1">
                                        {report.description}
                                    </p>

                                    <div className="mt-2 text-xs text-gray-400">
                                        {report.date} • {report.type}
                                    </div>
                                </div>

                                {report.amount !== undefined && (
                                    <div className="text-right">
                                        <p className="text-sm text-gray-500">Amount</p>
                                        <p className="text-lg font-bold text-green-600">
                                            ${report.amount.toFixed(2)}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center text-gray-500 py-10">
                        No reports found.
                    </div>
                )}
            </div>
        </Placeholder>
    );
};

export default Report;