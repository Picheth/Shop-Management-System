import React, { useMemo } from 'react';

import {
    DataProduct,
    Branch,
    ProductType as ProductTypeInterface,
    Category as CategoryInterface,
    SubCategory as SubCategoryInterface,
    Brand as BrandInterface,
} from '../../types';

import { StatusBadge } from '../ui/StatusBadge';

interface ProductDetailProps {
    product: DataProduct;

    branches: Branch[];

    allCategories: CategoryInterface[];

    allProductTypes: ProductTypeInterface[];

    allSubCategories: SubCategoryInterface[];

    allBrands: BrandInterface[];

    onBack: () => void;
}

const LOW_STOCK_THRESHOLD = 10;

const ProductDetail: React.FC<ProductDetailProps> = ({
    product,
    branches,
    allCategories,
    allProductTypes,
    allSubCategories,
    allBrands,
    onBack,
}) => {

    const totalStock = useMemo(() => {

        return Object.values(
            product.stockByLocation || {}
        ).reduce(
            (sum, qty) => sum + qty,
            0
        );

    }, [product.stockByLocation]);

    const computedStatus = useMemo(() => {

        if (totalStock <= 0) {
            return 'Out of Stock';
        }

        if (totalStock <= LOW_STOCK_THRESHOLD) {
            return 'Low Stock';
        }

        return 'In Stock';

    }, [totalStock]);

    const categoryName = useMemo(() => {

        return (
            allCategories.find(
                cat => cat.id === product.categoryId
            )?.name || 'N/A'
        );

    }, [
        product.categoryId,
        allCategories,
    ]);

    const typeName = useMemo(() => {

        return (
            allProductTypes.find(
                type => type.id === product.typeId
            )?.name || 'N/A'
        );

    }, [
        product.typeId,
        allProductTypes,
    ]);

    const subCategoryName = useMemo(() => {

        return (
            allSubCategories.find(
                subCat =>
                    subCat.id === product.subCategoryId
            )?.name || 'N/A'
        );

    }, [
        product.subCategoryId,
        allSubCategories,
    ]);

    const brandName = useMemo(() => {

        return (
            allBrands.find(
                brand => brand.id === product.brandId
            )?.name || 'N/A'
        );

    }, [
        product.brandId,
        allBrands,
    ]);

    const DetailItem: React.FC<{
        label: string;
        value: React.ReactNode;
    }> = ({
        label,
        value,
    }) => (

        <div className="space-y-1">

            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {label}
            </p>

            <div className="text-sm md:text-base text-gray-900 dark:text-white break-words">
                {value || '-'}
            </div>
        </div>
    );

    const cardClass =
        'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4';

    return (

        <div className="space-y-6">

            {/* Header */}
            <div className="flex items-center justify-between">

                <button
                    onClick={onBack}
                    className="inline-flex items-center text-sky-600 dark:text-sky-400 hover:underline"
                >

                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >

                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 19l-7-7 7-7"
                        />
                    </svg>

                    Back to Products
                </button>
            </div>

            {/* Product Info */}
            <div className={`${cardClass}`}>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Image */}
                    <div className="flex flex-col items-center">

                        <div className="w-56 h-56 bg-gray-100 dark:bg-gray-700 rounded-2xl overflow-hidden flex items-center justify-center">

                            {product.imageUrl ? (

                                <img
                                    src={product.imageUrl}
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                />

                            ) : (

                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-24 w-24 text-gray-400 dark:text-gray-500"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >

                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={1}
                                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                    />
                                </svg>
                            )}
                        </div>

                        <h2 className="mt-4 text-2xl font-bold text-center text-gray-900 dark:text-white">
                            {product.name}
                        </h2>

                        {product.shortName && (

                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                {product.shortName}
                            </p>
                        )}
                    </div>

                    {/* Details */}
                    <div className="lg:col-span-2">

                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">

                            <DetailItem
                                label="SKU"
                                value={product.sku}
                            />

                            <DetailItem
                                label="Type"
                                value={typeName}
                            />

                            <DetailItem
                                label="Category"
                                value={categoryName}
                            />

                            {product.subCategoryId && (

                                <DetailItem
                                    label="Sub-Category"
                                    value={subCategoryName}
                                />
                            )}

                            {product.brandId && (

                                <DetailItem
                                    label="Brand"
                                    value={brandName}
                                />
                            )}

                            {product.model && (

                                <DetailItem
                                    label="Model"
                                    value={product.model}
                                />
                            )}

                            {product.variation && (

                                <DetailItem
                                    label="Variation"
                                    value={product.variation}
                                />
                            )}

                            {product.color && (

                                <DetailItem
                                    label="Color"
                                    value={product.color}
                                />
                            )}

                            {product.storage && (

                                <DetailItem
                                    label="Storage"
                                    value={product.storage}
                                />
                            )}

                            {product.ram && (

                                <DetailItem
                                    label="RAM"
                                    value={product.ram}
                                />
                            )}

                            {product.size && (

                                <DetailItem
                                    label="Size"
                                    value={product.size}
                                />
                            )}

                            <DetailItem
                                label="Sale Price"
                                value={`$${product.salePrice.toFixed(2)}`}
                            />

                            <DetailItem
                                label="Cost Price"
                                value={`$${product.costPrice.toFixed(2)}`}
                            />

                            {product.wholesalePrice && (

                                <DetailItem
                                    label="Wholesale Price"
                                    value={`$${product.wholesalePrice.toFixed(2)}`}
                                />
                            )}

                            <DetailItem
                                label="Total Stock"
                                value={totalStock}
                            />

                            <DetailItem
                                label="Status"
                                value={
                                    <StatusBadge
                                        status={computedStatus}
                                    />
                                }
                            />

                            <DetailItem
                                label="Serial Number Tracking"
                                value={
                                    product.hasSerialNumber
                                        ? 'Enabled'
                                        : 'Disabled'
                                }
                            />

                            <DetailItem
                                label="IMEI Tracking"
                                value={
                                    product.hasIMEI
                                        ? 'Enabled'
                                        : 'Disabled'
                                }
                            />
                        </div>

                        {product.description && (

                            <div className="mt-6">

                                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                                    Description
                                </h3>

                                <div className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                                    {product.description}
                                </div>
                            </div>
                        )}

                        {product.tags &&
                            product.tags.length > 0 && (

                            <div className="mt-6">

                                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                                    Tags
                                </h3>

                                <div className="flex flex-wrap gap-2">

                                    {product.tags.map(tag => (

                                        <span
                                            key={tag}
                                            className="px-2 py-1 rounded-full bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300 text-xs"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Stock by Branch */}
            <div className={cardClass}>

                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Stock by Branch
                </h3>

                <div className="overflow-x-auto">

                    <table className="min-w-full">

                        <thead className="bg-gray-50 dark:bg-gray-700">

                            <tr>

                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-300">
                                    Branch
                                </th>

                                <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-gray-500 dark:text-gray-300">
                                    Stock
                                </th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">

                            {branches.map(branch => (

                                <tr
                                    key={branch.id}
                                    className="hover:bg-gray-50 dark:hover:bg-gray-700"
                                >

                                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                                        {branch.name}
                                    </td>

                                    <td className="px-4 py-3 text-sm text-right text-gray-700 dark:text-gray-300">
                                        {product.stockByLocation?.[branch.id] || 0}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* History */}
            <div className={cardClass}>

                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Stock History
                </h3>

                <div className="overflow-x-auto">

                    <table className="min-w-full">

                        <thead className="bg-gray-50 dark:bg-gray-700">

                            <tr>

                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-300">
                                    Date
                                </th>

                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-300">
                                    Branch
                                </th>

                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-300">
                                    Action
                                </th>

                                <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-gray-500 dark:text-gray-300">
                                    Change
                                </th>

                                <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-gray-500 dark:text-gray-300">
                                    New Stock
                                </th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">

                            {product.history?.length ? (

                                product.history.map(
                                    (item, index) => (

                                        <tr
                                            key={index}
                                            className="hover:bg-gray-50 dark:hover:bg-gray-700"
                                        >

                                            <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">
                                                {item.date}
                                            </td>

                                            <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                                                {item.branch}
                                            </td>

                                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                                                {item.action}
                                            </td>

                                            <td
                                                className={`px-4 py-3 text-sm text-right font-medium ${
                                                    item.change > 0
                                                        ? 'text-green-600 dark:text-green-400'
                                                        : 'text-red-600 dark:text-red-400'
                                                }`}
                                            >
                                                {item.change > 0
                                                    ? `+${item.change}`
                                                    : item.change}
                                            </td>

                                            <td className="px-4 py-3 text-sm text-right text-gray-700 dark:text-gray-300">
                                                {item.newStock}
                                            </td>
                                        </tr>
                                    )
                                )

                            ) : (

                                <tr>

                                    <td
                                        colSpan={5}
                                        className="px-4 py-8 text-center text-gray-500 dark:text-gray-400"
                                    >
                                        No stock history found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;