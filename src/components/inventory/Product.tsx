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
    MasterAttribute,
} from '../../types';

import Placeholder from '../ui/Placeholder';
import Modal from '../ui/Modal';
import ConfirmationModal from '../ui/ConfirmationModal';
import ProductDetail from './ProductDetail';
import AddProductForm from './AddProductForm';
import StatusBadge from '../ui/StatusBadge';
import { EditIcon, TrashIcon, MultiDeleteIcon } from '../ui/Icons';

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
    | 'configuration'
    | 'conditionId'
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
    onDeleteVariant: (id: string) => Promise<void>;
    onDelete: (id: string) => Promise<void>;
    processors: MasterAttribute[];
    rams: MasterAttribute[];
    storages: MasterAttribute[];
    colors: MasterAttribute[];
    regions: MasterAttribute[];
    conditions: MasterAttribute[];
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
    onDeleteVariant,
    onUpdate,
    onDelete,
    processors,
    rams,
    storages,
    colors,
    regions,
    conditions,
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
        const lowerSearch = searchTerm.toLowerCase();

        return productsWithTotalStock
            .filter(product => {
                if (!searchTerm) return true;

                // Resolve names for deep searching
                const typeName = getTypeName(product.typeId).toLowerCase();
                const brandName = getBrandName(product.brandId).toLowerCase();
                const categoryName = getCategoryName(product.categoryId).toLowerCase();
                const config = getConfiguration(product).toLowerCase();
                const condition = getConditionName(product.conditionId).toLowerCase();

                return (
                    product.name.toLowerCase().includes(lowerSearch) ||
                    product.sku.toLowerCase().includes(lowerSearch) ||
                    typeName.includes(lowerSearch) ||
                    brandName.includes(lowerSearch) ||
                    categoryName.includes(lowerSearch) ||
                    config.includes(lowerSearch) ||
                    condition.includes(lowerSearch)
                );
            })
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
        allCategories,
        allProductTypes,
        allBrands,
        rams,
        storages,
        colors,
        conditions,
    ]);

    const sortedProducts = useMemo(() => {
        const sortable = [...filteredProducts];

        if (!sortConfig) return sortable;

        sortable.sort((a, b) => {
            let aValue: string | number;
            let bValue: string | number;

            // Logic to get the resolved sort value based on the key
            switch (sortConfig.key) {
                case 'typeId':
                    aValue = getTypeName(a.typeId);
                    bValue = getTypeName(b.typeId);
                    break;
                case 'brandId':
                    aValue = getBrandName(a.brandId);
                    bValue = getBrandName(b.brandId);
                    break;
                case 'categoryId':
                    aValue = getCategoryName(a.categoryId);
                    bValue = getCategoryName(b.categoryId);
                    break;
                case 'conditionId':
                    aValue = getConditionName(a.conditionId);
                    bValue = getConditionName(b.conditionId);
                    break;
                case 'configuration':
                    aValue = getConfiguration(a);
                    bValue = getConfiguration(b);
                    break;
                default:
                    aValue = (a as any)[sortConfig.key] ?? '';
                    bValue = (b as any)[sortConfig.key] ?? '';
            }

            if (typeof aValue === 'string' && typeof bValue === 'string') {
                return sortConfig.direction ===
                    'ascending'
                    ? aValue.toLowerCase().localeCompare(bValue.toLowerCase())
                    : bValue.toLowerCase().localeCompare(aValue.toLowerCase());
            }

            if (typeof aValue === 'number' && typeof bValue === 'number') {
                return sortConfig.direction ===
                    'ascending'
                    ? aValue - bValue
                    : bValue - aValue;
            }

            return 0;
        });

        return sortable;
    }, [
        filteredProducts,
        sortConfig,
        allCategories,
        allProductTypes,
        allBrands,
        rams,
        storages,
        colors,
        conditions,
        processors,
    ]);

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

    const getProcessorName = (id?: string) => processors.find(p => p.id === id)?.name || '';
    const getRamName = (id?: string) => rams.find(r => r.id === id)?.name || '';
    const getStorageName = (id?: string) => storages.find(s => s.id === id)?.name || '';
    const getColorName = (id?: string) => colors.find(c => c.id === id)?.name || '';
    const getRegionName = (id?: string) => regions.find(r => r.id === id)?.name || '';
    const getConditionName = (id?: string) => conditions.find(c => c.id === id)?.name || '-';

    const getConfiguration = (product: DataProduct) => {
        const parts = [
            getProcessorName(product.processorId),
            getRamName(product.ramId),
            getStorageName(product.storageId),
            getColorName(product.colorId),
            getRegionName(product.regionId)
        ].filter(Boolean);
        
        return parts.length > 0 ? parts.join(' / ') : '-';
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

    const handleDeleteVariantClick = async (id: string) => {
        if (!window.confirm('Delete this specific variant configuration?')) return;
        await onDeleteVariant(id);
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
            processors={processors}
            rams={rams}
            storages={storages}
            colors={colors}
            regions={regions}
            conditions={conditions}
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
                                'Configuration',
                                'configuration'
                            )}

                            {renderSortableHeader(
                                'Condition',
                                'conditionId'
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
                                        {getConfiguration(product)}
                                    </td>

                                    <td className="px-4 py-3 text-sm">
                                        {getConditionName(product.conditionId)}
                                    </td>

                                    <td className="px-4 py-3 text-sm">
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
                                                title="Edit Variant"
                                            >
                                            <EditIcon />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteVariantClick(product.id)}
                                                className="text-orange-500 hover:text-orange-600 transition-colors"
                                                title="Delete Only This Variant"
                                            >
                                            <TrashIcon />
                                            </button>
                                            <button
                                                onClick={() =>
                                                    setProductToDelete(
                                                        product
                                                    )
                                                }
                                                className="text-red-600 hover:text-red-800 transition-colors"
                                                title="Delete Entire Product Model"
                                            >
                                            <MultiDeleteIcon />
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
                        processors={processors}
                        rams={rams}
                        storages={storages}
                        colors={colors}
                        regions={regions}
                        conditions={conditions}
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