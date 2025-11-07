import React from 'react';
import Placeholder from '../ui/Placeholder';

// FIX: Changed JSX.Element to React.ReactElement to resolve the 'Cannot find namespace JSX' error.
const StatCard: React.FC<{ title: string; value: string; icon: React.ReactElement }> = ({ title, value, icon }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 flex items-center">
        <div className="p-3 bg-sky-500 rounded-full text-white mr-4">
            {icon}
        </div>
        <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        </div>
    </div>
);

const Dashboard: React.FC = () => {
    const iconClass = "h-6 w-6";
    return (
        <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <StatCard 
                    title="Total Sales" 
                    value="$24,350" 
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01" /></svg>}
                />
                <StatCard 
                    title="New Orders" 
                    value="1,280" 
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>}
                />
                <StatCard 
                    title="Repairs Pending" 
                    value="42" 
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" /></svg>}
                />
                <StatCard 
                    title="New Customers" 
                    value="78" 
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21v-1a6 6 0 00-1.75-4.472" /></svg>}
                />
            </div>
            <Placeholder title="Dashboard Overview">
                <p>Welcome to the Shop Management System. Here you can find a quick overview of your business performance.</p>
            </Placeholder>
        </div>
    );
};

export default Dashboard;