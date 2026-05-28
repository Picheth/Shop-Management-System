
import React from 'react';

interface PlaceholderProps {
    title: string;
    children?: React.ReactNode;
}

const Placeholder: React.FC<PlaceholderProps> = ({ title, children }) => {
    return (
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{title}</h2>
            <div className="text-gray-600 dark:text-gray-300">
                {children || <p>Content for the {title} page will be displayed here.</p>}
            </div>
        </div>
    );
};

export default Placeholder;
