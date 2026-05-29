import React, {
    useMemo,
    useState,
    useEffect,
    useRef,
} from 'react';

import {
    DataProduct,
    Branch,
    ProductType as ProductTypeInterface,
    Category as CategoryInterface,
    SubCategory as SubCategoryInterface,
    Brand as BrandInterface,
} from '../../types';

import Placeholder from '../ui/Placeholder';
import Modal from '../ui/Modal';
import ConfirmationModal from '../ui/ConfirmationModal';
import ProductDetail from './ProductDetail';
import AddProductForm from './AddProductForm';
import StatusBadge from '../ui/StatusBadge';

type AddProductFormData = Omit<
    DataProduct,
    | 'id'
    | 'createdAt'
    | 'updatedAt'
    | 'stockByLocation'
    | 'history'
    | 'status'
> & {
    initialStock: number;
    branchId: string;
};

type SortableKeys =
    | 'name'
    | 'sku'
    | 'typeId'
    | 'brandId'
    | 'categoryId'
    | 'totalStock'
    | 'status';

interface ProductProps {
    products: DataProduct[];
    branches: Branch[];

    allCategories: CategoryInterface[];
    allSubCategories: SubCategoryInterface[];
    allBrands: BrandInterface[];
    allProductTypes: ProductTypeInterface[];
}

