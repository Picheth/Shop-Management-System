import React from 'react';

interface ProductPaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    totalCount: number;
    itemsPerPage: number;
}

const ProductPagination: React.FC<ProductPaginationProps> = ({
    currentPage,
    totalPages,
    onPageChange,
    totalCount,
    itemsPerPage
}) => {
    if (totalPages <= 1) return null;

    const start = (currentPage - 1) * itemsPerPage + 1;
    const end = Math.min(currentPage * itemsPerPage, totalCount);

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between mt-6 gap-4 px-2">
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                Showing <span className="text-gray-900 dark:text-white tabular-nums">{start}</span> to <span className="text-gray-900 dark:text-white tabular-nums">{end}</span> of <span className="text-gray-900 dark:text-white tabular-nums">{totalCount}</span> products
            </p>
            
            <div className="flex items-center gap-2">
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                    Previous
                </button>
                <span className="text-xs font-black text-sky-600 dark:text-sky-400 px-4 tabular-nums">
                    {currentPage} / {totalPages}
                </span>
                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                    Next
                </button>
            </div>
        </div>
    );
};

export default ProductPagination;