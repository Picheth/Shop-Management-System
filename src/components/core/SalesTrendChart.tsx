import React, { useMemo } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
} from 'recharts';
import { Sale } from '../../types';

interface Props {
    sales: Sale[];
}

const SalesTrendChart: React.FC<Props> = ({ sales }) => {

    const dailyData = useMemo(() => {
        const map: Record<string, number> = {};

        sales.forEach(s => {
            const date = s.sale_date; // Correctly use saleDate
            map[date] = (map[date] || 0) + s.total;
        });

        return Object.entries(map).map(([date, total]) => ({
            label: date,
            value: total,
        }));
    }, [sales]);

    const weeklyData = useMemo(() => {
        const map: Record<string, number> = {};

        sales.forEach(s => {
            const d = new Date(s.sale_date); // Correctly use saleDate
            const week = `W${Math.ceil(d.getDate() / 7)}-${d.getMonth() + 1}`;
            map[week] = (map[week] || 0) + s.total;
        });

        return Object.entries(map).map(([label, value]) => ({
            label,
            value,
        }));
    }, [sales]);

    const monthlyData = useMemo(() => {
        const map: Record<string, number> = {};

        sales.forEach(s => {
            const d = new Date(s.sale_date); // Correctly use saleDate
            const month = `${d.getFullYear()}-${d.getMonth() + 1}`;
            map[month] = (map[month] || 0) + s.total;
        });

        return Object.entries(map).map(([label, value]) => ({
            label,
            value,
        }));
    }, [sales]);

    return (
        <div className="space-y-8">

            {/* DAILY */}
            <div>
                <h3 className="text-sm font-semibold mb-2 text-gray-700 dark:text-white">
                    Daily Sales Trend
                </h3>
                <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={dailyData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="label" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="value" stroke="#0ea5e9" />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* WEEKLY */}
            <div>
                <h3 className="text-sm font-semibold mb-2 text-gray-700 dark:text-white">
                    Weekly Sales Trend
                </h3>
                <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={weeklyData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="label" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="value" stroke="#f59e0b" />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* MONTHLY */}
            <div>
                <h3 className="text-sm font-semibold mb-2 text-gray-700 dark:text-white">
                    Monthly Sales Trend
                </h3>
                <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={monthlyData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="label" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="value" stroke="#10b981" />
                    </LineChart>
                </ResponsiveContainer>
            </div>

        </div>
    );
};

export default SalesTrendChart;