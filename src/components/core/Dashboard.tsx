import React, { useMemo } from 'react';
import Placeholder from '../ui/Placeholder';
import { DataProduct, Repair, Sale } from '../../types';
import SalesTrendChart from './SalesTrendChart';
interface DashboardProps {
    sales?: Sale[];
    repairs?: Repair[];
    products?: DataProduct[];
}

const StatCard: React.FC<{
    title: string;
    value: string;
    icon: React.ReactElement;
    color?: string;
}> = ({ title, value, icon, color = 'sky' }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 flex items-center">
        <div className={`p-3 rounded-full text-white mr-4 ${
            color === 'amber' ? 'bg-amber-500' : 
            color === 'green' ? 'bg-green-500' : 
            'bg-sky-500'
        }`}>
            {icon}
        </div>
        <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {value}
            </p>
        </div>
    </div>
);

const Dashboard: React.FC<DashboardProps> = ({
    sales = [],
    repairs = [],
    products = [],
}) => {

    /* =========================
       METRICS (REAL LOGIC READY)
    ========================== */

    const totalSales = useMemo(
        () => sales.reduce((sum, s) => sum + (s.total || 0), 0), // Correctly calculate total sales
        [sales]
    );

    const totalRepairs = useMemo(
        () => repairs.length, // Correctly calculate total repairs
        [repairs]
    );

    const pendingRepairs = useMemo(
        () => repairs.filter(r => r.status === 'Pending').length, // Correctly calculate pending repairs
        [repairs]
    );

    const completedRepairs = useMemo(
        () => repairs.filter(r => r.status === 'Completed').length, // Correctly calculate completed repairs
        [repairs]
    );

    const lowStockProducts = useMemo(
        () => products.filter(p =>
            Object.values(p.stockByLocation || {}).some(qty => qty > 0 && qty < 5)
        ).length, // Correctly calculate low stock products
        [products]
    );

    const newCustomers = useMemo(
        () => new Set(sales.map(s => s.customer)).size, // Correctly calculate new customers
        [sales]
    );

    /* =========================
       ALERTS
    ========================== */

    const alerts = useMemo(() => {
        const list: string[] = [];

        if (pendingRepairs > 0) {
            list.push(`${pendingRepairs} repair(s) pending`);
        }

        if (lowStockProducts > 0) {
            list.push(`${lowStockProducts} product(s) low stock`);
        }

        return list;
    }, [pendingRepairs, lowStockProducts]);

    const iconClass = 'h-6 w-6';

    return (
        <div className="space-y-6">

            {/* ALERT BAR */}
            {alerts.length > 0 && (
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                    <p className="text-sm font-semibold text-amber-700 dark:text-amber-300">
                        Alerts
                    </p>
                    <ul className="text-sm text-amber-600 dark:text-amber-200 list-disc ml-5">
                        {alerts.map((a, i) => (
                            <li key={i}>{a}</li>
                        ))}
                    </ul>
                </div>
            )}

            {/* STATS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

                <StatCard
                    title="Total Sales"
                    value={`$${totalSales.toFixed(2)}`}
                    icon={
                        <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8v.01" />
                        </svg>
                    }
                />

                <StatCard
                    title="Total Repairs"
                    value={totalRepairs.toString()}
                    icon={
                        <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                                d="M11 4a2 2 0 114 0v1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1v3a2 2 0 11-4 0v-3H9a2 2 0 110-4h2V4z" />
                        </svg>
                    }
                />

                <StatCard
                    title="Pending Repairs"
                    value={pendingRepairs.toString()}
                    icon={
                        <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                                d="M12 8v4l3 3" />
                        </svg>
                    }
                    color="amber"
                />

                <StatCard
                    title="New Customers"
                    value={newCustomers.toString()}
                    icon={
                        <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                                d="M12 4a4 4 0 110 8 4 4 0 010-8zm0 10c-4 0-7 2-7 5v1h14v-1c0-3-3-5-7-5z" />
                        </svg>
                    }
                />
            </div>

            {/* QUICK INSIGHT PANEL */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
                    <h3 className="font-semibold text-gray-700 dark:text-white mb-2">
                        Repair Status Overview
                    </h3>

                    <p className="text-sm text-gray-500">
                        Completed: {completedRepairs}
                    </p>
                    <p className="text-sm text-gray-500">
                        Pending: {pendingRepairs}
                    </p>
                </div>

                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
                    <h3 className="font-semibold text-gray-700 dark:text-white mb-2">
                        Inventory Health
                    </h3>

                    <p className="text-sm text-gray-500">
                        Low Stock Items: {lowStockProducts}
                    </p>
                </div>

            </div>

            {/* PLACEHOLDER FOR CHARTS (NEXT STEP) */}
            <Placeholder title="Sales & Repair Trends Chart">
                <p className="text-sm text-gray-500">
                    📊 Chart will be added here (Recharts or Chart.js integration next step)
                </p>
            </Placeholder>
            
            {/* SALES TREND CHART */}
            <Placeholder title="Sales Analytics">
            <SalesTrendChart sales={sales} />
            </Placeholder>
            {/* FUTURE: Add Repair Trend Chart here */}
            <Placeholder title="Repair Analytics">
                <p className="text-sm text-gray-500">
                    📈 Repair trend chart coming soon!
                </p>
            </Placeholder>

        </div>
    );
};

export default Dashboard;