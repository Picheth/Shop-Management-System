import React, { useMemo, useState } from 'react';

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

    onEdit: () => void;
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
    onEdit,
}) => {
    const [activeTab, setActiveTab] = useState<'overview' | 'inventory' | 'history'>('overview');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const tabButtonClasses = (tab: typeof activeTab) => 
        `px-6 py-3 text-sm font-medium transition-colors border-b-2 ${
            activeTab === tab 
                ? 'border-sky-600 text-sky-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
        }`;

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

    const filteredHistory = useMemo(() => {
        if (!product.history) return [];
        return product.history.filter(item => {
            const itemDate = item.date;
            if (startDate && itemDate < startDate) return false;
            if (endDate && itemDate > endDate) return false;
            return true;
        });
    }, [product.history, startDate, endDate]);

    const handleExportCSV = () => {
        if (!filteredHistory.length) return;

        const productRow = `"Product Name: ${product.name}","Product SKU: ${product.sku}"`;
        const headers = ['Date', 'Branch', 'Action', 'Change', 'New Stock'];
        const csvContent = [
            productRow,
            headers.join(','),
            ...filteredHistory.map(item => [
                item.date,
                `"${item.branch}"`,
                `"${item.action}"`,
                item.change,
                item.newStock
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `stock_history_${product.sku}_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

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
                    className="inline-flex items-center text-sky-600 dark:text-sky-400 hover:underline no-print"
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

                <div className="flex gap-2 no-print">
                    <button
                        onClick={() => window.print()}
                        className="inline-flex items-center px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 mr-2"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-4a2 2 0 01-2-2H5a2 2 0 01-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                            />
                        </svg>
                        Print
                    </button>

                    <button
                        onClick={onEdit}
                        className="inline-flex items-center px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 mr-2"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h10a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                        </svg>
                        Edit Product
                    </button>
                </div>
            </div>

            {/* Tabs Navigation */}
            <div className="flex border-b border-gray-200 dark:border-gray-700 no-print">
                <button
                    onClick={() => setActiveTab('overview')}
                    className={tabButtonClasses('overview')}
                >
                    Overview
                </button>
                <button
                    onClick={() => setActiveTab('inventory')}
                    className={tabButtonClasses('inventory')}
                >
                    Inventory
                </button>
                <button
                    onClick={() => setActiveTab('history')}
                    className={tabButtonClasses('history')}
                >
                    History
                </button>
            </div>

            {/* Product Info */}
            {activeTab === 'overview' && (
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

                            {(product.color ||
    product.storage ||
    product.ram ||
    product.size ||
    product.model) && (

    <div className="mt-6">

        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
            Specifications
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">

            {product.model && (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        Model
                    </p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {product.model}
                    </p>
                </div>
            )}

            {product.color && (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        Color
                    </p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {product.color}
                    </p>
                </div>
            )}

            {product.storage && (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        Storage
                    </p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {product.storage}
                    </p>
                </div>
            )}

            {product.ram && (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        RAM
                    </p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {product.ram}
                    </p>
                </div>
            )}

            {product.size && (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        Size
                    </p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {product.size}
                    </p>
                </div>
            )}

        </div>
    </div>
)}

{product.attributes && product.attributes.length > 0 && (
    <div className="mt-6">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
            Additional Attributes
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {product.attributes.map((attr, index) => (
                <div 
                    key={index} 
                    className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 border border-gray-100 dark:border-gray-600"
                >
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        {attr.name}
                    </p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {attr.value}
                    </p>
                    {attr.description && (
                        <p className="text-[10px] text-gray-400 mt-1 italic">
                            {attr.description}
                        </p>
                    )}
                </div>
            ))}
        </div>
    </div>
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
            )}

            {/* Stock by Branch */}
            {activeTab === 'inventory' && (
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
            )}

            {/* History */}
            {activeTab === 'history' && (
                <div className={cardClass}>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Stock Movement & Sales Logs
                    </h3>

                    {/* Date Filters */}
                    <div className="flex flex-wrap gap-3 no-print">
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">From</span>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm text-gray-900 dark:text-white focus:ring-1 focus:ring-sky-500"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">To</span>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm text-gray-900 dark:text-white focus:ring-1 focus:ring-sky-500"
                            />
                        </div>
                        {filteredHistory.length > 0 && (
                            <button
                                onClick={handleExportCSV}
                                className="inline-flex items-center px-2 py-1 bg-sky-50 dark:bg-sky-900/20 text-sky-600 dark:text-sky-400 border border-sky-100 dark:border-sky-800 rounded text-xs font-medium hover:bg-sky-100 dark:hover:bg-sky-900/40 transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                Export CSV
                            </button>
                        )}
                        {(startDate || endDate) && (
                            <button
                                onClick={() => { setStartDate(''); setEndDate(''); }}
                                className="text-xs text-sky-600 hover:text-sky-800 font-medium"
                            >
                                Clear
                            </button>
                        )}
                    </div>
                </div>

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

                            {filteredHistory.length ? (

                                filteredHistory.map(
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
            )}
        </div>
    );
};

export default ProductDetail;