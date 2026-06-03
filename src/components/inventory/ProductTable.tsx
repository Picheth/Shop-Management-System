import React from 'react';
import { DataProduct, MasterAttribute, Category, ProductType, Brand } from '../../types';
import { SortableKeys } from '../../hooks/useProducts';
import ProductRow from './ProductRow';

interface ProductTableProps {
    products: DataProduct[];
    sortConfig: { key: SortableKeys; direction: 'ascending' | 'descending' } | null;
    requestSort: (key: SortableKeys) => void;
    // Master Resolvers
    allProductTypes: ProductType[];
    allCategories: Category[];
    allBrands: Brand[];
    processors: MasterAttribute[];
    rams: MasterAttribute[];
    storages: MasterAttribute[];
    colors: MasterAttribute[];
    regions: MasterAttribute[];
    // Callbacks
    onView: (product: DataProduct) => void;
    onEdit: (product: DataProduct) => void;
    onDeleteVariant: (id: string) => void;
    onDeleteProduct: (product: DataProduct) => void;
}

const ProductTable: React.FC<ProductTableProps> = ({
    products, sortConfig, requestSort,
    allProductTypes, allCategories, allBrands,
    processors, rams, storages, colors, regions,
    onView, onEdit, onDeleteVariant, onDeleteProduct
}) => {

    const renderHeader = (label: string, key: SortableKeys, align: 'left' | 'center' | 'right' = 'left') => {
        const isActive = sortConfig?.key === key;
        return (
            <th 
                className={`px-6 py-3 text-${align} text-[10px] font-black uppercase tracking-widest text-gray-400 cursor-pointer hover:text-sky-600 transition-colors group`}
                onClick={() => requestSort(key)}
            >
                <div className={`flex items-center ${align === 'center' ? 'justify-center' : align === 'right' ? 'justify-end' : ''} gap-1`}>
                    {label}
                    <span className={`transition-opacity ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-40'}`}>
                        {sortConfig?.direction === 'descending' ? '↓' : '↑'}
                    </span>
                </div>
            </th>
        );
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900/50">
                    <tr>
                        {renderHeader('Product', 'name')}
                        {renderHeader('SKU', 'sku')}
                        {renderHeader('Type', 'typeId')}
                        {renderHeader('Brand', 'brandId')}
                        {renderHeader('Category', 'categoryId')}
                        {renderHeader('Configuration', 'configuration')}
                        {renderHeader('Stock', 'totalStock', 'center')}
                        {renderHeader('Status', 'status', 'center')}
                        <th className="px-6 py-3 text-right text-[10px] font-black uppercase tracking-widest text-gray-400">
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {products.length > 0 ? (
                        products.map(product => (
                            <ProductRow 
                                key={product.id}
                                product={product}
                                allProductTypes={allProductTypes}
                                allCategories={allCategories}
                                allBrands={allBrands}
                                processors={processors}
                                rams={rams}
                                storages={storages}
                                colors={colors}
                                regions={regions}
                                onView={onView}
                                onEdit={onEdit}
                                onDeleteVariant={onDeleteVariant}
                                onDeleteProduct={onDeleteProduct}
                            />
                        ))
                    ) : (
                        <tr>
                            <td colSpan={9} className="px-6 py-20 text-center">
                                <p className="text-sm text-gray-500 italic">No products found matching your criteria.</p>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default ProductTable;