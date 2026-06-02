import React, { useMemo, useState, useCallback } from 'react';
import { ErrorLog, ToastType } from '../../types';
import Placeholder from '../ui/Placeholder';
import StatusBadge from '../ui/StatusBadge';
import { TrashIcon, InfoIcon, ExportIcon, CopyIcon } from '../ui/Icons';

interface ErrorDashboardProps {
    logs: ErrorLog[];
    onDelete: (id: string) => void;
    onRefresh: () => void;
    onClearAll: () => void;
    showToast?: (message: string, type: ToastType) => void;
}

const ErrorDashboard: React.FC<ErrorDashboardProps> = ({ logs, onDelete, onRefresh, onClearAll, showToast }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [severityFilter, setSeverityFilter] = useState('All');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const isFiltered = searchTerm !== '' || severityFilter !== 'All' || startDate !== '' || endDate !== '';

    const handleResetFilters = () => {
        setSearchTerm('');
        setSeverityFilter('All');
        setStartDate('');
        setEndDate('');
    };

    const handleSetWeekView = () => {
        const now = new Date();
        const start = new Date(now);
        const day = now.getDay();
        const diff = now.getDate() - day + (day === 0 ? -6 : 1);
        start.setDate(diff);
        
        const end = new Date(start);
        end.setDate(start.getDate() + 6);

        setStartDate(start.toISOString().split('T')[0]);
        setEndDate(end.toISOString().split('T')[0]);
    };

    const handleSetMonthView = () => {
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth(), 1);
        const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        setStartDate(start.toISOString().split('T')[0]);
        setEndDate(end.toISOString().split('T')[0]);
    };

    const handleSetYearToDateView = () => {
        const now = new Date();
        const start = new Date(now.getFullYear(), 0, 1); // January 1st of current year
        const end = new Date(); // Today's date

        setStartDate(start.toISOString().split('T')[0]);
        setEndDate(end.toISOString().split('T')[0]);
    };

    const filteredLogs = useMemo(() => {
        let result = logs;

        if (severityFilter !== 'All') {
            result = result.filter(log => log.severity === severityFilter);
        }

        if (startDate || endDate) {
            result = result.filter(log => {
                const logDate = log.created_at.split('T')[0];
                if (startDate && logDate < startDate) return false;
                if (endDate && logDate > endDate) return false;
                return true;
            });
        }

        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase();
            result = result.filter(log => 
                log.component_name.toLowerCase().includes(term) || 
                log.message.toLowerCase().includes(term) ||
                log.url.toLowerCase().includes(term)
            );
        }

        return result;
    }, [logs, searchTerm, severityFilter, startDate, endDate]);

    const stats = useMemo(() => {
        const critical = filteredLogs.filter(l => l.severity === 'critical').length;
        const warnings = filteredLogs.filter(l => l.severity === 'warning').length;
        return { 
            critical, 
            warnings, 
            total: filteredLogs.length 
        };
    }, [filteredLogs]);

    const handleCopyError = useCallback((log: ErrorLog) => {
        const text = `Error: ${log.message}\n` +
                    `Component: ${log.component_name}\n` +
                    `URL: ${log.url}\n\n` +
                    `Stack Trace:\n${log.stack}`;

        navigator.clipboard.writeText(text).then(() => {
            showToast?.('Error details copied to clipboard', 'success');
        }).catch(err => {
            showToast?.('Failed to copy error details', 'error');
        });
    }, [showToast]);

    const handleDownloadReport = useCallback(() => {
        if (!filteredLogs.length) return;
        
        const blob = new Blob([JSON.stringify(filteredLogs, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `system_error_report_${new Date().toISOString().split('T')[0]}.json`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }, [filteredLogs]);

    return (
        <Placeholder title="System Error Logs">
            <div className="flex flex-col gap-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Total Logs</p>
                        <p className="text-2xl font-black text-gray-900 dark:text-white">{stats.total}</p>
                    </div>
                    <div className="bg-red-50 dark:bg-red-900/10 p-4 rounded-xl border border-red-100 dark:border-red-900/30 shadow-sm">
                        <p className="text-xs font-bold text-red-400 uppercase tracking-widest mb-1">Critical Crashes</p>
                        <p className="text-2xl font-black text-red-600 dark:text-red-400">{stats.critical}</p>
                    </div>
                    <div className="bg-amber-50 dark:bg-amber-900/10 p-4 rounded-xl border border-amber-100 dark:border-amber-900/30 shadow-sm">
                        <p className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-1">Widget Warnings</p>
                        <p className="text-2xl font-black text-amber-600 dark:text-amber-400">{stats.warnings}</p>
                    </div>
                </div>

                <div className="flex flex-col xl:flex-row justify-between items-center gap-4">
                    <div className="flex flex-wrap gap-3 w-full xl:w-auto">
                        <div className="flex items-center gap-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1.5 shadow-sm">
                            <span className="text-[10px] uppercase font-bold text-gray-400">From</span>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="bg-transparent text-sm text-gray-900 dark:text-white outline-none focus:ring-0 cursor-pointer"
                            />
                            <span className="text-[10px] uppercase font-bold text-gray-400 border-l border-gray-300 dark:border-gray-500 pl-2 ml-1">To</span>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="bg-transparent text-sm text-gray-900 dark:text-white outline-none focus:ring-0 cursor-pointer"
                            />
                            <button
                                onClick={handleSetWeekView}
                                className="text-[10px] font-bold text-sky-600 hover:text-sky-700 dark:text-sky-400 uppercase tracking-tight ml-2 px-1.5 py-0.5 rounded bg-sky-50 dark:bg-sky-900/30 border border-sky-100 dark:border-sky-800 transition-colors whitespace-nowrap"
                            >
                                This Week
                            </button>
                            <button
                                onClick={handleSetMonthView}
                                className="text-[10px] font-bold text-sky-600 hover:text-sky-700 dark:text-sky-400 uppercase tracking-tight ml-1 px-1.5 py-0.5 rounded bg-sky-50 dark:bg-sky-900/30 border border-sky-100 dark:border-sky-800 transition-colors whitespace-nowrap"
                            >
                                This Month
                            </button>
                            <button
                                onClick={handleSetYearToDateView}
                                className="text-[10px] font-bold text-sky-600 hover:text-sky-700 dark:text-sky-400 uppercase tracking-tight ml-1 px-1.5 py-0.5 rounded bg-sky-50 dark:bg-sky-900/30 border border-sky-100 dark:border-sky-800 transition-colors whitespace-nowrap"
                            >
                                Year to Date
                            </button>
                        </div>

                        <div className="relative w-full sm:w-80">
                            <input
                                type="text"
                                placeholder="Filter by component, message, or URL..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none transition-colors shadow-sm"
                            />
                        </div>
                        <select
                            value={severityFilter}
                            onChange={(e) => setSeverityFilter(e.target.value)}
                            className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none transition-colors shadow-sm cursor-pointer min-w-[140px]"
                        >
                            <option value="All">All Severities</option>
                            <option value="critical">Critical</option>
                            <option value="warning">Warning</option>
                            <option value="info">Info</option>
                        </select>
                    </div>
                    <div className="flex items-center gap-4">
                        {filteredLogs.length > 0 && (
                            <button 
                                onClick={handleDownloadReport}
                                className="text-xs font-bold uppercase text-sky-600 hover:text-sky-700 transition-colors flex items-center gap-1.5"
                            >
                                <ExportIcon size={14} />
                                Download Full Report
                            </button>
                        )}
                        {logs.length > 0 && (
                            <button 
                                onClick={onClearAll}
                                className="text-xs font-bold uppercase text-red-600 hover:text-red-700 transition-colors"
                            >
                                Clear All Logs
                            </button>
                        )}

                        {isFiltered && (
                            <button
                                onClick={handleResetFilters}
                                className="text-xs font-bold uppercase text-gray-400 hover:text-sky-600 transition-colors flex items-center gap-1"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                Reset
                            </button>
                        )}

                        <button 
                            onClick={onRefresh}
                            className="text-xs font-bold uppercase text-sky-600 hover:text-sky-700 transition-colors flex items-center gap-2"
                        >
                            Refresh Logs
                        </button>
                    </div>
                </div>

                {/* Raw Logs Table */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-900/50">
                            <tr>
                                <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">Timestamp</th>
                                <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">Source</th>
                                <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider w-1/3">Error Message</th>
                                <th className="px-6 py-3 text-center text-[10px] font-bold text-gray-400 uppercase tracking-wider">Severity</th>
                                <th className="px-6 py-3 text-right text-[10px] font-bold text-gray-400 uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {filteredLogs.length > 0 ? filteredLogs.map(log => (
                                <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500 dark:text-gray-400 font-mono">
                                        {new Date(log.created_at).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex flex-col">
                                            <span className="text-xs font-bold text-gray-900 dark:text-white">{log.component_name}</span>
                                            <span className="text-[10px] text-gray-400 truncate max-w-[150px]">{log.url}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <details className="group">
                                            <summary className="text-xs font-medium text-red-600 dark:text-red-400 cursor-pointer list-none flex items-center gap-2">
                                                <InfoIcon size={12} />
                                                {log.message}
                                            </summary>
                                            <pre className="mt-2 p-3 bg-gray-900 text-green-400 rounded-lg text-[10px] font-mono overflow-auto max-h-48 border border-gray-700">
                                                {log.stack}
                                            </pre>
                                        </details>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <StatusBadge status={log.severity === 'critical' ? 'Cancelled' : 'Pending'}>
                                            {log.severity.toUpperCase()}
                                        </StatusBadge>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        <div className="flex justify-end gap-3">
                                            <button 
                                                onClick={() => handleCopyError(log)}
                                                className="text-gray-400 hover:text-sky-600 transition-colors"
                                                title="Copy Error Details"
                                            >
                                                <CopyIcon size={16} />
                                            </button>
                                            <button 
                                                onClick={() => onDelete(log.id)}
                                                className="text-gray-400 hover:text-red-500 transition-colors"
                                                title="Delete Log"
                                            >
                                                <TrashIcon size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-sm text-gray-400 italic">
                                        No system errors detected. Everything is running smoothly.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </Placeholder>
    );
};

export default ErrorDashboard;