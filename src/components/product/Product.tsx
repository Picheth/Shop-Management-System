import React, { useState } from 'react';

import {
    DataProduct,
    Branch,
    ProductType as ProductTypeInterface,
    Category as CategoryInterface,
    SubCategory as SubCategoryInterface,
    Brand as BrandInterface,
    MasterAttribute,
} from '../../types';

import { useProducts } from '../../hooks/useProducts';

import ProductTable from './ProductTable';
import ProductFilters from './ProductFilters';
import ProductToolbar from './ProductToolbar';
import ProductPagination from './ProductPagination';

import Placeholder from '../ui/Placeholder';
import Modal from '../ui/Modal';
import ProductDetail from './ProductDetail';
import AddProductForm from './AddProductForm';

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

    onUpdate,
    onDeleteVariant,
    onDelete,

    processors,
    rams,
    storages,
    colors,
    regions,
    conditions,
}) => {

    const {
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
        totalCount,
    } = useProducts({
        products,
        allCategories,
        allProductTypes,
        processors,
        rams,
        storages,
        colors,
        regions,
    });

    const [isModalOpen, setIsModalOpen] = useState(false);

    const [editingProduct, setEditingProduct] =
        useState<DataProduct | null>(null);

    const [productToDelete, setProductToDelete] =
        useState<DataProduct | null>(null);

    const [selectedProduct, setSelectedProduct] =
        useState<DataProduct | null>(null);

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
        <Placeholder title="Product Catalog">

            <ProductToolbar
                onAddProduct={() => setIsModalOpen(true)}
                totalCount={totalCount}
            />

            <ProductFilters
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                categoryFilter={categoryFilter}
                onCategoryChange={setCategoryFilter}
                statusFilter={statusFilter}
                onStatusChange={setStatusFilter}
                categories={allCategories}
            />

            <ProductTable
                products={paginatedItems}
                sortConfig={sortConfig}
                requestSort={requestSort}

                allProductTypes={allProductTypes}
                allCategories={allCategories}
                allBrands={allBrands}

                processors={processors}
                rams={rams}
                storages={storages}
                colors={colors}
                regions={regions}

                onView={setSelectedProduct}

                onEdit={(p) => {
                    setEditingProduct(p);
                    setIsModalOpen(true);
                }}

                onDeleteVariant={onDeleteVariant}
                onDeleteProduct={setProductToDelete}
            />

            <ProductPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                totalCount={totalCount} itemsPerPage={0}            />

            {isModalOpen && (
                <Modal
                    title={editingProduct ? 'Edit Product' : 'Add Product'}
                    onClose={() => {
                        setIsModalOpen(false);
                        setEditingProduct(null);
                    }}
                >
                    <AddProductForm
                        initialData={editingProduct || undefined}
                        onSubmit={handleFormSave}
                        onCancel={() => {
                            setIsModalOpen(false);
                            setEditingProduct(null);
                        }}

                        products={products}
                        branches={branches}

                        processors={processors}
                        rams={rams}
                        storages={storages}
                        colors={colors}
                        regions={regions}
                        conditions={conditions}

                        existingCategories={allCategories}
                        existingSubCategories={allSubCategories}
                        existingBrands={allBrands}

                        onQuickAddBrand={onAddBrand}
                        onQuickAddCategory={onAddCategory}

                        existingProductTypes={allProductTypes}
                    />
                </Modal>
            )}

        </Placeholder>
    );
};

export default Product;