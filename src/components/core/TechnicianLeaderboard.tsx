import React, { useMemo, useState } from 'react';
import { Repair as RepairType } from '../../types';

interface TechnicianLeaderboardProps {
    repairs: RepairType[];
}

type ViewMode = 'Month' | 'AllTime';

const TechnicianLeaderboard: React.FC<TechnicianLeaderboardProps> = ({ repairs }) => {
    const [viewMode, setViewMode] = useState<ViewMode>('Month');
    const [searchTerm, setSearchTerm] = useState('');

    const fullLeaderboard = useMemo(() => {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        
        // Calculate previous month for growth comparison
        const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;

        // 1. Filter for completed repairs based on view mode
        const filteredRepairs = repairs.filter(r => {
            if (r.status !== 'Completed' || !r.commission_amount) return false;
            
            if (viewMode === 'Month') {
                const date = new Date(r.completed_date || r.entry_date);
                return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
            }
            
            return true;
        });

        // 2. We always need current vs prev month totals for the growth stat
        const currentMonthMap = repairs.reduce((acc, r) => {
            if (r.status !== 'Completed' || !r.commission_amount) return acc;
            const date = new Date(r.completed_date || r.entry_date);
            if (date.getMonth() === currentMonth && date.getFullYear() === currentYear) {
                const tech = r.technician || 'Unassigned';
                acc[tech] = (acc[tech] || 0) + (r.commission_amount || 0);
            }
            return acc;
        }, {} as Record<string, number>);

        const prevMonthMap = repairs.reduce((acc, r) => {
            if (r.status !== 'Completed' || !r.commission_amount) return acc;
            const date = new Date(r.completed_date || r.entry_date);
            if (date.getMonth() === prevMonth && date.getFullYear() === prevYear) {
                const tech = r.technician || 'Unassigned';
                acc[tech] = (acc[tech] || 0) + (r.commission_amount || 0);
            }
            return acc;
        }, {} as Record<string, number>);

        // 3. Aggregate commissions for the active view
        const totals = filteredRepairs.reduce((acc, r) => {
            const tech = r.technician || 'Unassigned';
            acc[tech] = (acc[tech] || 0) + (r.commission_amount || 0);
            return acc;
        }, {} as Record<string, number>);

        // 4. Map data with growth calculation
        return Object.entries(totals)
            .map(([name, amount]) => {
                const currentAmt = currentMonthMap[name] || 0;
                const prevAmt = prevMonthMap[name] || 0;
                
                // Calculate growth: ((Current - Prev) / Prev) * 100
                const growth = prevAmt === 0 
                    ? (currentAmt > 0 ? 100 : 0) 
                    : ((currentAmt - prevAmt) / prevAmt) * 100;

                return { name, amount, growth };
            })
            .sort((a, b) => b.amount - a.amount)
            .map((item, index) => ({ ...item, rank: index + 1 }));
    }, [repairs, viewMode]);

    const filteredLeaderboard = useMemo(() => {
        if (!searchTerm.trim()) return fullLeaderboard;
        const term = searchTerm.toLowerCase();
        return fullLeaderboard.filter(tech => 
            tech.name.toLowerCase().includes(term)
        );
    }, [fullLeaderboard, searchTerm]);

    const globalMax = fullLeaderboard[0]?.amount || 1;

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col h-full">
            <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                    Technician Leaderboard
                </h3>
                <div className="flex bg-gray-100 dark:bg-gray-700 p-0.5 rounded-lg border border-gray-200 dark:border-gray-600 shadow-inner">
                    <button
                        onClick={() => setViewMode('Month')}
                        className={`text-[10px] px-2 py-1 rounded-md font-bold uppercase transition-all duration-200 ${
                            viewMode === 'Month' 
                                ? 'bg-white dark:bg-gray-800 text-sky-600 shadow-sm' 
                                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                        }`}
                    >
                        Month
                    </button>
                    <button
                        onClick={() => setViewMode('AllTime')}
                        className={`text-[10px] px-2 py-1 rounded-md font-bold uppercase transition-all duration-200 ${
                            viewMode === 'AllTime' 
                                ? 'bg-white dark:bg-gray-800 text-sky-600 shadow-sm' 
                                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                        }`}
                    >
                        All Time
                    </button>
                </div>
            </div>

            {/* Search Bar */}
            <div className="px-4 pt-3 pb-1">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search technician..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-md pl-8 pr-2 py-1.5 text-[11px] focus:outline-none focus:ring-1 focus:ring-sky-500 transition-all"
                    />
                    <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
            </div>

            <div className="p-4 flex-1 overflow-y-auto">
                {filteredLeaderboard.length > 0 ? (
                    <div className="space-y-5">
                        {filteredLeaderboard.map((tech) => (
                            <div key={tech.name} className="relative">
                                <div className="flex justify-between items-end mb-1.5">
                                    <div className="flex items-center gap-3">
                                        <span className={`flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-black ${
                                            tech.rank === 1 ? 'bg-amber-100 text-amber-700' : 
                                            tech.rank === 2 ? 'bg-slate-100 text-slate-700' : 
                                            'bg-gray-50 text-gray-500'
                                        }`}>
                                            {tech.rank}
                                        </span>
                                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                                            {tech.name}
                                        </span>
                                    </div>
                                    <span className="text-sm font-bold text-gray-900 dark:text-white tabular-nums">
                                        ${tech.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
                                {/* Progress Bar Visualization */}
                                <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                    <div 
                                        className={`h-full transition-all duration-1000 ${
                                            tech.rank === 1 ? 'bg-sky-500' : 'bg-sky-400/50'
                                        }`}
                                        style={{ width: `${(tech.amount / globalMax) * 100}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center py-8">
                        <p className="text-xs text-gray-500 italic">
                            {searchTerm.trim() 
                                ? `No technicians found matching "${searchTerm}"`
                                : `No commissions earned yet ${viewMode === 'Month' ? 'this month' : 'on record'}.`
                            }
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TechnicianLeaderboard;