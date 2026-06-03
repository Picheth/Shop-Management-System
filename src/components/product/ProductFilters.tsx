import React from 'react';
import { Category as CategoryInterface } from '../../types';

interface ProductFiltersProps {
    searchTerm: string;
    onSearchChange: (value: string) => void;
    categoryFilter: string;
    onCategoryChange: (value: string) => void;
    statusFilter: string;
    onStatusChange: (value: string) => void;
    categories: CategoryInterface[];
}

const ProductFilters: React.FC<ProductFiltersProps> = ({
    searchTerm,
    onSearchChange,
    categoryFilter,
    onCategoryChange,
    statusFilter,
    onStatusChange,
    categories,
}) => {
    const inputClasses =
        'w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-sm transition-colors';

    return (
        <div className="flex flex-col lg:flex-row gap-4 mb-6 items-center">
            {/* Search */}
            <div className="flex-1 w-full relative">
                <input
                    type="text"
                    placeholder="Search product name, SKU, or specs..."
                    value={searchTerm}
                    onChange={e => onSearchChange(e.target.value)}
                    className={inputClasses}
                />
                <div className="absolute right-3 top-2.5 text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
            </div>

            {/* Category Filter */}
            <select
                value={categoryFilter}
                onChange={e => onCategoryChange(e.target.value)}
                className={`${inputClasses} lg:w-64`}
            >
                <option value="All">All Categories</option>
                {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
            </select>

            {/* Status Filter */}
            <select
                value={statusFilter}
                onChange={e => onStatusChange(e.target.value)}
                className={`${inputClasses} lg:w-48`}
            >
                <option value="All">All Statuses</option>
                <option value="In Stock">In Stock</option>
                <option value="Low Stock">Low Stock</option>
                <option value="Out of Stock">Out of Stock</option>
            </select>
        </div>
    );
};

export default ProductFilters;