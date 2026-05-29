import React, { useState, useMemo, useEffect } from 'react';
import { StockTransfer as StockTransferType, DataProduct, Branch } from '../../types';
import Placeholder from '../ui/Placeholder';
import Modal from '../ui/Modal';
import StockTransferForm from './StockTransferForm';
import { supabase } from '../../utils/supabase';

interface StockTransferProps {
    products: DataProduct[];
    setProducts: React.Dispatch<React.SetStateAction<DataProduct[]>>;
    branches: Branch[];
    stockTransfers: StockTransferType[];
    setStockTransfers: React.Dispatch<React.SetStateAction<StockTransferType[]>>;
}

const StockTransfer: React.FC<StockTransferProps> = ({ products, setProducts, branches, stockTransfers, setStockTransfers }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTransfer, setSelectedTransfer] = useState<StockTransferType | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [fromBranchFilter, setFromBranchFilter] = useState('All');
    const [toBranchFilter, setToBranchFilter] = useState('All');
    
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10); // State for items per page

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, statusFilter, fromBranchFilter, toBranchFilter, itemsPerPage]); // Add itemsPerPage to dependencies

    const filteredTransfers = useMemo(() => {
        return stockTransfers.filter(t => {
            const matchesSearch = 
                t.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                t.items.some(item => item.productName.toLowerCase().includes(searchTerm.toLowerCase()));
            
            const matchesStatus = statusFilter === 'All' || t.status === statusFilter;
            const matchesFromBranch = fromBranchFilter === 'All' || t.fromBranchId === fromBranchFilter;
            const matchesToBranch = toBranchFilter === 'All' || t.toBranchId === toBranchFilter;

            return matchesSearch && matchesStatus && matchesFromBranch && matchesToBranch;
        });
    }, [stockTransfers, searchTerm, statusFilter, fromBranchFilter, toBranchFilter]);

    const totalPages = Math.ceil(filteredTransfers.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedTransfers = filteredTransfers.slice(startIndex, startIndex + itemsPerPage);

    const inputClasses = "bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm px-3 py-2 text-sm text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-sky-500";

    const handleAddTransfer = async (transferData: Omit<StockTransferType, 'id' | 'total'>) => {
        const total = transferData.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
        const branchNameFrom = branches.find(b => b.id === transferData.fromBranchId)?.name || 'Unknown';
        const branchNameTo = branches.find(b => b.id === transferData.toBranchId)?.name || 'Unknown';

        const newTransfer: StockTransferType = {
            ...transferData,
            id: `ST-${String(stockTransfers.length + 1).padStart(3, '0')}`,
            total,
        };

        const { error } = await supabase.rpc('process_stock_transfer', {
            p_transfer_id: newTransfer.id,
            p_from_branch_id: newTransfer.fromBranchId,
            p_to_branch_id: newTransfer.toBranchId,
            p_from_branch_name: branchNameFrom,
            p_to_branch_name: branchNameTo,
            p_transfer_date: newTransfer.transferDate,
            p_status: newTransfer.status,
            p_total: newTransfer.total,
            p_items: newTransfer.items,
            p_note: newTransfer.note || ''
        });

        if (error) {
            console.error('Transfer failed:', error);
            alert('Failed to process stock transfer.');
            return;
        }

        setStockTransfers(prev => [newTransfer, ...prev]);
        setIsModalOpen(false);
    };

    const handleCancelTransfer = (transferId: string) => {
        const transfer = stockTransfers.find(t => t.id === transferId);
        if (!transfer || transfer.status !== 'Completed') return;

        if (!window.confirm('Are you sure you want to cancel this transfer? This will revert stock levels at both locations.')) return;

        const fromBranchName = branches.find(b => b.id === transfer.fromBranchId)?.name || 'Unknown';
        const toBranchName = branches.find(b => b.id === transfer.toBranchId)?.name || 'Unknown';

        const updatedProducts = products.map(p => {
            const transferItem = transfer.items.find(item => item.productId === p.id);
            if (transferItem) {
                const currentFromStock = p.stockByLocation[transfer.fromBranchId] || 0;
                const currentToStock = p.stockByLocation[transfer.toBranchId] || 0;

                // REVERSE: Return stock to source, remove from destination
                const newFromStock = currentFromStock + transferItem.quantity;
                const newToStock = currentToStock - transferItem.quantity;

                const existingToSerials = p.serialNumbersByLocation?.[transfer.toBranchId] || [];
                const transferSerials = transferItem.serialNumbers || [];
                const updatedToSerials = existingToSerials.filter(sn => !transferSerials.includes(sn));

                const fromSerials = p.serialNumbersByLocation?.[transfer.fromBranchId] || [];
                const updatedFromSerials = [...fromSerials, ...transferSerials];

                const newHistory = [
                    ...(p.history || []),
                    {
                        date: new Date().toISOString().split('T')[0],
                        action: 'Transfer In' as const,
                        change: transferItem.quantity,
                        newStock: newFromStock,
                        branch: fromBranchName,
                        reason: `Cancellation of Transfer #${transfer.id}${transferSerials.length > 0 ? ` Serials: ${transferSerials.join(', ')}` : ''}`
                    },
                    {
                        date: new Date().toISOString().split('T')[0],
                        action: 'Transfer Out' as const,
                        change: -transferItem.quantity,
                        newStock: newToStock,
                        branch: toBranchName,
                        reason: `Cancellation of Transfer #${transfer.id}${transferSerials.length > 0 ? ` Serials: ${transferSerials.join(', ')}` : ''}`
                    }
                ];

                return {
                    ...p,
                    stockByLocation: {
                        ...p.stockByLocation,
                        [transfer.fromBranchId]: newFromStock,
                        [transfer.toBranchId]: newToStock
                    },
                    serialNumbersByLocation: {
                        ...(p.serialNumbersByLocation || {}),
                        [transfer.fromBranchId]: updatedFromSerials,
                        [transfer.toBranchId]: updatedToSerials
                    },
                    history: newHistory
                };
            }
            return p;
        });

        setProducts(updatedProducts);
        setStockTransfers(prev => prev.map(t => t.id === transferId ? { ...t, status: 'Cancelled' } : t));
        if (selectedTransfer?.id === transferId) {
            setSelectedTransfer(prev => prev ? { ...prev, status: 'Cancelled' } : null);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const getBranchName = (id: string) => branches.find(b => b.id === id)?.name || 'N/A';

    return (
        <Placeholder title="Stock Transfers">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                    <input
                        type="text"
                        placeholder="Search transfers..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={`${inputClasses} w-full sm:w-64`}
                    />
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className={`${inputClasses} w-full sm:w-auto`}
                    >
                        <option value="All">All Statuses</option>
                        <option value="Pending">Pending</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                    </select>
                    <select
                        value={fromBranchFilter}
                        onChange={(e) => setFromBranchFilter(e.target.value)}
                        className={`${inputClasses} w-full sm:w-auto`}
                    >
                        <option value="All">From: All Branches</option>
                        {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                    <select
                        value={toBranchFilter}
                        onChange={(e) => setToBranchFilter(e.target.value)}
                        className={`${inputClasses} w-full sm:w-auto`}
                    >
                        <option value="All">To: All Branches</option>
                        {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                </div>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="bg-sky-600 text-white px-4 py-2 rounded-md hover:bg-sky-700 transition-colors w-full md:w-auto flex-shrink-0"
                >
                    New Stock Transfer
                </button>
            </div>
             <div className="overflow-x-auto">
                <table className="min-w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Transfer ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">From</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">To</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Product</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Quantity</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                        {paginatedTransfers.length > 0 ? paginatedTransfers.map(t => (
                             <tr key={t.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{t.id}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{t.transferDate}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{getBranchName(t.fromBranchId)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{getBranchName(t.toBranchId)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                    {t.items.map(item => item.productName).join(', ')}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500 dark:text-gray-300">
                                    {t.items.reduce((sum, item) => sum + item.quantity, 0)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                                    <span className={`px-2 py-1 text-[10px] font-bold rounded-full uppercase tracking-tighter ${
                                        t.status === 'Completed' ? 'bg-green-100 text-green-700' : t.status === 'Cancelled' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                                    }`}>
                                        {t.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                                    <button
                                        onClick={() => setSelectedTransfer(t)}
                                        className="text-sky-600 hover:text-sky-800 dark:text-sky-400 dark:hover:text-sky-300 font-medium"
                                    >
                                        View
                                    </button>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={8} className="px-6 py-10 text-center text-sm text-gray-500 dark:text-gray-400">No transfers found matching your criteria.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls & Row Selection */}
            {filteredTransfers.length > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-between mt-6 gap-4 px-2">
                    <div className="flex items-center gap-4 order-2 sm:order-1">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Showing <span className="font-medium text-gray-900 dark:text-white">{startIndex + 1}</span> to <span className="font-medium text-gray-900 dark:text-white">{Math.min(startIndex + itemsPerPage, filteredTransfers.length)}</span> of <span className="font-medium text-gray-900 dark:text-white">{filteredTransfers.length}</span> results
                        </p>
                        <select
                            value={itemsPerPage}
                            onChange={(e) => setItemsPerPage(Number(e.target.value))}
                            className="bg-transparent text-sm text-gray-500 dark:text-gray-400 border-none focus:ring-0 cursor-pointer hover:text-sky-600 transition-colors"
                        >
                            <option value={5}>5 / page</option>
                            <option value={10}>10 / page</option>
                            <option value={20}>20 / page</option>
                            <option value={50}>50 / page</option>
                        </select>
                    </div>
                    <div className="flex gap-2 order-1 sm:order-2">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Previous
                        </button>
                        <div className="flex items-center">
                            <span className="text-sm text-gray-600 dark:text-gray-400 mx-2">Page {currentPage} of {totalPages}</span>
                        </div>
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}

            {/* Details Modal */}
            {selectedTransfer && (
                <Modal 
                    title={`Transfer Details - ${selectedTransfer.id}`} 
                    onClose={() => setSelectedTransfer(null)}
                >
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</p>
                                <p className="text-sm text-gray-900 dark:text-white">{selectedTransfer.transferDate}</p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</p>
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                    selectedTransfer.status === 'Completed' ? 'bg-green-100 text-green-800' : selectedTransfer.status === 'Cancelled' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                                }`}>
                                    {selectedTransfer.status}
                                </span>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">From Branch</p>
                                <p className="text-sm text-gray-900 dark:text-white">{getBranchName(selectedTransfer.fromBranchId)}</p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">To Branch</p>
                                <p className="text-sm text-gray-900 dark:text-white">{getBranchName(selectedTransfer.toBranchId)}</p>
                            </div>
                        </div>

                        {selectedTransfer.note && (
                            <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Note</p>
                                <p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-md italic">
                                    "{selectedTransfer.note}"
                                </p>
                            </div>
                        )}

                        <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Items Transferred</p>
                            <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead className="bg-gray-50 dark:bg-gray-800">
                                        <tr>
                                            <th className="px-4 py-2 text-left text-[10px] font-bold text-gray-500 uppercase">Product</th>
                                            <th className="px-4 py-2 text-left text-[10px] font-bold text-gray-500 uppercase">SKU</th>
                                            <th className="px-4 py-2 text-left text-[10px] font-bold text-gray-500 uppercase">Serials</th>
                                            <th className="px-4 py-2 text-right text-[10px] font-bold text-gray-500 uppercase">Qty</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                                        {selectedTransfer.items.map((item, idx) => (
                                            <tr key={idx}>
                                                <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">{item.productName}</td>
                                                <td className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">{item.sku || 'N/A'}</td>
                                                <td className="px-4 py-2 text-xs text-gray-500 dark:text-gray-400">
                                                    {item.serialNumbers && item.serialNumbers.length > 0 
                                                        ? item.serialNumbers.join(', ') 
                                                        : 'N/A'}
                                                </td>
                                                <td className="px-4 py-2 text-sm text-right text-gray-900 dark:text-white font-medium">{item.quantity}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="flex justify-between items-center pt-4 border-t dark:border-gray-700">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={handlePrint}
                                    className="text-xs text-sky-600 hover:text-sky-800 dark:text-sky-400 dark:hover:text-sky-300 font-semibold flex items-center gap-1"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-4a2 2 0 01-2-2H5a2 2 0 01-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                    </svg>
                                    Print / Export
                                </button>

                                {selectedTransfer.status === 'Completed' && (
                                    <button
                                        onClick={() => handleCancelTransfer(selectedTransfer.id)}
                                        className="text-xs text-red-600 hover:text-red-800 font-semibold flex items-center gap-1"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        Cancel Transfer
                                    </button>
                                )}
                            </div>
                            <button
                                onClick={() => setSelectedTransfer(null)}
                                className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </Modal>
            )}

            {isModalOpen && (
                <Modal title="New Stock Transfer" onClose={() => setIsModalOpen(false)}>
                    <StockTransferForm
                        products={products}
                        branches={branches}
                        onAdd={handleAddTransfer}
                        onCancel={() => setIsModalOpen(false)}
                    />
                </Modal>
            )}
        </Placeholder>
    );
};

export default StockTransfer;