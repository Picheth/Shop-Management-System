import React from 'react';

export type BadgeStatus =
    | 'In Stock'
    | 'Low Stock'
    | 'Out of Stock'
    | 'Pending'
    | 'Ordered'
    | 'Approved'
    | 'Completed'
    | 'Cancelled'
    | 'In Progress'
    | 'Paid'
    | 'Received'
    | 'Unpaid'
    | 'Partial'
    | 'Active'
    | 'Inactive'
    | 'Draft';

type BadgeColor =
    | 'green'
    | 'yellow'
    | 'red'
    | 'blue'
    | 'purple'
    | 'gray'
    | 'orange';

interface StatusBadgeProps {
    status: BadgeStatus;
    className?: string;
    onClick?: () => void;
    disabled?: boolean;
    children?: React.ReactNode;
    title?: string;
    style?: React.CSSProperties;
}

const statusColorMap: Record<
    BadgeStatus,
    BadgeColor
> = {
    'Active': 'green',
    'Inactive': 'gray',
    'Approved': 'blue',
    'Ordered': 'blue',
    'In Progress': 'blue',
    'Completed': 'green',
    'Paid': 'green',
    'Received': 'green',
    'Cancelled': 'red',
    'In Stock': 'green',
    'Low Stock': 'yellow',
    'Pending': 'yellow',
    'Out of Stock': 'red',
    'Draft': 'purple',
    'Unpaid': 'red',
    'Partial': 'orange',
};

const colorClasses: Record<
    BadgeColor,
    string
> = {
    green:
        'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',

    yellow:
        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300',

    red:
        'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',

    blue:
        'bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300',

    purple:
        'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',

    gray:
        'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',

    orange:
        'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300',
};

export const StatusBadge: React.FC<
    StatusBadgeProps
> = ({
    status,
    className = '',
    onClick,
    disabled,
    children,
    title,
    style,
}) => {
    const baseClasses =
        'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold transition-colors';

    const color =
        statusColorMap[status] || 'gray';

    const specificClasses =
        colorClasses[color];

    return (
        <span
            className={`${baseClasses} ${specificClasses} ${className}`}
            onClick={
                disabled
                    ? undefined
                    : onClick
            }
            title={title}
            style={style}
        >
            {children || status}
        </span>
    );
};

export default StatusBadge;