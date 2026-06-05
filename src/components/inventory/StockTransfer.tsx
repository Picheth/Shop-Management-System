import React, { useState, useEffect, useMemo, useRef } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import QRCode from 'qrcode';
import { 
    Product, 
    Branch, 
    StockTransfer as StockTransferType,
    ToastType,
} from '../../types';
import Placeholder from '../ui/Placeholder';
import StatusBadge from '../ui/StatusBadge';
import Modal from '../ui/Modal';
import StockTransferForm from './StockTransferForm';
import { PrintIcon, ExportIcon, TrashIcon, CheckIcon, PdfIcon, LinkIcon, EmailIcon, WhatsAppIcon, TelegramIcon } from '../ui/Icons';

interface StockTransferProps {
    products: Product[];
    branches: Branch[];
    stockTransfers: StockTransferType[];
    onTransfer: (transfer: StockTransferType) => void;
    onCancelTransfer?: (transfer: StockTransferType) => void;
    onConfirmTransfer?: (transfer: StockTransferType) => void;
    companyLogoUrl?: string;
    companyName?: string;
    address?: string;
    initialSearchTerm?: string;
    showToast?: (message: string, type: ToastType) => void;
    signatureUrl?: string;
    note?: string;
    purposeOptions?: string[];
}

/**
 * Helper to parse weight strings into a numeric value in Kilograms.
 * Supports formats like "1.5 kg", "500g", "2 lb", "10 oz".
 */
const parseWeight = (weightStr?: string): number => {
    if (!weightStr) return 0;
    const match = weightStr.match(/(\d+(\.\d+)?)\s*(kg|g|lb|oz)/i);
    if (!match) return 0;
    
    const value = parseFloat(match[1]);
    const unit = match[3].toLowerCase();
    
    switch (unit) {
        case 'g': return value / 1000;
        case 'lb': return value * 0.453592;
        case 'oz': return value * 0.0283495;
        default: return value; // Default is kg
    }
};

const sanitizeCSV = (value: string) => {
    if (/^[=+\-@]/.test(value)) {
        return `'${value}`;
    }
    return value;
};

/**
 * Helper to parse dimension strings and calculate volume in Cubic Meters (CBM).
 * Supports formats like "10x20x30 cm", "10 * 20 * 30 mm", "5x5x5 in".
 */
const calculateItemCBM = (dimStr?: string): number => {
    if (!dimStr) return 0;
    const match = dimStr.match(/(\d+(\.\d+)?)\s*[x*]\s*(\d+(\.\d+)?)\s*[x*]\s*(\d+(\.\d+)?)\s*(cm|mm|m|in|inch)/i);
    if (!match) return 0;

    const l = parseFloat(match[1]);
    const w = parseFloat(match[3]);
    const h = parseFloat(match[5]);
    const unit = match[7].toLowerCase();

    let factor = 1;
    if (unit === 'cm') factor = 0.01;
    else if (unit === 'mm') factor = 0.001;
    else if (unit === 'in' || unit === 'inch') factor = 0.0254;

    return (l * factor) * (w * factor) * (h * factor);
};

