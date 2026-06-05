import React, { useMemo, useState, useRef, useEffect } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ProductVariant, MasterAttribute, Product } from '../../types';
import { getAttributeName, sanitizeCSV } from '../../utils/productHelpers';
import Modal from '../ui/Modal';
import FormInput from '../ui/FormInput';
import { PdfIcon, ExportIcon } from '../ui/Icons';

interface VariantTableProps {
    variants: ProductVariant[];
    products: Product[];
    colors: MasterAttribute[];
    storages: MasterAttribute[];
    search: string;
    onDelete: (id: string) => Promise<void>;
    onUpdate: (variant: ProductVariant) => Promise<void>;
}

type SortableKeys = 'sku' | 'product_name' | 'color_id' | 'storage_id' | 'price' | 'stock_quantity' | 'status';

const AVAILABLE_COLUMNS = [
    { id: 'sku', label: 'SKU' },
    { id: 'productName', label: 'Product Name' },
    { id: 'color', label: 'Color' },
    { id: 'storage', label: 'Storage' },
    { id: 'price', label: 'Price' },
    { id: 'stock', label: 'Stock' },
    { id: 'status', label: 'Status' }
];

const VariantTable: React.FC<VariantTableProps> = ({
    variants, products, colors, storages, search, onDelete, onUpdate
}) => {
    const [sortConfig, setSortConfig] = useState<{ key: SortableKeys; direction: 'asc' | 'desc' } | null>(null);
    const [colorFilter, setColorFilter] = useState('All');
    const [isBulkPriceModalOpen, setIsBulkPriceModalOpen] = useState(false);
    const [bulkPrice, setBulkPrice] = useState('');
    const [bulkPriceUpdateMode, setBulkPriceUpdateMode] = useState<'fixed' | 'percentage'>('fixed');
    const [isBulkStockModalOpen, setIsBulkStockModalOpen] = useState(false);
    const [bulkStockUpdateMode, setBulkStockUpdateMode] = useState<'replace' | 'add'>('replace');
    const [bulkStock, setBulkStock] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);

    // Column Selector States
    const initialVisibleColumns = ['sku', 'productName', 'color', 'storage', 'price', 'stock'];
    const [columnConfigs, setColumnConfigs] = useState(AVAILABLE_COLUMNS);
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const [visibleColumns, setVisibleColumns] = useState<string[]>(initialVisibleColumns);
    const [showColumnSelector, setShowColumnSelector] = useState(false);
    const columnSelectorRef = useRef<HTMLDivElement>(null);

    // Click away listener for column selector
    useEffect(() => { // This useEffect is already present in the context, no change needed here.
        const handleClickOutside = (event: MouseEvent) => {
            if (columnSelectorRef.current && !columnSelectorRef.current.contains(event.target as Node)) {
                setShowColumnSelector(false);
            }
        };
        if (showColumnSelector) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showColumnSelector]);

    const getProductName = (id: string) => {
        const product = products.find(p => p.id === id || p.product_spec_id === id);
        return product?.name || '-';
    };

    const sortedAndFilteredVariants = useMemo(() => {
        let result = [...variants];

        // 1. Filter by search (case-insensitive)
        if (search.trim()) {
            const term = search.toLowerCase();
            result = result.filter(v => {
                const productName = getProductName(v.product_id).toLowerCase();
                const colorName = getAttributeName(colors, v.color_id, '').toLowerCase();
                const storageName = getAttributeName(storages, v.storage_id, '').toLowerCase();
                return (
                    productName.includes(term) ||
                    v.sku.toLowerCase().includes(term) ||
                    colorName.includes(term) ||
                    storageName.includes(term)
                );
            });
        }

        // 2. Filter by Color
        if (colorFilter !== 'All') {
            result = result.filter(v => v.color_id === colorFilter);
        }

        // 3. Sort
        if (sortConfig) {
            result.sort((a, b) => {
                let aVal: any;
                let bVal: any;

                switch (sortConfig.key) {
                    case 'sku': 
                        aVal = a.sku; bVal = b.sku; break;
                    case 'product_name': 
                        aVal = getProductName(a.product_id); bVal = getProductName(b.product_id); break;
                    case 'color_id': 
                        aVal = getAttributeName(colors, a.color_id); bVal = getAttributeName(colors, b.color_id); break;
                    case 'storage_id': 
                        aVal = getAttributeName(storages, a.storage_id); bVal = getAttributeName(storages, b.storage_id); break;
                    case 'price': 
                        aVal = a.price || 0; bVal = b.price || 0; break;
                    case 'stock_quantity': 
                        aVal = a.stock_quantity || 0; bVal = b.stock_quantity || 0; break;
                    case 'status': 
                        aVal = a.is_active ? 1 : 0; bVal = b.is_active ? 1 : 0; break;
                    default: 
                        aVal = ''; bVal = '';
                }

                if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return result;
    }, [variants, search, colorFilter, sortConfig, products, colors, storages]);

    const requestSort = (key: SortableKeys) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const handleExportCSV = () => {
        if (!sortedAndFilteredVariants.length) return;

        const activeCols = columnConfigs.filter(col => visibleColumns.includes(col.id));
        const headers = activeCols.map(col => col.label);

        const rows = sortedAndFilteredVariants.map(v => [
            ...activeCols.map(col => {
                switch(col.id) {
                    case 'sku': return sanitizeCSV(v.sku);
                    case 'product_name': return `"${getProductName(v.product_id).replace(/"/g, '""')}"`;
                    case 'color_id': return `"${getAttributeName(colors, v.color_id).replace(/"/g, '""')}"`;
                    case 'storage_id': return `"${getAttributeName(storages, v.storage_id).replace(/"/g, '""')}"`;
                    case 'price': return v.price || 0;
                    case 'stock_quantity': return v.stock_quantity || 0;
                    case 'status': return v.is_active ? 'Active' : 'Inactive';
                    default: return '';
                }
            })
        ].join(','));

        const csvContent = [headers.join(','), ...rows].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `variant_price_list_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleExportPDF = () => {
        const doc = new jsPDF('p', 'mm', 'a4');
        const pageWidth = doc.internal.pageSize.getWidth();
        
        const activeCols = columnConfigs.filter(col => visibleColumns.includes(col.id));
        const headers = [activeCols.map(col => col.label)];
        
        const data = sortedAndFilteredVariants.map(v => {
            return activeCols.map(col => {
                switch(col.id) {
                    case 'sku': return v.sku;
                    case 'product_name': return getProductName(v.product_id);
                    case 'color_id': return getAttributeName(colors, v.color_id);
                    case 'storage_id': return getAttributeName(storages, v.storage_id);
                    case 'price': return `$${(v.price || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
                    case 'stock_quantity': return v.stock_quantity || 0;
                    case 'status': return v.is_active ? 'Active' : 'Inactive';
                    default: return '';
                }
            });
        });

        doc.setFontSize(18);
        doc.text("Product Price List", pageWidth / 2, 15, { align: 'center' });
        
        doc.setFontSize(8);
        doc.setTextColor(100);
        doc.text(`Generated on: ${new Date().toLocaleString()} | Items: ${sortedAndFilteredVariants.length}`, pageWidth / 2, 21, { align: 'center' });

        autoTable(doc, {
            startY: 25,
            head: headers,
            body: data,
            theme: 'striped',
            headStyles: { fillColor: [14, 165, 233], textColor: 255 },
            styles: { fontSize: 8 },
        });

        doc.save(`price_list_${new Date().toISOString().split('T')[0]}.pdf`);
    };

    const handleBulkPriceUpdate = async () => {
        const val = parseFloat(bulkPrice);
        if (isNaN(val)) {
            alert("Please enter a valid numeric value.");
            return;
        }

        if (bulkPriceUpdateMode === 'fixed' && val < 0) {
            alert("Fixed price cannot be negative.");
            return;
        }

        setIsUpdating(true);
        try {
            // Apply the update to each currently filtered variant
            const updatePromises = sortedAndFilteredVariants.map(v => {
                const newPrice = bulkPriceUpdateMode === 'percentage' 
                    ? (v.price || 0) * (1 + val / 100)
                    : val;
                
                return onUpdate({ 
                    ...v, 
                    price: Math.round(Math.max(0, newPrice) * 100) / 100 
                });
            });
            await Promise.all(updatePromises);
            setIsBulkPriceModalOpen(false);
            setBulkPrice('');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleBulkStockUpdate = async () => {
        const val = parseInt(bulkStock);
        if (isNaN(val)) {
            alert("Please enter a valid numeric value.");
            return;
        }

        if (bulkStockUpdateMode === 'replace' && val < 0) {
            alert("Stock quantity cannot be negative.");
            return;
        }

        setIsUpdating(true);
        try {
            // Apply the update to each currently filtered variant
            const updatePromises = sortedAndFilteredVariants.map(v => {
                const newStock = bulkStockUpdateMode === 'add' 
                    ? (v.stock_quantity || 0) + val
                    : val;

                return onUpdate({ 
                    ...v, 
                    stock_quantity: Math.max(0, newStock) 
                });
            });
            await Promise.all(updatePromises);
            setIsBulkStockModalOpen(false);
            setBulkStock('');
        } finally {
            setIsUpdating(false);
        }
    };

    const toggleStatus = async (variant: ProductVariant) => {
        await onUpdate({ ...variant, is_active: !variant.is_active });
    };

    const handleDragStart = (index: number) => {
        setDraggedIndex(index);
    };

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        if (draggedIndex === null || draggedIndex === index) return;

        const newConfigs = [...columnConfigs];
        const draggedItem = newConfigs[draggedIndex];
        
        // Remove from old position and insert at new position
        newConfigs.splice(draggedIndex, 1);
        newConfigs.splice(index, 0, draggedItem);

        setDraggedIndex(index);
        setColumnConfigs(newConfigs);
    };

    const toggleColumn = (columnId: string) => {
        setVisibleColumns(prev => {
            if (prev.includes(columnId)) {
                if (prev.length === 1) return prev; // Prevent zero columns
                return prev.filter(id => id !== columnId);
            }
            return [...prev, columnId];
        });
    };

    const handleResetColumns = () => {
        setColumnConfigs(AVAILABLE_COLUMNS); // Reset order
        setVisibleColumns(initialVisibleColumns); // Reset visibility
    };

    const renderHeader = (label: string, key: SortableKeys, align: 'left' | 'center' | 'right' = 'left') => {
        const isActive = sortConfig?.key === key;
        return (
            <th 
                className={`px-4 py-3 text-${align} text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-300 cursor-pointer hover:text-sky-600 transition-colors group`}
                onClick={() => requestSort(key)}
            >
                <div className={`flex items-center ${align === 'center' ? 'justify-center' : align === 'right' ? 'justify-end' : ''} gap-1`}>
                    {label}
                    <span className={`transition-opacity ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-40'}`}>
                        {sortConfig?.direction === 'desc' ? '↓' : '↑'}
                    </span>
                </div>
            </th>
        );
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-700/30 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-4">
                    <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                        Matching Variants: <span className="text-sky-600 tabular-nums">{sortedAndFilteredVariants.length}</span>
                    </span>
                    
                    {sortedAndFilteredVariants.length > 0 && (
                        <button
                            onClick={() => setIsBulkPriceModalOpen(true)}
                            className="text-[10px] font-black uppercase tracking-widest text-sky-600 hover:text-sky-700 transition-colors bg-white dark:bg-gray-800 px-2 py-1 rounded border border-gray-200 dark:border-gray-700 shadow-sm"
                        >
                            Bulk Update Price
                        </button>
                    )}
                    {sortedAndFilteredVariants.length > 0 && (
                        <button
                            onClick={() => setIsBulkStockModalOpen(true)}
                            className="text-[10px] font-black uppercase tracking-widest text-sky-600 hover:text-sky-700 transition-colors bg-white dark:bg-gray-800 px-2 py-1 rounded border border-gray-200 dark:border-gray-700 shadow-sm"
                        >
                            Bulk Update Stock
                        </button>
                    )}
                    {sortedAndFilteredVariants.length > 0 && (
                        <div className="flex items-center gap-1.5 ml-2 border-l border-gray-200 dark:border-gray-700 pl-4">
                            <button
                                onClick={handleExportPDF}
                                className="text-[10px] font-black uppercase tracking-widest text-sky-600 hover:text-sky-700 transition-colors bg-white dark:bg-gray-800 px-2 py-1 rounded border border-gray-200 dark:border-gray-700 shadow-sm flex items-center gap-1.5"
                                title="Export PDF Price List"
                            >
                                <PdfIcon size={14} />
                                PDF
                            </button>
                            <button
                                onClick={handleExportCSV}
                                className="text-[10px] font-black uppercase tracking-widest text-sky-600 hover:text-sky-700 transition-colors bg-white dark:bg-gray-800 px-2 py-1 rounded border border-gray-200 dark:border-gray-700 shadow-sm flex items-center gap-1.5"
                                title="Export CSV Data"
                            >
                                <ExportIcon size={14} />
                                CSV
                            </button>
                        </div>
                    )}
                </div>
                
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Color Filter</span>
                    <select
                        value={colorFilter}
                        onChange={(e) => setColorFilter(e.target.value)}
                        className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-sky-500 outline-none cursor-pointer"
                    >
                        <option value="All">All Colors</option>
                        {colors.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm text-nowrap">
                <table className="min-w-full bg-white dark:bg-gray-800">
                    <thead className="bg-gray-50 dark:bg-gray-900/50">
                        <tr>
                            {renderHeader('SKU', 'sku')}
                            {renderHeader('Product Name', 'product_name')}
                            {renderHeader('Color', 'color_id')}
                            {renderHeader('Storage', 'storage_id')}
                            {renderHeader('Price', 'price', 'right')}
                            {renderHeader('Stock', 'stock_quantity', 'center')}
                            {renderHeader('Status', 'status', 'center')}
                            <th className="px-4 py-3 text-center text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-300">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {sortedAndFilteredVariants.length > 0 ? (
                            sortedAndFilteredVariants.map(item => (
                                <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                    <td className="px-4 py-3 text-sm font-medium text-sky-600 dark:text-sky-400 font-mono">{item.sku}</td>
                                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white font-bold">{getProductName(item.product_id)}</td>
                                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{getAttributeName(colors, item.color_id)}</td>
                                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{getAttributeName(storages, item.storage_id)}</td>
                                    <td className="px-4 py-3 text-right text-sm font-bold text-gray-900 dark:text-white tabular-nums">
                                        ${(item.price || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </td>
                                    <td className="px-4 py-3 text-center text-sm font-medium text-gray-700 dark:text-gray-300 tabular-nums">{item.stock_quantity}</td> {/* This is already snake_case */}
                                    <td className="px-4 py-3 text-center">
                                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter ${item.is_active ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                                            {item.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex justify-center gap-2">
                                            <button 
                                                onClick={() => toggleStatus(item)}
                                                className="px-3 py-1 text-[10px] font-bold uppercase tracking-tight bg-sky-50 dark:bg-sky-900/20 text-sky-600 dark:text-sky-400 rounded border border-sky-100 dark:border-sky-800 hover:bg-sky-100 transition-colors"
                                            >
                                                Toggle
                                            </button>
                                            <button 
                                                onClick={() => onDelete(item.id)}
                                                className="px-3 py-1 text-[10px] font-bold uppercase tracking-tight bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded border border-red-100 dark:border-red-800 hover:bg-red-100 transition-colors"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={8} className="text-center py-20 text-gray-400 dark:text-gray-500 italic text-sm">
                                    No variants found matching your criteria.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Bulk Price Update Modal */}
            {isBulkPriceModalOpen && (
                <Modal 
                    title={`Bulk Update Price (${sortedAndFilteredVariants.length} Items)`} 
                    onClose={() => setIsBulkPriceModalOpen(false)}
                >
                    <div className="space-y-4">
                        <div className="flex bg-gray-100 dark:bg-gray-700 p-0.5 rounded-lg border border-gray-200 dark:border-gray-600 shadow-inner">
                            <button
                                type="button"
                                onClick={() => setBulkPriceUpdateMode('fixed')}
                                className={`flex-1 py-1.5 text-[10px] font-bold uppercase rounded-md transition-all duration-200 ${
                                    bulkPriceUpdateMode === 'fixed' 
                                        ? 'bg-white dark:bg-gray-800 text-sky-600 shadow-sm' 
                                        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                                }`}
                            >
                                Fixed Price
                            </button>
                            <button
                                type="button"
                                onClick={() => setBulkPriceUpdateMode('percentage')}
                                className={`flex-1 py-1.5 text-[10px] font-bold uppercase rounded-md transition-all duration-200 ${
                                    bulkPriceUpdateMode === 'percentage' 
                                        ? 'bg-white dark:bg-gray-800 text-sky-600 shadow-sm' 
                                        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                                }`}
                            >
                                % Adjustment
                            </button>
                        </div>

                        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                            {bulkPriceUpdateMode === 'fixed' 
                                ? 'Enter the new price to apply to all selected variants.' 
                                : 'Enter a percentage to increase (e.g. 10) or decrease (e.g. -5) the current prices.'}
                        </p>
                        
                        <FormInput
                            label={bulkPriceUpdateMode === 'fixed' ? "New Price ($)" : "Price Adjustment (%)"}
                            type="number"
                            placeholder={bulkPriceUpdateMode === 'fixed' ? "0.00" : "e.g. 15 or -10"}
                            value={bulkPrice}
                            onChange={(e: any) => setBulkPrice(e.target.value)}
                            min={bulkPriceUpdateMode === 'fixed' ? "0" : undefined}
                            step="0.01"
                        />

                        <div className="flex justify-end gap-3 pt-4 border-t dark:border-gray-700">
                            <button
                                onClick={() => setIsBulkPriceModalOpen(false)}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleBulkPriceUpdate}
                                disabled={isUpdating || !bulkPrice}
                                className="px-4 py-2 text-sm font-medium text-white bg-sky-600 rounded-md hover:bg-sky-700 disabled:opacity-50 flex items-center gap-2"
                            >
                                {isUpdating ? 'Updating...' : 'Apply to All'}
                            </button>
                        </div>
                    </div>
                </Modal>
            )}

            {/* Bulk Stock Update Modal */}
            {isBulkStockModalOpen && (
                <Modal 
                    title={`Bulk Update Stock (${sortedAndFilteredVariants.length} Items)`} 
                    onClose={() => setIsBulkStockModalOpen(false)}
                >
                    <div className="space-y-4">
                        <div className="flex bg-gray-100 dark:bg-gray-700 p-0.5 rounded-lg border border-gray-200 dark:border-gray-600 shadow-inner">
                            <button
                                type="button"
                                onClick={() => setBulkStockUpdateMode('replace')}
                                className={`flex-1 py-1.5 text-[10px] font-bold uppercase rounded-md transition-all duration-200 ${
                                    bulkStockUpdateMode === 'replace' 
                                        ? 'bg-white dark:bg-gray-800 text-sky-600 shadow-sm' 
                                        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                                }`}
                            >
                                Replace
                            </button>
                            <button
                                type="button"
                                onClick={() => setBulkStockUpdateMode('add')}
                                className={`flex-1 py-1.5 text-[10px] font-bold uppercase rounded-md transition-all duration-200 ${
                                    bulkStockUpdateMode === 'add' 
                                        ? 'bg-white dark:bg-gray-800 text-sky-600 shadow-sm' 
                                        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                                }`}
                            >
                                Add to Existing
                            </button>
                        </div>

                        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                            {bulkStockUpdateMode === 'replace' 
                                ? 'Enter the new stock quantity to apply to all selected variants.' 
                                : 'Enter a quantity to add to (e.g. 10) or subtract from (e.g. -5) the current stock levels.'}
                        </p>
                        
                        <FormInput
                            label={bulkStockUpdateMode === 'replace' ? "New Stock Quantity" : "Stock Adjustment"}
                            type="number"
                            placeholder={bulkStockUpdateMode === 'replace' ? "0" : "e.g. 10 or -5"}
                            value={bulkStock}
                            onChange={(e: any) => setBulkStock(e.target.value)}
                            min={bulkStockUpdateMode === 'replace' ? "0" : undefined}
                        />

                        <div className="flex justify-end gap-3 pt-4 border-t dark:border-gray-700">
                            <button
                                onClick={() => setIsBulkStockModalOpen(false)}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleBulkStockUpdate}
                                disabled={isUpdating || bulkStock === ''}
                                className="px-4 py-2 text-sm font-medium text-white bg-sky-600 rounded-md hover:bg-sky-700 disabled:opacity-50 flex items-center gap-2"
                            >
                                {isUpdating ? 'Updating...' : 'Apply to All'}
                            </button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default VariantTable;