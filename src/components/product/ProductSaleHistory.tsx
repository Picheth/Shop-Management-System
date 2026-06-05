import React, { useEffect, useState, useMemo } from 'react';
import { inventoryService } from '../../service/inventoryService';
import { Database } from '../../supabase/database.types';
import LoadingSpinner from '../ui/LoadingSpinner';
import { formatCurrency, sanitizeCSV } from '../../lib/utils';
import { ExportIcon } from '../ui/Icons';

type SaleRow = Database['public']['Tables']['sales']['Row'];

interface ProductSaleHistoryProps {
    productId: string;
}

const ProductSaleHistory: React.FC<ProductSaleHistoryProps> = ({ productId }) => {
    const [sales, setSales] = useState<SaleRow[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSales = async () => {
            try {
                const data = await inventoryService.getProductSales(productId);
                setSales(data);
            } catch (err) {
                console.error('Failed to fetch product sales:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchSales();
    }, [productId]);

    /**
     * Aggregates purchase data by customer to identify top buyers.
     */
    const customerSummary = useMemo(() => {
        const aggregation: Record<string, { name: string; totalQty: number; orders: number }> = {};

        sales.forEach(sale => {
            const customer = sale.customer || 'Walk-in Customer';
            const items = (sale.items as any[]) || [];
            const item = items.find(i => i.product_id === productId);
            const qty = item?.quantity || 0;

            if (!aggregation[customer]) {
                aggregation[customer] = { name: customer, totalQty: 0, orders: 0 };
            }
            aggregation[customer].totalQty += qty;
            aggregation[customer].orders += 1;
        });

        return Object.values(aggregation)
            .sort((a, b) => b.totalQty - a.totalQty)
            .slice(0, 3); // Return top 3 performers
    }, [sales, productId]);

    const handleExportCSV = () => {
        if (!sales.length) {
            alert("No sales data to export.");
            return;
        }

        const headers = ['Sale ID', 'Date', 'Customer', 'Quantity', 'Unit Price', 'Total Amount'];
        const rows = sales.map(sale => {
            const items = (sale.items as any[]) || [];
            const item = items.find(i => i.product_id === productId);
            const quantity = item?.quantity || 0;
            const unitPrice = item?.price || 0;
            const totalAmount = quantity * unitPrice;

            return [
                sanitizeCSV(sale.id),
                sanitizeCSV(sale.sale_date),
                sanitizeCSV(sale.customer),
                sanitizeCSV(quantity),
                sanitizeCSV(unitPrice.toFixed(2)),
                sanitizeCSV(totalAmount.toFixed(2))
            ].join(',');
        });

        const csvContent = [headers.join(','), ...rows].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `product_${productId}_sales_history_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading) return <LoadingSpinner />;

    return (
        <div className="space-y-4">
            {/* Most Active Customers Summary */}
            {customerSummary.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-2 animate-fade-in">
                    {customerSummary.map((c, idx) => (
                        <div key={c.name} className="bg-sky-50/30 dark:bg-sky-900/10 border border-sky-100 dark:border-sky-800/50 rounded-lg p-3 flex flex-col items-center text-center shadow-sm">
                            <div className="flex items-center gap-2 mb-1">
                                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-black ${
                                    idx === 0 ? 'bg-amber-100 text-amber-600' : 'bg-gray-100 text-gray-500'
                                }`}>
                                    {idx + 1}
                                </span>
                                <span className="text-xs font-bold text-gray-900 dark:text-white truncate max-w-[120px]">{c.name}</span>
                            </div>
                            <p className="text-[10px] font-medium text-sky-600 dark:text-sky-400 uppercase tracking-tighter">
                                {c.totalQty} units across {c.orders} {c.orders === 1 ? 'sale' : 'sales'}
                            </p>
                        </div>
                    ))}
                </div>
            )}

            <div className="flex justify-between items-center px-2">
                <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">Transaction Records</h4>
                <span className="text-[10px] font-bold text-sky-600 bg-sky-50 dark:bg-sky-900/30 px-2 py-0.5 rounded-full">
                    {sales.length} Sales Found
                </span>
                {sales.length > 0 && (
                    <button
                        onClick={handleExportCSV}
                        className="text-[10px] font-black uppercase tracking-widest text-sky-600 hover:text-sky-700 transition-colors bg-white dark:bg-gray-800 px-2 py-1 rounded border border-gray-200 dark:border-gray-700 shadow-sm flex items-center gap-1.5"
                        title="Export Sales History as CSV"
                    >
                        <ExportIcon size={14} />
                        CSV
                    </button>
                )}
            </div>

            <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-900/50">
                        <tr>
                            <th className="px-6 py-3 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">Date</th>
                            <th className="px-6 py-3 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">Customer</th>
                            <th className="px-6 py-3 text-center text-[10px] font-black uppercase tracking-widest text-gray-400">Qty</th>
                            <th className="px-6 py-3 text-right text-[10px] font-black uppercase tracking-widest text-gray-400">Unit Price</th>
                            <th className="px-6 py-3 text-right text-[10px] font-black uppercase tracking-widest text-gray-400">Total</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {sales.length > 0 ? sales.map((sale) => {
                            // Parse the specific item data for this product from the items array
                            const items = (sale.items as any[]) || [];
                            const item = items.find(i => i.product_id === productId);
                            
                            return (
                                <tr key={sale.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300 tabular-nums">
                                        {sale.sale_date}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-white">
                                        {sale.customer}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium text-gray-700 dark:text-gray-300 tabular-nums">
                                        {item?.quantity || 0}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-600 dark:text-gray-400 tabular-nums">
                                        {formatCurrency(item?.price || 0)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-sky-600 dark:text-sky-400 tabular-nums">
                                        {formatCurrency((item?.quantity || 0) * (item?.price || 0))}
                                    </td>
                                </tr>
                            );
                        }) : (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-sm text-gray-500 italic">
                                    No sales history found for this product.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ProductSaleHistory;