const StockTransfer: React.FC<StockTransferProps> = ({
    products,
    branches,
    stockTransfers,
    onTransfer,
    onCancelTransfer,
    onConfirmTransfer,
    companyLogoUrl,
    companyName,
    address,
    initialSearchTerm,
    showToast,
    signatureUrl,
    note,
    purposeOptions,
}) => {
    const [searchTerm, setSearchTerm] = useState(initialSearchTerm || '');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [activePrintTransfer, setActivePrintTransfer] = useState<{ transfer: StockTransferType; printDate: string } | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const isFiltered = searchTerm !== '' || statusFilter !== 'All' || startDate !== '' || endDate !== '';

    /**
     * Detects if the current search term matches the pattern for a Stock Transfer ID
     * or a 6-digit numeric short code.
     */
    const isIdSearch = useMemo(() => 
        /^TRF-\d+$/i.test(searchTerm.trim()) || /^\d{6}$/.test(searchTerm.trim()), 
    [searchTerm]);

    const handleResetFilters = () => {
        setSearchTerm('');
        setStatusFilter('All');
        setStartDate('');
        setEndDate('');
    };

    const filteredAndSortedTransfers = useMemo(() => {
    let result = [...stockTransfers].sort((a, b) => 
        new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime()
    );
    
    const term = searchTerm.toLowerCase();

    if (isIdSearch) {
        return result.filter(t =>
            (t.id || '').toLowerCase().includes(term) ||
            (t.short_code || '').toLowerCase().includes(term)
        );
    }

    // Filter by status
    if (statusFilter !== 'All') {
        result = result.filter(t => (t.status || 'Completed') === statusFilter);
    }

    // Filter by date range
    if (startDate || endDate) {
        result = result.filter(t => {
            if (!t.created_at) return false;
            const transferDate = t.created_at.split('T')[0];

            if (startDate && transferDate < startDate) return false;
            if (endDate && transferDate > endDate) return false;

            return true;
        });
    }

    if (!searchTerm.trim()) return result;

    return result.filter(t => {
        const itemNames =
            t.items?.map(i => i.product_name.toLowerCase()).join(' ') || '';

        const fromBranchName =
            branches.find(b => b.id === t.from_branch_id)?.name.toLowerCase() || '';

        const toBranchName =
            branches.find(b => b.id === t.to_branch_id)?.name.toLowerCase() || '';

        const transferId = t.id.toLowerCase();

        const purposeVal =
            (t as any).purpose?.toLowerCase() || '';

        const shortCodeVal =
            t.short_code?.toLowerCase() || '';

        const noteVal =
            (t as any).note?.toLowerCase() || '';

        return (
            itemNames.includes(term) ||
            fromBranchName.includes(term) ||
            toBranchName.includes(term) ||
            transferId.includes(term) ||
            shortCodeVal.includes(term) ||
            purposeVal.includes(term) ||
            noteVal.includes(term)
        );
    });
}, [
    stockTransfers,
    searchTerm,
    statusFilter,
    products,
    branches,
    startDate,
    endDate,
    isIdSearch,
]);

    const headerCheckboxRef = useRef<HTMLInputElement>(null);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    const isAllSelected = filteredAndSortedTransfers.length > 0 && selectedIds.size === filteredAndSortedTransfers.length;
    const isSomeSelected = selectedIds.size > 0 && !isAllSelected;

    useEffect(() => {
        if (headerCheckboxRef.current) {
            headerCheckboxRef.current.indeterminate = isSomeSelected;
        }
    }, [isSomeSelected]);

    const toggleSelectAll = () => {
        if (isAllSelected) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(filteredAndSortedTransfers.map(t => t.id)));
        }
    };

    const toggleSelectOne = (id: string) => {
        const newSelected = new Set(selectedIds);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedIds(newSelected);
    };

    const totalQuantity = useMemo(() => {
        return filteredAndSortedTransfers.reduce((sum, t) => sum + (t.items?.reduce((s, i) => s + i.quantity, 0) || 0), 0);
    }, [filteredAndSortedTransfers]);

    const totalValue = useMemo(() => {
        return filteredAndSortedTransfers.reduce((sum, transfer) => {
            const itemsValue = transfer.items?.reduce((s, i) => s + (i.quantity * i.price), 0) || 0;
            return sum + itemsValue;
        }, 0);
    }, [filteredAndSortedTransfers]);

    const totalProfit = useMemo(() => {
        return filteredAndSortedTransfers.reduce((sum, transfer) => {
            const itemsProfit = transfer.items?.reduce((s, i) => {
                const product = products.find(p => p.id === i.product_id);
                const margin = (product?.sale_price || 0) - (product?.cost_price || 0);
                return s + (i.quantity * margin);
            }, 0) || 0;
            return sum + itemsProfit;
        }, 0);
    }, [filteredAndSortedTransfers, products]);

    const totalWeight = useMemo(() => {
        return filteredAndSortedTransfers.reduce((sum, transfer) => {
            const itemsWeight = transfer.items?.reduce((s, item) => {
                const product = products.find(p => p.id === item.product_id);
                const weightAttr = product?.attributes?.find(a => a.name.toLowerCase() === 'weight');
                const unitWeight = parseWeight(weightAttr?.value);
                return s + (item.quantity * unitWeight);
            }, 0) || 0;
            return sum + itemsWeight;
        }, 0);
    }, [filteredAndSortedTransfers, products]);

    const totalVolume = useMemo(() => {
        return filteredAndSortedTransfers.reduce((sum, transfer) => {
            const itemsVolume = transfer.items?.reduce((s, item) => {
                const unitCBM = calculateItemCBM(item.dimensions || products.find(p => p.id === item.product_id)?.attributes?.find(a => a.name.toLowerCase() === 'dimensions')?.value);
                return s + (item.quantity * unitCBM);
            }, 0) || 0;
            return sum + itemsVolume;
        }, 0);
    }, [filteredAndSortedTransfers, products]);

    const dailyTrends = useMemo(() => {
        const days = Array.from({ length: 7 }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (6 - i));
            return d.toISOString().split('T')[0];
        });

        const data = days.map(date => {
            const total = filteredAndSortedTransfers
                .filter(t => t.created_at && t.created_at.startsWith(date))
                .reduce((sum, t) => sum + (t.items?.reduce((s, i) => s + i.quantity, 0) || 0), 0);
            return { date, total };
        });

        const currentTotal = data.reduce((sum, d) => sum + d.total, 0);

        // Previous 7 days (the week before the current chart window)
        const prevDays = Array.from({ length: 7 }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (13 - i));
            return d.toISOString().split('T')[0];
        });

        const previousTotal = prevDays.reduce((sum, date) => {
            const dayTotal = filteredAndSortedTransfers
                .filter(t => t.created_at && t.created_at.startsWith(date))
                .reduce((s, t) => s + (t.items?.reduce((si, i) => si + i.quantity, 0) || 0), 0);
            return sum + dayTotal;
        }, 0);

        const percentChange = previousTotal > 0 ? Math.round(((currentTotal - previousTotal) / previousTotal) * 100) : (currentTotal > 0 ? 100 : 0);
        const maxVal = Math.max(...data.map(d => d.total), 1);
        return { data, maxVal, percentChange };
    }, [filteredAndSortedTransfers]);

    const productMap = useMemo(() => Object.fromEntries(products.map(p => [p.id, p])), [products]);
    const branchMap = useMemo(() => Object.fromEntries(branches.map(b => [b.id, b])), [branches]);

    const handleExportCSV = () => {
        if (!filteredAndSortedTransfers.length) return;

        // Define CSV headers
        const headers = ['Date', 'Code', 'Transfer ID', 'Products', 'Source Branch', 'Destination Branch', 'Quantity', 'Purpose', 'Note', 'Status'];
        // Map filtered data to rows, resolving IDs to human-readable names
        const rows = filteredAndSortedTransfers.map(t => {
            const productNames = t.items?.map(i => i.product_name).join(' | ') || 'N/A';
            const fromBranchName = branches.find(b => b.id === t.from_branch_id)?.name || 'Unknown';
            const toBranchName = branches.find(b => b.id === t.to_branch_id)?.name || 'Unknown';
            const qty = t.items?.reduce((s, i) => s + i.quantity, 0) || 0;
            const date = t.created_at ? new Date(t.created_at).toLocaleDateString() : 'N/A';

            return [
                date,
                sanitizeCSV(t.short_code || '-'),
                `"${t.id}"`,
                `"${productNames.replace(/"/g, '""')}"`, // Escape quotes
                `"${fromBranchName.replace(/"/g, '""')}"`,
                `"${toBranchName.replace(/"/g, '""')}"`,
                qty,
                `"${(t as any).purpose || 'N/A'}"`,
                `"${((t as any).note || '').replace(/"/g, '""')}"`,
                `"${t.status || 'Pending'}"`
            ].join(',');
        });

        const csvContent = [headers.join(','), ...rows].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `stock_transfers_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleExportPDF = async () => {
        if (!filteredAndSortedTransfers.length) return;

        const doc = new jsPDF('l', 'mm', 'a4');
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();

        let qrCodeDataUrl = '';

        // Generate QR Code for the digital record (System Portal)
        try {
            // Linking to the specific report view in the portal
            const reportUrl = `${window.location.origin}${window.location.pathname}?page=StockTransfer&search=${encodeURIComponent(searchTerm)}`;
            
            qrCodeDataUrl = await QRCode.toDataURL(reportUrl, { 
                margin: 1, 
                width: 100,
                color: { dark: '#0ea5e9' } // Sky-600 matching your theme
            });
        } catch (err) {
            console.error('QR Code generation failed:', err);
        }

        // Data Table
        const headers = [['Date', 'Code', 'Ref ID', 'Products', 'Source', 'Destination', 'Purpose', 'Note', 'Qty', 'Value', 'Est. Profit', 'Status']];
        const data = filteredAndSortedTransfers.map(t => {
            const productNames = t.items?.map(i => i.product_name).join('\n') || '-';
            const qty = t.items?.reduce((s, i) => s + i.quantity, 0) || 0;
            const value = t.items?.reduce((s, i) => s + (i.quantity * i.price), 0) || 0;
            const profit = t.items?.reduce((s, i) => {
                const p = products.find(prod => prod.id === i.product_id);
                return s + (i.quantity * ((p?.sale_price || 0) - (p?.cost_price || 0)));
            }, 0) || 0;

            return [
                t.created_at ? new Date(t.created_at).toLocaleDateString() : 'N/A',
                t.short_code || '-',
                t.id,
                productNames,
                branches.find(b => b.id === t.from_branch_id)?.name || 'Unknown',
                branches.find(b => b.id === t.to_branch_id)?.name || 'Unknown',
                (t as any).purpose || 'N/A',
                (t as any).note || '-',
                qty,
                `$${value.toFixed(2)}`,
                `$${profit.toFixed(2)}`,
                t.status || 'Completed'
            ];
        });

        const footer = [['', '', '', '', '', '', '', 'Totals:', totalQuantity, `$${totalValue.toFixed(2)}`, `$${totalProfit.toFixed(2)}`, '']];

        autoTable(doc, {
            head: headers,
            body: data,
            foot: footer,
            headStyles: {
                fillColor: [14, 165, 233],
                textColor: 255,
            },
            footStyles: {
                fillColor: [243, 244, 246],
                textColor: 0,
                fontStyle: 'bold',
            },
            styles: { fontSize: 8, cellPadding: 3, overflow: 'linebreak' },
            columnStyles: {
    0: { cellWidth: 22 }, // Date
    1: { cellWidth: 18 }, // Code
    2: { cellWidth: 32 }, // Ref ID
    3: { cellWidth: 45 }, // Products
    4: { cellWidth: 24 }, // Source
    5: { cellWidth: 24 }, // Destination
    6: { cellWidth: 28 }, // Purpose
    7: { cellWidth: 45 }, // Note
    8: { halign: 'center', cellWidth: 14 }, // Qty
    9: { halign: 'right', cellWidth: 22 }, // Value
    10: { halign: 'right', cellWidth: 24 }, // Profit
    11: { halign: 'center', cellWidth: 20 }, // Status
},
            didDrawPage: (dataArg) => {
                // Draw Watermark
                doc.setFontSize(60);
                doc.setTextColor(245); // Extremely light gray
                doc.text('CONFIDENTIAL', pageWidth / 2, pageHeight / 2, { align: 'center', angle: 45 });

                // Draw Header on every page
                doc.setFontSize(18);
                doc.setTextColor(40);
                doc.text(companyName || 'Shop Management System', pageWidth / 2, 15, { align: 'center' });
                
                doc.setFontSize(9);
                doc.setTextColor(100);
                if (address) doc.text(address, pageWidth / 2, 21, { align: 'center' });

                doc.setFontSize(14);
                doc.setTextColor(0);
                doc.text('Stock Transfer Report', pageWidth / 2, 30, { align: 'center' });

                doc.setFontSize(8);
                doc.setTextColor(120);
                const period = (startDate || endDate) ? `Period: ${startDate || 'Start'} to ${endDate || 'End'}` : 'Period: All Time';
                const weightInfoStr = totalWeight > 0 ? `  |  Wt: ${totalWeight.toFixed(2)}kg` : '';
                const volumeInfoStr = totalVolume > 0 ? `  |  Vol: ${totalVolume.toFixed(4)}CBM` : '';
                doc.text(`${period}  |  Status: ${statusFilter}${weightInfoStr}${volumeInfoStr}  |  Gen: ${new Date().toLocaleString()}`, pageWidth / 2, 36, { align: 'center' });

                if (qrCodeDataUrl) {
                    doc.addImage(qrCodeDataUrl, 'PNG', pageWidth - 35, 10, 22, 22);
                    doc.setFontSize(6);
                    doc.setTextColor(150);
                    doc.text('SCAN TO VERIFY RECORD', pageWidth - 24, 35, { align: 'center' });
                }
            }
        });

        // Add "Page X of Y" total count to the footer after the table is finished
        const totalPages = doc.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
            doc.setPage(i);

            doc.setFontSize(8);
            doc.setTextColor(150);

            doc.text(
                `Page ${i} of ${totalPages}`,
                pageWidth / 2,
                pageHeight - 10,
                { align: 'center' }
            );
        }

        doc.save(`stock_transfers_${new Date().toISOString().split('T')[0]}.pdf`);
    };

    const getBulkShareData = () => {
        const selectedTransfers = filteredAndSortedTransfers.filter(t => selectedIds.has(t.id));
        const links = selectedTransfers.map(t => `${window.location.origin}${window.location.pathname}?page=StockTransfer&id=${t.id}`);
        const summary = selectedTransfers.map(t => {
            const productNames = t.items?.map(i => i.product_name).join(', ') || 'Items';
            return `• ${productNames} (Code: ${t.short_code || t.id})`;
        }).join('\n');
        return { links, summary, count: selectedTransfers.length };
    };

    const handleBulkCopyLinks = () => {
        const { links } = getBulkShareData();
        navigator.clipboard.writeText(links.join('\n')).then(() => {
            showToast?.('All selected links copied to clipboard', 'success');
            setSelectedIds(new Set());
        });
    };

    const handleBulkShareEmail = () => {
        const { links, summary, count } = getBulkShareData();
        const subject = encodeURIComponent(`Bulk Stock Transfer Review (${count} items)`);
        const body = encodeURIComponent(`Hello,\n\nPlease review the following ${count} stock transfers:\n\n${summary}\n\nLinks:\n${links.join('\n')}\n\nThank you.`);
        window.location.href = `mailto:?subject=${subject}&body=${body}`;
        setSelectedIds(new Set());
    };

    const handleBulkShareWhatsApp = () => {
        const { links, summary, count } = getBulkShareData();
        const message = `*Bulk Stock Transfer Record (${count} items)*\n\n${summary.replace(/•/g, '*•*')}\n\nLinks:\n${links.join('\n')}`;
        window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
        setSelectedIds(new Set());
    };

    const handleBulkShareTelegram = () => {
        const { links, summary, count } = getBulkShareData();
        const message = `Bulk Stock Transfer Record (${count} items)\n\n${summary}\n\nLinks:\n${links.join('\n')}`;
        window.open(`https://t.me/share/url?url=${encodeURIComponent(links[0])}&text=${encodeURIComponent(message)}`, '_blank');
        setSelectedIds(new Set());
    };

    const handleCopyLink = (id: string) => {
        const url = `${window.location.origin}${window.location.pathname}?page=StockTransfer&id=${id}`;
        navigator.clipboard.writeText(url).then(() => {
            showToast?.('Transfer link copied to clipboard', 'success');
        }).catch(err => {
            console.error('Failed to copy link:', err);
            showToast?.('Failed to copy link', 'error');
        });
    };

    const handleShareEmail = (transfer: StockTransferType) => {
        const url = `${window.location.origin}${window.location.pathname}?page=StockTransfer&id=${transfer.id}`;
        const productNames = transfer.items?.map(i => i.product_name).join(', ') || 'Items';
        const subject = encodeURIComponent(`Stock Transfer - ${transfer.short_code || transfer.id}`);
        const body = encodeURIComponent(`Hello,\n\nPlease review the stock transfer details for ${productNames} (Code: ${transfer.short_code || transfer.id}).\n\nDirect Link: ${url}\n\nThank you.`);
        
        window.location.href = `mailto:?subject=${subject}&body=${body}`;
    };

    const handleShareWhatsApp = (transfer: StockTransferType) => {
        const url = `${window.location.origin}${window.location.pathname}?page=StockTransfer&id=${transfer.id}`;
        const productNames = transfer.items?.map(i => i.product_name).join(', ') || 'Items';
        const totalQty = transfer.items?.reduce((s, i) => s + i.quantity, 0) || 0;
        const message = `*Stock Transfer Record*\n\n` +
                        `*Code:* ${transfer.short_code || transfer.id}\n` +
                        `*Items:* ${productNames}\n` +
                        `*Total Qty:* ${totalQty}\n\n` +
                        `Link: ${url}`;
        
        window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
    };

    const handleShareTelegram = (transfer: StockTransferType) => {
        const url = `${window.location.origin}${window.location.pathname}?page=StockTransfer&id=${transfer.id}`;
        const productNames = transfer.items?.map(i => i.product_name).join(', ') || 'Items';
        const totalQty = transfer.items?.reduce((s, i) => s + i.quantity, 0) || 0;
        const message = `Stock Transfer Record\n\nCode: ${transfer.short_code || transfer.id}\nItems: ${productNames}\nTotal Qty: ${totalQty}`;
        
        window.open(
            `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(message)}`, 
            '_blank'
        );
    };

    // Trigger print dialog after state update has rendered the slip
    useEffect(() => {
        if (activePrintTransfer?.transfer) {
            const printTimeout = setTimeout(() => {
                window.print();
                setActivePrintTransfer(null);
            }, 500);
            return () => clearTimeout(printTimeout);
        }
    }, [activePrintTransfer]);

    const handlePrint = (transfer: StockTransferType) => {
        setActivePrintTransfer({ transfer, printDate: new Date().toLocaleString() });
    };

    return (
        <>
        <div className="print:hidden">
        <Placeholder title="Stock Transfers">
            {/* Header with New Transfer Button */}
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Inventory Movements</h3>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-md transition-colors text-sm font-medium shadow-sm flex items-center gap-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    New Transfer
                </button>
            </div>

            {/* Transfers Table */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex flex-col lg:flex-row justify-between items-center gap-4 print:hidden">
                    <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Transfers</h3>
                        <div className="group relative">
                            <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 cursor-help">
                                Total Qty: {totalQuantity}
                            </span>
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-48 p-2 bg-gray-900 text-white text-[10px] leading-tight rounded shadow-lg z-50 pointer-events-none text-center after:content-[''] after:absolute after:top-full after:left-1/2 after:-translate-x-1/2 after:border-4 after:border-transparent after:border-t-gray-900">
                                This represents the sum of product quantities for all transfers matching your current search and filters.
                            </div>
                        </div>

                        {/* Mini Trend Chart */}
                        <div className="flex flex-col items-center ml-1 border-l border-gray-200 dark:border-gray-700 px-3" title={`Current: ${dailyTrends.data.reduce((a,b)=>a+b.total,0)} units vs Prev: ${dailyTrends.percentChange}%`}>
                            <div className="flex items-end gap-1 h-8">
                                {dailyTrends.data.map((d, i) => (
                                    <div 
                                        key={i}
                                        className="w-1.5 bg-sky-500/40 dark:bg-sky-400/30 rounded-t-sm hover:bg-sky-500 transition-colors relative group/bar"
                                        style={{ height: `${(d.total / dailyTrends.maxVal) * 100}%`, minHeight: d.total > 0 ? '2px' : '1px' }}
                                    >
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover/bar:block bg-gray-900 text-white text-[8px] py-0.5 px-1.5 rounded whitespace-nowrap z-10 pointer-events-none shadow-sm">
                                            {d.total} units
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className={`text-[8px] font-bold mt-0.5 tabular-nums ${dailyTrends.percentChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                {dailyTrends.percentChange >= 0 ? '↑' : '↓'} {Math.abs(dailyTrends.percentChange)}%
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto justify-end">
                        {/* Date Range Picker */}
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] uppercase font-bold text-gray-400">From</span>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 text-sm focus:ring-1 focus:ring-sky-500 outline-none transition-colors"
                            />
                            <span className="text-[10px] uppercase font-bold text-gray-400">To</span>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 text-sm focus:ring-1 focus:ring-sky-500 outline-none transition-colors"
                            />
                        </div>

                        {/* Status Filter */}
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1.5 text-sm focus:ring-1 focus:ring-sky-500 outline-none transition-colors"
                        >
                            <option value="All">All Statuses</option>
                            <option value="Pending">Pending</option>
                            <option value="Completed">Completed</option>
                            <option value="Cancelled">Cancelled</option>
                        </select>

                        {/* Search bar */}
                        {isIdSearch && (
                            <div className="group relative">
                                <div className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-tight shadow-sm cursor-help">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                    </svg>
                                    ID Locked
                                </div>
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-48 p-2 bg-gray-900 text-white text-[10px] leading-tight rounded shadow-lg z-50 pointer-events-none text-center after:content-[''] after:absolute after:top-full after:left-1/2 after:-translate-x-1/2 after:border-4 after:border-transparent after:border-t-gray-900">
                                    Searching for a specific Transfer ID ignores all other active filters to ensure you find the exact record.
                                </div>
                            </div>
                        )}

                        <div className="relative w-full sm:w-64">
                            <input
                                type="text"
                                placeholder="Search transfers..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md pl-3 pr-10 py-1.5 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none transition-colors"
                            />
                        </div>

                        {selectedIds.size > 0 && (
                            <div className="flex items-center gap-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-1 rounded-md shadow-sm animate-fade-in-up">
                                <button onClick={handleBulkCopyLinks} className="p-1.5 text-gray-500 hover:text-sky-600 transition-colors" title="Copy Links">
                                    <LinkIcon size={16} />
                                </button>
                                <button onClick={handleBulkShareEmail} className="p-1.5 text-gray-500 hover:text-sky-600 transition-colors" title="Share via Email">
                                    <EmailIcon size={16} />
                                </button>
                                <button onClick={handleBulkShareWhatsApp} className="p-1.5 text-gray-500 hover:text-green-600 transition-colors" title="Share via WhatsApp">
                                    <WhatsAppIcon size={16} />
                                </button>
                                <button onClick={handleBulkShareTelegram} className="p-1.5 text-gray-500 hover:text-blue-500 transition-colors" title="Share via Telegram">
                                    <TelegramIcon size={16} />
                                </button>
                                <div className="h-4 w-[1px] bg-gray-200 dark:bg-gray-700 mx-1"></div>
                                <span className="text-[10px] font-bold text-gray-400 uppercase px-2 tabular-nums">{selectedIds.size} Selected</span>
                                <button 
                                    onClick={() => setSelectedIds(new Set())}
                                    className="text-gray-400 hover:text-red-500 p-1"
                                    title="Deselect All"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        )}

                        {filteredAndSortedTransfers.length > 0 && (
                            <button
                                onClick={handleExportPDF}
                                className="inline-flex items-center px-3 py-1.5 bg-sky-50 dark:bg-sky-900/20 text-sky-600 dark:text-sky-400 border border-sky-100 dark:border-sky-800 rounded-md text-sm font-medium hover:bg-sky-100 dark:hover:bg-sky-900/40 transition-colors"
                            >
                                <PdfIcon size={16} className="mr-1.5" />
                                Export PDF
                            </button>
                        )}

                        {filteredAndSortedTransfers.length > 0 && (
                            <button
                                onClick={handleExportCSV}
                                className="inline-flex items-center px-3 py-1.5 bg-sky-50 dark:bg-sky-900/20 text-sky-600 dark:text-sky-400 border border-sky-100 dark:border-sky-800 rounded-md text-sm font-medium hover:bg-sky-100 dark:hover:bg-sky-900/40 transition-colors"
                            >
                                <ExportIcon size={16} className="mr-1.5" />
                                Export CSV
                            </button>
                        )}

                        {isFiltered && (
                            <button
                                onClick={handleResetFilters}
                                className="text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-sky-600 dark:hover:text-sky-400 transition-colors flex items-center gap-1 whitespace-nowrap"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                Reset Filters
                            </button>
                        )}
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left no-print w-10">
                                    <input
                                        ref={headerCheckboxRef}
                                        type="checkbox"
                                        className="h-4 w-4 text-sky-600 focus:ring-sky-500 border-gray-300 rounded cursor-pointer"
                                        checked={isAllSelected}
                                        onChange={toggleSelectAll}
                                    />
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Ref Code</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Product</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">From</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">To</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Qty</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Purpose</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Note</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider no-print">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {filteredAndSortedTransfers.length > 0 ? (
                                filteredAndSortedTransfers.map((transfer) => (
                                    <tr key={transfer.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                        {/* Checkbox for individual selection */}
                                        <td className="px-6 py-4 whitespace-nowrap no-print">
                                            <input
                                                type="checkbox"
                                                className="h-4 w-4 text-sky-600 focus:ring-sky-500 border-gray-300 rounded cursor-pointer"
                                                checked={selectedIds.has(transfer.id)}
                                                onChange={() => toggleSelectOne(transfer.id)} // This is already snake_case
                                            />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                        {new Date(transfer.created_at || '').toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-sky-600 dark:text-sky-400 tabular-nums">
                                        {transfer.short_code || '-'}
                                        </td>
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white max-w-xs truncate" title={transfer.items?.map(i => i.product_name).join(', ')}>
                                            {transfer.items?.length > 1 
                                                ? `${transfer.items[0].product_name} (+${transfer.items.length - 1} more)`
                                                : transfer.items?.[0]?.product_name || 'No Items'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {branchMap[transfer.from_branch_id]?.name || 'Unknown'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {branches.find(b => b.id === transfer.to_branch_id)?.name || 'Unknown'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-semibold text-gray-900 dark:text-white">
                                            {transfer.items?.reduce((s, i) => s + i.quantity, 0) || 0}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                                            {(transfer as any).purpose ? (
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tight ${
                                                    (transfer as any).purpose === 'Sale Fulfillment'
                                                        ? 'bg-sky-50 text-sky-700 border border-sky-200 dark:bg-sky-900/20 dark:text-sky-400 dark:border-sky-800'
                                                        : 'bg-gray-50 text-gray-600 border border-gray-200 dark:bg-gray-800/40 dark:text-gray-400 dark:border-gray-700'
                                                }`}>
                                                    {(transfer as any).purpose}
                                                </span>
                                            ) : <span className="text-gray-400">-</span>}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 max-w-[150px] truncate" title={(transfer as any).note}>
                                            {(transfer as any).note || '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <StatusBadge status={transfer.status as any || 'Completed'} />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center no-print">
                                            <div className="flex justify-center gap-2">
                                                <button
                                                    onClick={() => handleCopyLink(transfer.id)}
                                                    className="text-gray-400 hover:text-sky-600 dark:text-gray-500 dark:hover:text-sky-400 transition-colors p-1"
                                                    title="Copy Direct Link"
                                                >
                                                    <LinkIcon size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleShareEmail(transfer)}
                                                    className="text-gray-400 hover:text-sky-600 dark:text-gray-500 dark:hover:text-sky-400 transition-colors p-1"
                                                    title="Share via Email"
                                                >
                                                    <EmailIcon size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleShareWhatsApp(transfer)}
                                                    className="text-gray-400 hover:text-green-600 dark:text-gray-500 dark:hover:text-green-400 transition-colors p-1"
                                                    title="Share via WhatsApp"
                                                >
                                                    <WhatsAppIcon size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleShareTelegram(transfer)}
                                                    className="text-gray-400 hover:text-blue-500 dark:text-gray-500 dark:hover:text-blue-400 transition-colors p-1"
                                                    title="Share via Telegram"
                                                >
                                                    <TelegramIcon size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handlePrint(transfer)}
                                                    className="text-sky-600 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300 transition-colors p-1"
                                                    title="Print Transfer Slip"
                                                >
                                                    <PrintIcon size={18} />
                                                </button>
                                                {transfer.status === 'Pending' && (
                                                    <button
                                                        onClick={() => onConfirmTransfer?.(transfer)}
                                                        className="text-green-600 hover:text-green-700 transition-colors p-1"
                                                        title="Confirm Transfer"
                                                    >
                                                        <CheckIcon size={18} />
                                                    </button>
                                                )}
                                                {transfer.status === 'Pending' && (
                                                    <button
                                                        onClick={() => onCancelTransfer?.(transfer)}
                                                        className="text-red-500 hover:text-red-700 transition-colors p-1"
                                                        title="Cancel Transfer"
                                                    >
                                                        <TrashIcon size={18} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={11} className="px-6 py-10 text-center text-sm text-gray-500 dark:text-gray-400 font-medium">
                                        No stock transfers found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                        {filteredAndSortedTransfers.length > 0 && (
                            <tfoot className="bg-gray-50 dark:bg-gray-900/50 border-t-2 border-gray-200 dark:border-gray-700">
                                <tr>
                                    <td colSpan={6} className="px-6 py-4 text-sm font-bold text-gray-900 dark:text-white text-right uppercase tracking-wider">
                                        Totals:
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-bold text-gray-900 dark:text-white tabular-nums">
                                        {totalQuantity}
                                    </td>
                                    <td colSpan={3} className="px-6 py-4 text-sm font-bold text-right tabular-nums uppercase tracking-tight">
                                        <div className="flex flex-col sm:flex-row justify-end items-end sm:items-center gap-x-6 gap-y-1">
                                            <span className="text-sky-600 dark:text-sky-400">
                                                Cost: ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </span>
                                            <span className="text-green-600 dark:text-green-400">
                                                Est. Profit: ${totalProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="no-print"></td>
                                </tr>
                            </tfoot>
                        )}
                    </table>
                </div>
            </div>
        </Placeholder>
        </div>

        {/* New Transfer Modal */}
        {isModalOpen && (
            <Modal title="Create Stock Transfer" onClose={() => setIsModalOpen(false)}>
                <StockTransferForm 
                    products={products}
                    branches={branches}
                    stockTransfers={stockTransfers}
                    onAdd={(data) => {
                        const newTransfer: StockTransferType = {
                            ...data,
                            id: `TRF-${Date.now()}`,
                            total: data.items.reduce((sum, i) => sum + (i.quantity * i.price), 0)
                        };
                        onTransfer(newTransfer);
                        setIsModalOpen(false);
                    }}
                    onCancel={() => setIsModalOpen(false)}
                />
            </Modal>
        )}

        {/* Hidden Print Slip Component */}
        {activePrintTransfer && (
            <StockTransferSlip
                transfer={activePrintTransfer.transfer}
                products={products}
                fromBranchName={branches.find(b => b.id === activePrintTransfer.transfer.from_branch_id)?.name || 'N/A'}
                toBranchName={branches.find(b => b.id === activePrintTransfer.transfer.to_branch_id)?.name || 'N/A'}
                purpose={(activePrintTransfer.transfer as any).purpose}
                companyLogoUrl={companyLogoUrl}
                companyName={companyName}
                companyAddress={address}
                signatureUrl={signatureUrl}
            />
        )}
        </>
    );
};

/**
 * Dedicated print-only component for the Stock Transfer Slip.
 * Uses Tailwind 'print:' utilities to control visibility.
 */
const StockTransferSlip: React.FC<{
    transfer: StockTransferType;
    products: Product[];
    fromBranchName: string;
    toBranchName: string;
    purpose?: string;
    companyLogoUrl?: string;
    companyName?: string;
    companyAddress?: string;
    printDate?: string;
    signatureUrl?: string;
}> = ({ transfer, products, fromBranchName, toBranchName, purpose, companyLogoUrl, companyName, companyAddress, signatureUrl }) => {
    const transferTotalWeight = transfer.items?.reduce((sum, item) => {
        const product = products.find(p => p.id === item.product_id); // Use products prop directly
        const weightAttr = product?.attributes?.find(a => a.name.toLowerCase() === 'weight');
        const unitWeight = parseWeight(weightAttr?.value);
        return sum + (item.quantity * unitWeight);
    }, 0) || 0;

    const transferTotalVolume = transfer.items?.reduce((sum, item) => {
        const dims = item.dimensions || products.find(p => p.id === item.product_id)?.attributes?.find(a => a.name.toLowerCase() === 'dimensions')?.value;
        const unitCBM = calculateItemCBM(dims);
        return sum + (item.quantity * unitCBM);
    }, 0) || 0;

    const [qrCodeUrl, setQrCodeUrl] = useState('');

    useEffect(() => {
        const url = `${window.location.origin}${window.location.pathname}?page=StockTransfer&id=${transfer.id}`;
        QRCode.toDataURL(url, { margin: 1, width: 100 })
            .then(dataUrl => setQrCodeUrl(dataUrl))
            .catch(err => console.error('QR generation error:', err));
    }, [transfer.id]);

    return (
        <div className="hidden print:block p-10 bg-white text-black font-sans leading-relaxed min-h-screen">
            <div className="flex justify-between items-start border-b-2 border-gray-800 pb-6 mb-8">
                <div>
                    {companyLogoUrl && (
                        <img src={companyLogoUrl} alt="Company Logo" className="h-12 mb-4" />
                    )}
                    <h1 className="text-3xl font-black tracking-tight">{companyName || 'SHOP MANAGEMENT SYSTEM'}</h1>
                    {companyAddress && <p className="text-xs text-gray-600 mt-1 max-w-sm">{companyAddress}</p>}
                    <p className="text-sm text-gray-600 mt-1 uppercase tracking-widest">Inventory Control Division</p>
                </div>
                <div className="text-right flex flex-col items-end">
                    {qrCodeUrl && (
                        <div className="p-1 border border-gray-200 rounded mb-2 bg-white">
                            <img src={qrCodeUrl} alt="Verification QR" className="w-16 h-16" />
                        </div>
                    )}
                    <h2 className="text-xl font-bold text-gray-800">STOCK TRANSFER SLIP</h2>
                    <p className="text-sm font-mono mt-1">Ref: {transfer.short_code || transfer.id}</p>
                </div>
            </div>

            {/* Transfer Details Grid */}
            <div className="grid grid-cols-2 gap-12 mb-10">
                <div className="space-y-4">
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase">Transfer Date</p>
                        <p className="font-semibold">{new Date(transfer.created_at || '').toLocaleDateString('en-GB', { dateStyle: 'long' })}</p>
                    </div>
                    {transferTotalWeight > 0 && (
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase">Total Payload Weight</p>
                            <p className="font-semibold text-sky-700">{transferTotalWeight.toFixed(2)} kg</p>
                        </div>
                    )}
                    {transferTotalVolume > 0 && (
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase">Total Payload Volume</p>
                            <p className="font-semibold text-sky-700">{transferTotalVolume.toFixed(4)} CBM</p>
                        </div>
                    )}
                    <div className="p-4 bg-gray-50 border border-gray-200 rounded">
                        <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Source Location</p>
                        <p className="text-lg font-bold">{fromBranchName}</p>
                    </div>
                </div>
                <div className="space-y-4">
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase">Status</p>
                        <p className="font-semibold">{transfer.status}</p>
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase">Transfer Purpose</p>
                        <p className="font-semibold">{purpose || 'General'}</p>
                    </div>
                    <div className="p-4 bg-gray-50 border border-gray-200 rounded">
                        <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Destination Location</p>
                        <p className="text-lg font-bold">{toBranchName}</p>
                    </div>
                </div>
            </div>

            {/* Item Table */}
            <div className="mb-12">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-gray-800 text-white">
                            <th className="py-3 px-4 text-left text-xs uppercase">Item Description</th>
                            <th className="py-3 px-4 text-center text-xs uppercase w-24">Unit Weight</th>
                            <th className="py-3 px-4 text-center text-xs uppercase w-32">Quantity</th>
                            <th className="py-3 px-4 text-left text-xs uppercase w-48">Unit</th>
                        </tr>
                    </thead>
                    <tbody className="border-b-2 border-gray-800">
                        {transfer.items?.map((item, idx) => {
                            const product = products.find(p => p.id === item.product_id);
                            const weightAttr = product?.attributes?.find(a => a.name.toLowerCase() === 'weight');
                            const itemDims = item.dimensions || product?.attributes?.find(a => a.name.toLowerCase() === 'dimensions')?.value;
                            
                            return (
                            <tr key={idx} className={idx < transfer.items.length - 1 ? 'border-b border-gray-100' : ''}>
                                <td className="py-4 px-4">
                                    <p className="font-bold">{item.product_name}</p>
                                    <p className="text-[10px] text-gray-500 font-mono mt-0.5">SKU: {item.sku || item.product_id}</p>
                                    {itemDims && <p className="text-[10px] text-gray-400 italic">Dims: {itemDims}</p>}
                                </td>
                                <td className="py-4 px-4 text-center text-sm">{weightAttr?.value || '-'}</td>
                                <td className="py-4 px-4 text-center font-black">{item.quantity}</td>
                                <td className="py-4 px-4 text-gray-600 italic">Pcs / Units</td>
                            </tr>
                        );})}
                    </tbody>
                </table>
            </div>

            {/* Note Section */}
            <div className="mb-16">
                <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Internal Remarks</p>
                <div className="h-20 border border-gray-200 rounded p-3 text-sm text-gray-700 italic">
                    {transfer.note || 'No internal remarks provided for this transfer.'}
                </div>
            </div>

            {/* Signature Section */}
            <div className="grid grid-cols-3 gap-8 mt-auto pt-10">
                <div className="text-center border-t border-gray-400 pt-4">
                    <p className="text-xs font-bold uppercase tracking-tighter">Authorized By</p>
                    <div className="h-12 flex items-center justify-center">
                        {transfer.status === 'Completed' && signatureUrl && (
                            <img src={signatureUrl} alt="Authorized Signature" className="max-h-full object-contain" />
                        )}
                    </div>
                </div>
                <div className="text-center border-t border-gray-400 pt-4">
                    <p className="text-xs font-bold uppercase tracking-tighter">Dispatcher</p>
                    <div className="h-12"></div>
                </div>
                <div className="text-center border-t border-gray-400 pt-4">
                    <p className="text-xs font-bold uppercase tracking-tighter">Receiver</p>
                    <div className="h-12"></div>
                </div>
            </div>

            {/* Print Date */}
            <div className="absolute bottom-4 left-10 text-xs text-gray-500">
                Printed: {new Date().toLocaleString()}
            </div>
        </div>
    );
};

export default StockTransfer;