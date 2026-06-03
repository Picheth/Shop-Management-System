import { useMemo, useState } from 'react';
import { DataProduct, MasterAttribute, Category, ProductType } from '../types';
import { getProductConfiguration, getAttrName } from '../utils/productHelpers';

export type SortableKeys = 'name' | 'sku' | 'typeId' | 'brandId' | 'categoryId' | 'configuration' | 'totalStock' | 'status';

interface UseProductsProps {
    products: DataProduct[];
    allCategories: Category[];
    allProductTypes: ProductType[];
    processors: MasterAttribute[];
    rams: MasterAttribute[];
    storages: MasterAttribute[];
    colors: MasterAttribute[];
    regions: MasterAttribute[];
    itemsPerPage?: number;
}

export const useProducts = ({
    products,
    allCategories,
    allProductTypes,
    processors,
    rams,
    storages,
    colors,
    regions,
    itemsPerPage = 10
}: UseProductsProps) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [statusFilter, setStatusFilter] = useState('All');
    const [currentPage, setCurrentPage] = useState(1);
    const [sortConfig, setSortConfig] = useState<{ key: SortableKeys; direction: 'ascending' | 'descending' } | null>(null);

    // 1. Calculate Total Stock per product
    const productsWithStock = useMemo(() => {
        return products.map(p => ({
            ...p,
            totalStock: Object.values(p.stockByLocation || {}).reduce((a, b) => a + b, 0)
        }));
    }, [products]);

    // 2. Filter logic
    const filteredProducts = useMemo(() => {
        let result = productsWithStock;

        if (categoryFilter !== 'All') {
            result = result.filter(p => p.categoryId === categoryFilter);
        }

        if (statusFilter !== 'All') {
            result = result.filter(p => p.status === statusFilter);
        }

        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase();
            result = result.filter(p => {
                const config = getProductConfiguration(p, processors, rams, storages, colors, regions).toLowerCase();
                return (
                    p.name.toLowerCase().includes(term) ||
                    p.sku.toLowerCase().includes(term) ||
                    config.includes(term)
                );
            });
        }

        return result;
    }, [productsWithStock, searchTerm, categoryFilter, statusFilter, processors, rams, storages, colors, regions]);

    // 3. Sort logic
    const sortedProducts = useMemo(() => {
        const items = [...filteredProducts];
        if (!sortConfig) return items;

        return items.sort((a, b) => {
            const aVal = (a as any)[sortConfig.key] || '';
            const bVal = (b as any)[sortConfig.key] || '';
            
            if (sortConfig.direction === 'ascending') {
                return typeof aVal === 'number' ? aVal - bVal : String(aVal).localeCompare(String(bVal));
            }
            return typeof aVal === 'number' ? bVal - aVal : String(bVal).localeCompare(String(aVal));
        });
    }, [filteredProducts, sortConfig]);

    // 4. Pagination
    const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);
    const paginatedItems = sortedProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const requestSort = (key: SortableKeys) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig?.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    return {
        searchTerm,
        setSearchTerm,
        categoryFilter,
        setCategoryFilter,
        statusFilter,
        setStatusFilter,
        currentPage,
        setCurrentPage,
        sortConfig,
        requestSort,
        paginatedItems,
        totalPages,
        totalCount: sortedProducts.length
    };
};