const Product: React.FC<ProductProps> = ({
    products: initialProducts,
    branches,
    allCategories,
    allSubCategories,
    allBrands,
    allProductTypes,
}) => {
    const [products, setProducts] =
        useState<DataProduct[]>(initialProducts);

    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] =
        useState('All');

    const [statusFilter, setStatusFilter] =
        useState('All');

    const [sortConfig, setSortConfig] = useState<{
        key: SortableKeys;
        direction: 'ascending' | 'descending';
    } | null>(null);

    const [isModalOpen, setIsModalOpen] =
        useState(false);

    const [productToDelete, setProductToDelete] =
        useState<DataProduct | null>(null);

    const [selectedProduct, setSelectedProduct] =
        useState<DataProduct | null>(null);

    const [selectedIds, setSelectedIds] =
        useState<Set<string>>(new Set());

    const [currentPage, setCurrentPage] =
        useState(1);

    const [itemsPerPage, setItemsPerPage] =
        useState(10);

    const headerCheckboxRef =
        useRef<HTMLInputElement>(null);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, categoryFilter, statusFilter]);

    const productsWithTotalStock = useMemo(() => {
        return products.map(product => ({
            ...product,
            totalStock: Object.values(
                product.stockByLocation || {}
            ).reduce((sum, qty) => sum + qty, 0),
        }));
    }, [products]);

    const categories = useMemo(() => {
        return [
            'All',
            ...new Set(
                allCategories.map(cat => cat.id)
            ),
        ];
    }, [allCategories]);

    const filteredProducts = useMemo(() => {
        return productsWithTotalStock
            .filter(product =>
                searchTerm === ''
                    ? true
                    : product.name
                          .toLowerCase()
                          .includes(
                              searchTerm.toLowerCase()
                          ) ||
                      product.sku
                          .toLowerCase()
                          .includes(
                              searchTerm.toLowerCase()
                          )
            )
            .filter(product =>
                categoryFilter === 'All'
                    ? true
                    : product.categoryId ===
                      categoryFilter
            )
            .filter(product =>
                statusFilter === 'All'
                    ? true
                    : product.status === statusFilter
            );
    }, [
        productsWithTotalStock,
        searchTerm,
        categoryFilter,
        statusFilter,
    ]);

    const sortedProducts = useMemo(() => {
        const sortable = [...filteredProducts];

        if (!sortConfig) return sortable;

        sortable.sort((a, b) => {
            const aValue = a[
                sortConfig.key
            ] as string | number;

            const bValue = b[
                sortConfig.key
            ] as string | number;

            if (
                typeof aValue === 'string' &&
                typeof bValue === 'string'
            ) {
                return sortConfig.direction ===
                    'ascending'
                    ? aValue.localeCompare(bValue)
                    : bValue.localeCompare(aValue);
            }

            if (
                typeof aValue === 'number' &&
                typeof bValue === 'number'
            ) {
                return sortConfig.direction ===
                    'ascending'
                    ? aValue - bValue
                    : bValue - aValue;
            }

            return 0;
        });

        return sortable;
    }, [filteredProducts, sortConfig]);

    const totalPages = Math.ceil(
        sortedProducts.length / itemsPerPage
    );

    const startIndex =
        (currentPage - 1) * itemsPerPage;

    const paginatedProducts =
        sortedProducts.slice(
            startIndex,
            startIndex + itemsPerPage
        );

    const requestSort = (key: SortableKeys) => {
        let direction:
            | 'ascending'
            | 'descending' = 'ascending';

        if (
            sortConfig &&
            sortConfig.key === key &&
            sortConfig.direction === 'ascending'
        ) {
            direction = 'descending';
        }

        setSortConfig({ key, direction });
    };

    const getSortIcon = (key: SortableKeys) => {
        if (!sortConfig || sortConfig.key !== key)
            return null;

        return sortConfig.direction ===
            'ascending'
            ? ' 🔼'
            : ' 🔽';
    };

    const renderSortableHeader = (
        label: string,
        key: SortableKeys
    ) => (
        <th
            className="px-6 py-3 text-left text-xs font-medium uppercase cursor-pointer"
            onClick={() => requestSort(key)}
        >
            {label}
            {getSortIcon(key)}
        </th>
    );

    const getCategoryName = (
        categoryId?: string
    ) => {
        return (
            allCategories.find(
                c => c.id === categoryId
            )?.name || '-'
        );
    };

    const getTypeName = (typeId?: string) => {
        return (
            allProductTypes.find(
                t => t.id === typeId
            )?.name || '-'
        );
    };

    const getBrandName = (
        brandId?: string
    ) => {
        return (
            allBrands.find(
                b => b.id === brandId
            )?.name || '-'
        );
    };

    const handleAddProduct = (
        newProductData: AddProductFormData
    ) => {
        const branchName =
            branches.find(
                b => b.id === newProductData.branchId
            )?.name || 'Unknown Branch';

        const newProduct: DataProduct = {
            ...newProductData,

            id: crypto.randomUUID(),

            productNumber:
                newProductData.productNumber ||
                `PRD-${Date.now()}`,

            status:
                newProductData.initialStock > 0
                    ? 'In Stock'
                    : 'Out of Stock',

            stockByLocation: {
                [newProductData.branchId]:
                    newProductData.initialStock,
            },

            history: [
                {
                    date: new Date()
                        .toISOString()
                        .split('T')[0],

                    action: 'Initial Stock',

                    change:
                        newProductData.initialStock,

                    newStock:
                        newProductData.initialStock,

                    branch: branchName,

                    reason:
                        'New product added',
                },
            ],
        };

        setProducts(prev => [
            newProduct,
            ...prev,
        ]);

        setIsModalOpen(false);
    };

    const handleDeleteProduct = (
        id: string
    ) => {
        setProducts(prev =>
            prev.filter(p => p.id !== id)
        );

        setProductToDelete(null);
    };

    if (selectedProduct) {
        return (
            <ProductDetail
            product={selectedProduct}
            branches={branches}
            allCategories={allCategories}
            allProductTypes={allProductTypes}
            allSubCategories={allSubCategories}
            allBrands={allBrands}
            onBack={() => setSelectedProduct(null)}
            />
        );
    }

    return (
        <Placeholder title="Products">
            <div className="flex justify-between mb-4 gap-4">
                <input
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={e =>
                        setSearchTerm(
                            e.target.value
                        )
                    }
                    className="border px-3 py-2 rounded w-64"
                />

                <button
                    onClick={() =>
                        setIsModalOpen(true)
                    }
                    className="bg-sky-600 text-white px-4 py-2 rounded"
                >
                    Add Product
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full border">
                    <thead>
                        <tr>
                            {renderSortableHeader(
                                'Product',
                                'name'
                            )}

                            {renderSortableHeader(
                                'SKU',
                                'sku'
                            )}

                            {renderSortableHeader(
                                'Type',
                                'typeId'
                            )}

                            {renderSortableHeader(
                                'Brand',
                                'brandId'
                            )}

                            {renderSortableHeader(
                                'Category',
                                'categoryId'
                            )}

                            {renderSortableHeader(
                                'Stock',
                                'totalStock'
                            )}

                            {renderSortableHeader(
                                'Status',
                                'status'
                            )}

                            <th className="px-4 py-3">
                                Actions
                            </th>
                        </tr>
                    </thead>

                    <tbody>
                        {paginatedProducts.map(
                            product => (
                                <tr
                                    key={product.id}
                                    className="border-t"
                                >
                                    <td className="px-4 py-3">
                                        <button
                                            onClick={() =>
                                                setSelectedProduct(
                                                    product
                                                )
                                            }
                                            className="text-sky-600 hover:underline"
                                        >
                                            {
                                                product.name
                                            }
                                        </button>
                                    </td>

                                    <td className="px-4 py-3">
                                        {
                                            product.sku
                                        }
                                    </td>

                                    <td className="px-4 py-3">
                                        {getTypeName(
                                            product.typeId
                                        )}
                                    </td>

                                    <td className="px-4 py-3">
                                        {getBrandName(
                                            product.brandId
                                        )}
                                    </td>

                                    <td className="px-4 py-3">
                                        {getCategoryName(
                                            product.categoryId
                                        )}
                                    </td>

                                    <td className="px-4 py-3">
                                        {
                                            product.totalStock
                                        }
                                    </td>

                                    <td className="px-4 py-3">
                                        <StatusBadge
                                            status={
                                                product.status
                                            }
                                        />
                                    </td>

                                    <td className="px-4 py-3">
                                        <button
                                            onClick={() =>
                                                setProductToDelete(
                                                    product
                                                )
                                            }
                                            className="text-red-600"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            )
                        )}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <Modal
                    title="Add Product"
                    onClose={() =>
                        setIsModalOpen(false)
                    }
                >
                    <AddProductForm
                        onAddProduct={
                            handleAddProduct
                        }
                        onCancel={() =>
                            setIsModalOpen(false)
                        }
                        branches={branches}
                        existingCategories={
                            allCategories
                        }
                        existingSubCategories={
                            allSubCategories
                        }
                        existingBrands={allBrands}
                        existingProductTypes={
                            allProductTypes
                        }
                    />
                </Modal>
            )}

            {productToDelete && (
                <ConfirmationModal
                    title="Delete Product"
                    message={`Delete "${productToDelete.name}" ?`}
                    onConfirm={() =>
                        handleDeleteProduct(
                            productToDelete.id
                        )
                    }
                    onCancel={() =>
                        setProductToDelete(null)
                    }
                />
            )}
        </Placeholder>
    );
};

export default Product;