import React from 'react';
import { RepairStatus } from '../../types';

interface RepairStatusBadgeProps {
    status: RepairStatus;
}

const statusColors: Record<RepairStatus, string> = {
    'Pending': 'bg-yellow-100 text-yellow-800',
    'In Progress': 'bg-blue-100 text-blue-800',
    'Completed': 'bg-green-100 text-green-800',
    'Cancelled': 'bg-red-100 text-red-800',
};

const RepairStatusBadge: React.FC<RepairStatusBadgeProps> = ({ status }) => {
    return (
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusColors[status]}`}>
            {status}
        </span>
    );
};

export default RepairStatusBadge;