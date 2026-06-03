import React from 'react';

const LoadingSpinner: React.FC = () => {
    return (
        <div className="flex items-center justify-center h-full w-full min-h-[200px] text-gray-500 dark:text-gray-400">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-sky-600 border-t-transparent"></div>
            <span className="ml-3 text-lg font-medium">Loading...</span>
        </div>
    );
};

export default LoadingSpinner;