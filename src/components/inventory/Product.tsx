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

    onAdd: (product: any) => Promise<void>;
    onAddBrand: (brand: any) => Promise<BrandInterface>;
    onAddCategory: (category: any) => Promise<CategoryInterface>;
    onUpdate: (product: DataProduct) => Promise<void>;
    onDelete: (id: string) => Promise<void>;
}

const Product: React.FC<ProductProps> = ({
    products,
    branches,
    allCategories,
    allSubCategories,
    allBrands,
    allProductTypes,
    onAdd,
    onAddBrand,
    onAddCategory,
    onUpdate,
    onDelete,
}) => {
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

    const [editingProduct, setEditingProduct] =
        useState<DataProduct | null>(null);

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
        return allBrands.find(b => b.id === brandId)?.name || '-';
    };

    const handleFormSave = async (formData: any) => {
        if (editingProduct) {
            await onUpdate({
                ...editingProduct,
                ...formData,
            });
        } else {
            await onAdd(formData);
        }
        setEditingProduct(null);
        setIsModalOpen(false);
    };

    const handleDeleteProduct = async (id: string) => {
        await onDelete(id);
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
            onEdit={() => {
                setEditingProduct(selectedProduct);
                setIsModalOpen(true);
            }}
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
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => {
                                                    setEditingProduct(product);
                                                    setIsModalOpen(true);
                                                }}
                                                className="text-amber-500 hover:text-amber-600 transition-colors"
                                                title="Edit Product"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h10a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() =>
                                                    setProductToDelete(
                                                        product
                                                    )
                                                }
                                                className="text-red-600 hover:text-red-800 transition-colors"
                                                title="Delete Product"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )
                        )}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <Modal
                    title={editingProduct ? "Edit Product" : "Add Product"}
                    onClose={() => {
                        setIsModalOpen(false);
                        setEditingProduct(null);
                    }}
                >
                    <AddProductForm
                        initialData={editingProduct || undefined}
                        onSubmit={
                            handleFormSave
                        }
                        onCancel={() =>
                            {
                                setIsModalOpen(false);
                                setEditingProduct(null);
                            }
                        }
                        branches={branches}
                        processors={[]}
                        rams={[]}
                        storages={[]}
                        colors={[]}
                        regions={[]}
                        conditions={[]}
                        existingCategories={
                            allCategories
                        }
                        existingSubCategories={
                            allSubCategories
                        }
                        existingBrands={allBrands}
                        onQuickAddBrand={onAddBrand}
                        onQuickAddCategory={onAddCategory}
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