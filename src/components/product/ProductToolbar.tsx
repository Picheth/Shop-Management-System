import React from 'react';

interface ProductToolbarProps {
    onAddProduct: () => void;
    totalCount: number;
}

const ProductToolbar: React.FC<ProductToolbarProps> = ({ onAddProduct, totalCount }) => {
    return (
        <div className="flex justify-between items-center mb-6">
            <div className="flex items-baseline gap-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Product Catalog</h3>
                <span className="text-xs font-medium text-gray-400 tabular-nums">({totalCount} Items)</span>
            </div>
            <button
                onClick={onAddProduct}
                className="bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-md transition-colors text-sm font-bold uppercase tracking-widest shadow-sm flex items-center gap-2"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Product
            </button>
        </div>
    );
};

export default ProductToolbar;