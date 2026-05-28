import React, { useState, useMemo } from 'react';
import { DataProduct, Branch, AddProductFormData } from '../../types';
import Placeholder from '../ui/Placeholder';
import Modal from '../ui/Modal';
import AddProductForm from './AddProductForm';
import ConfirmationModal from '../ui/ConfirmationModal';
import ProductDetail from './ProductDetail';
import { StatusBadge } from '../ui/StatusBadge';

type SortableKeys =
    | 'name'
    | 'sku'
    | 'stock'
    | 'salePrice';

type SortDirection = 'ascending' | 'descending';

interface SortConfig {
    key: SortableKeys;
    direction: SortDirection;
}

interface ProductProps {
    products: DataProduct[];
    setProducts: React.Dispatch<
        React.SetStateAction<DataProduct[]>
    >;
    branches: Branch[];
}

type NewProductData = Omit<
    DataProduct,
    'id' | 'status' | 'history'
> & {
    initialStock: number;
    branchId: string;
};

const Product: React.FC<ProductProps> = ({
    products,
    setProducts,
    branches,
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] =
        useState('All');

    const [statusFilter, setStatusFilter] =
        useState('All');

    const [isModalOpen, setIsModalOpen] =
        useState(false);

    const [sortConfig, setSortConfig] =
        useState<SortConfig | null>(null);

    const [productToDelete, setProductToDelete] =
        useState<DataProduct | null>(null);

    const [selectedProduct, setSelectedProduct] =
        useState<DataProduct | null>(null);

    const productsWithTotalStock = useMemo(() => {
        return products.map(product => ({
            ...product,

            totalStock: Object.values(
                product.stockByLocation || {}
            ).reduce(
                (sum, count) => sum + count,
                0
            ),
        }));
    }, [products]);

    const categories = useMemo(() => {
        const allCategories = products.map(
            p => p.categoryId
        );

        return [
            'All',
            ...Array.from(new Set(allCategories)),
        ];
    }, [products]);

    const filteredProducts = useMemo(() => {
        return productsWithTotalStock
            .filter(product =>
                product.name
                    .toLowerCase()
                    .includes(
                        searchTerm.toLowerCase()
                    )
            )

            .filter(
                product =>
                    categoryFilter === 'All' ||
                    product.categoryId ===
                        categoryFilter
            )

            .filter(
                product =>
                    statusFilter === 'All' ||
                    product.status === statusFilter
            );
    }, [
        productsWithTotalStock,
        searchTerm,
        categoryFilter,
        statusFilter,
    ]);

    const sortedProducts = useMemo(() => {
        const sortableItems = [
            ...filteredProducts,
        ];

        if (sortConfig !== null) {
            sortableItems.sort((a, b) => {
                const aValue =
                    sortConfig.key === 'stock'
                        ? a.totalStock
                        : a[sortConfig.key];

                const bValue =
                    sortConfig.key === 'stock'
                        ? b.totalStock
                        : b[sortConfig.key];

                if (
                    typeof aValue === 'number' &&
                    typeof bValue === 'number'
                ) {
                    if (aValue < bValue) {
                        return sortConfig.direction ===
                            'ascending'
                            ? -1
                            : 1;
                    }

                    if (aValue > bValue) {
                        return sortConfig.direction ===
                            'ascending'
                            ? 1
                            : -1;
                    }

                    return 0;
                }

                if (
                    typeof aValue === 'string' &&
                    typeof bValue === 'string'
                ) {
                    return sortConfig.direction ===
                        'ascending'
                        ? aValue.localeCompare(
                              bValue
                          )
                        : bValue.localeCompare(
                              aValue
                          );
                }

                return 0;
            });
        }

        return sortableItems;
    }, [filteredProducts, sortConfig]);

    const requestSort = (
        key: SortableKeys
    ) => {
        let direction: SortDirection =
            'ascending';

        if (
            sortConfig &&
            sortConfig.key === key &&
            sortConfig.direction ===
                'ascending'
        ) {
            direction = 'descending';
        }

        setSortConfig({
            key,
            direction,
        });
    };

    const handleAddProduct = (
    newProductData: any
) => {
    const {
        initialStock,
        branchId,
        ...restData
    } = newProductData;

    const branchName =
        branches.find(
            b => b.id === branchId
        )?.name || 'Unknown Branch';

    const newProduct: DataProduct = {
        ...restData,

        id: crypto.randomUUID(),

        stockByLocation: {
            [branchId]: initialStock,
        },

        status:
            initialStock > 10
                ? 'In Stock'
                : initialStock > 0
                ? 'Low Stock'
                : 'Out of Stock',

        history: [
            {
                date: new Date()
                    .toISOString()
                    .split('T')[0],

                action: 'Initial Stock',

                change: initialStock,

                newStock: initialStock,

                branch: branchName,
            },
        ],
    };

    setProducts(prev => [
        ...prev,
        newProduct,
    ]);
};

    const handleConfirmDelete = () => {
        if (productToDelete) {
            setProducts(prev =>
                prev.filter(
                    product =>
                        product.id !==
                        productToDelete.id
                )
            );

            setProductToDelete(null);
        }
    };

    const handleCancelDelete = () => {
        setProductToDelete(null);
    };

    const renderSortableHeader = (
        label: string,
        key: SortableKeys
    ) => {
        const isSorted =
            sortConfig?.key === key;

        const arrow = isSorted
            ? sortConfig.direction ===
              'ascending'
                ? '▲'
                : '▼'
            : '';

        return (
            <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                onClick={() =>
                    requestSort(key)
                }
                aria-sort={
                    isSorted
                        ? sortConfig.direction
                        : 'none'
                }
            >
                <div className="flex items-center">
                    {label}

                    <span className="ml-2 text-sky-500 w-3">
                        {arrow}
                    </span>
                </div>
            </th>
        );
    };

    const inputClasses =
        'bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm px-3 py-2 text-sm text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-sky-500';

    if (selectedProduct) {
        const fullProduct = products.find(
            p => p.id === selectedProduct.id
        );

        if (!fullProduct) return null;

        return (
            <ProductDetail
                product={fullProduct}
                branches={branches}
                onBack={() =>
                    setSelectedProduct(null)
                }
            />
        );
    }

    return (
        <Placeholder title="Products">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
                <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={e =>
                            setSearchTerm(
                                e.target.value
                            )
                        }
                        className={`${inputClasses} w-full sm:w-48`}
                    />

                    <select
                        value={categoryFilter}
                        onChange={e =>
                            setCategoryFilter(
                                e.target.value
                            )
                        }
                        className={`${inputClasses} w-full sm:w-auto`}
                    >
                        {categories.map(cat => (
                            <option
                                key={cat}
                                value={cat}
                            >
                                {cat === 'All'
                                    ? 'All Categories'
                                    : cat}
                            </option>
                        ))}
                    </select>

                    <select
                        value={statusFilter}
                        onChange={e =>
                            setStatusFilter(
                                e.target.value
                            )
                        }
                        className={`${inputClasses} w-full sm:w-auto`}
                    >
                        <option value="All">
                            All Statuses
                        </option>

                        <option value="In Stock">
                            In Stock
                        </option>

                        <option value="Low Stock">
                            Low Stock
                        </option>

                        <option value="Out of Stock">
                            Out of Stock
                        </option>
                    </select>
                </div>

                <div className="w-full sm:w-auto flex-shrink-0">
                    <button
                        onClick={() =>
                            setIsModalOpen(true)
                        }
                        className="bg-sky-600 text-white px-4 py-2 rounded-md hover:bg-sky-700 transition-colors w-full sm:w-auto"
                    >
                        Add Product
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            {renderSortableHeader(
                                'Product Name',
                                'name'
                            )}

                            {renderSortableHeader(
                                'SKU',
                                'sku'
                            )}

                            {renderSortableHeader(
                                'Total Stock',
                                'stock'
                            )}

                            {renderSortableHeader(
                                'Price',
                                'salePrice'
                            )}

                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Status
                            </th>

                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                        {sortedProducts.length >
                        0 ? (
                            sortedProducts.map(
                                product => (
                                    <tr
                                        key={
                                            product.id
                                        }
                                        className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                                        onClick={() =>
                                            setSelectedProduct(
                                                product
                                            )
                                        }
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                            {
                                                product.name
                                            }
                                        </td>

                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                            {
                                                product.sku
                                            }
                                        </td>

                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                            {
                                                product.totalStock
                                            }
                                        </td>

                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                            $
                                            {product.salePrice.toFixed(
                                                2
                                            )}
                                        </td>

                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <StatusBadge
                                                status={
                                                    product.status
                                                }
                                            />
                                        </td>

                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <button
                                                onClick={e => {
                                                    e.stopPropagation();

                                                    setProductToDelete(
                                                        product
                                                    );
                                                }}
                                                className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                )
                            )
                        ) : (
                            <tr>
                                <td
                                    colSpan={6}
                                    className="text-center py-4 text-gray-500 dark:text-gray-400"
                                >
                                    No products found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <Modal
                    title="Add New Product"
                    onClose={() =>
                        setIsModalOpen(false)
                    }
                >
                    <AddProductForm
    open={isModalOpen}
    branches={branches}
    onClose={() => setIsModalOpen(false)}
    onSubmitProduct={handleAddProduct}
/>
                </Modal>
            )}

            {productToDelete && (
                <ConfirmationModal
                    title="Confirm Deletion"
                    message={`Are you sure you want to delete "${productToDelete.name}"? This action cannot be undone.`}
                    onConfirm={
                        handleConfirmDelete
                    }
                    onCancel={
                        handleCancelDelete
                    }
                />
            )}
        </Placeholder>
    );
};

export default Product;