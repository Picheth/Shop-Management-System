import React from 'react';

export type BadgeStatus = 'In Stock' | 'Low Stock' | 'Out of Stock' | 'Pending' | 'Approved' | 'Completed' | 'Cancelled';
type BadgeColor = 'green' | 'yellow' | 'red' | 'blue' | 'purple';

interface StatusBadgeProps {
    status: BadgeStatus;
}

const statusColorMap: Record<BadgeStatus, BadgeColor> = {
    'In Stock': 'green',
    'Completed': 'green',
    'Approved': 'blue',
    'Low Stock': 'yellow',
    'Pending': 'yellow',
    'Out of Stock': 'red',
    'Cancelled': 'red',
};

const colorClasses: Record<BadgeColor, string> = {
    green: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    yellow: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    red: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    blue: 'bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-200',
    purple: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
    const baseClasses = 'px-2 py-1 text-xs font-semibold rounded-full inline-block';
    const color = statusColorMap[status] || 'gray';
    const specificClasses = colorClasses[color];
    
    return <span className={`${baseClasses} ${specificClasses}`}>{status}</span>;
};