import React, {
    useState,
    useCallback,
    useEffect,
} from 'react';

import {
    Sale as SaleType,
    DataProduct,
    Branch,
    SaleStatus,
} from '../../types';

import Placeholder from '../ui/Placeholder';
import Modal from '../ui/Modal';
import SaleForm from './SaleForm';
import { StatusBadge } from '../ui/StatusBadge';

import { supabase } from '../../utils/supabase';

import { useProductHistory } from '../inventory/useProductHistory';

import { mockSales } from '../../data';

interface SaleProps {
    products: DataProduct[];

    setProducts: React.Dispatch<
        React.SetStateAction<DataProduct[]>
    >;

    branches: Branch[];
}

const Sale: React.FC<SaleProps> = ({
    products,
    setProducts,
    branches,
}) => {

    const [sales, setSales] =
        useState<SaleType[]>(mockSales);

    const [isModalOpen, setIsModalOpen] =
        useState(false);

    const [isLoading, setIsLoading] =
        useState(false);

    const [isSaving, setIsSaving] =
        useState(false);

    const [searchTerm, setSearchTerm] =
        useState('');

    const [statusFilter, setStatusFilter] =
        useState<'All' | SaleStatus>('All');

    const [currentPage, setCurrentPage] =
        useState(1);

    const [itemsPerPage, setItemsPerPage] =
        useState(10);

    const [totalSalesCount, setTotalSalesCount] =
        useState(0);

    const { recordStockChange } =
        useProductHistory(
            products,
            setProducts
        );

    /* =========================================================
       FETCH SALES
    ========================================================= */

    const fetchSales = useCallback(
        async () => {

            setIsLoading(true);

            try {

                let query = supabase
                    .from('sales')
                    .select('*', {
                        count: 'exact',
                    });

                if (
                    statusFilter !== 'All'
                ) {
                    query = query.eq(
                        'status',
                        statusFilter
                    );
                }

                if (
                    searchTerm.trim()
                ) {
                    query = query.or(
                        `id.ilike.%${searchTerm}%,customer.ilike.%${searchTerm}%`
                    );
                }

                const offset =
                    (currentPage - 1) *
                    itemsPerPage;

                const {
                    data,
                    error,
                    count,
                } = await query
                    .order(
                        'created_at',
                        {
                            ascending: false,
                        }
                    )
                    .range(
                        offset,
                        offset +
                            itemsPerPage -
                            1
                    );

                if (error) {
                    throw error;
                }

                setSales(
                    (data as SaleType[]) ||
                        []
                );

                setTotalSalesCount(
                    count || 0
                );

            } catch (error) {

                console.error(
                    'Error fetching sales:',
                    error
                );

            } finally {

                setIsLoading(false);
            }
        },
        [
            statusFilter,
            searchTerm,
            currentPage,
            itemsPerPage,
        ]
    );

    /* =========================================================
       FETCH EFFECT
    ========================================================= */

    useEffect(() => {

        const debounceHandler =
            setTimeout(() => {

                fetchSales();

            }, 400);

        return () =>
            clearTimeout(
                debounceHandler
            );

    }, [fetchSales]);

    /* =========================================================
       RESET PAGE ON FILTER CHANGE
    ========================================================= */

    useEffect(() => {

        setCurrentPage(1);

    }, [
        searchTerm,
        statusFilter,
        itemsPerPage,
    ]);

    /* =========================================================
       ADD SALE
    ========================================================= */

    const handleAddSale =
        async (
            newSaleData: Omit<
                SaleType,
                'id' | 'total'
            >
        ) => {

            setIsSaving(true);

            const total =
                newSaleData.items.reduce(
                    (
                        sum,
                        item
                    ) =>
                        sum +
                        item.quantity *
                            item.price,
                    0
                );

            const newSale: SaleType = {
                ...newSaleData,

                id: `SALE-${Date.now()}`,

                total,

                status:
                    newSaleData.status ??
                    'Completed',
            };

            const branchName =
                branches.find(
                    b =>
                        b.id ===
                        newSale.branchId
                )?.name ||
                'Unknown Branch';

            try {

                const { error } =
                    await supabase.rpc(
                        'create_sale_and_update_stock',
                        {
                            p_sale_id:
                                newSale.id,

                            p_customer:
                                newSale.customer,

                            p_branch_id:
                                newSale.branchId,

                            p_branch_name:
                                branchName,

                            p_sale_date:
                                newSale.saleDate,

                            p_status:
                                newSale.status,

                            p_total:
                                newSale.total,

                            p_items:
                                newSale.items,
                        }
                    );

                if (error) {

                    console.error(
                        'Transaction failed:',
                        error.message
                    );

                    alert(
                        'Failed to save sale.'
                    );

                    return;
                }

                await fetchSales();

                setIsModalOpen(false);

            } catch (error) {

                console.error(
                    'Add sale error:',
                    error
                );

            } finally {

                setIsSaving(false);
            }
        };

    /* =========================================================
       CANCEL SALE
    ========================================================= */

    const handleCancelSale =
        async (
            sale: SaleType
        ) => {

            const confirmed =
                window.confirm(
                    'Are you sure you want to cancel this sale?'
                );

            if (!confirmed) {
                return;
            }

            try {

                if (
                    sale.status ===
                    'Completed'
                ) {

                    const branchName =
                        branches.find(
                            b =>
                                b.id ===
                                sale.branchId
                        )?.name ||
                        'Unknown';

                    for (const item of sale.items) {

                        await recordStockChange(
                            item.productId,

                            sale.branchId,

                            branchName,

                            item.quantity,

                            'Adjustment',

                            `Cancelled Sale Ref: ${sale.id}`
                        );
                    }
                }

                const { error } =
                    await supabase
                        .from('sales')
                        .update({
                            status:
                                'Cancelled',
                        })
                        .eq(
                            'id',
                            sale.id
                        );

                if (error) {

                    console.error(
                        'Cancel sale error:',
                        error.message
                    );

                    return;
                }

                await fetchSales();

            } catch (error) {

                console.error(
                    'Cancel sale failed:',
                    error
                );
            }
        };

    /* =========================================================
       UI
    ========================================================= */

    const inputClasses =
        'bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm px-3 py-2 text-sm text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-sky-500';

    const totalPages =
        Math.ceil(
            totalSalesCount /
                itemsPerPage
        );

    return (

        <Placeholder title="Sales">

            {/* HEADER */}

            <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">

                <input
                    type="text"
                    placeholder="Search by ID or Customer..."
                    value={searchTerm}
                    onChange={(
                        e
                    ) =>
                        setSearchTerm(
                            e.target.value
                        )
                    }
                    className={`${inputClasses} w-full sm:w-64`}
                />

                <div className="w-full sm:w-auto flex flex-wrap gap-2 justify-end">

                    <select
                        value={
                            statusFilter
                        }
                        onChange={(
                            e
                        ) =>
                            setStatusFilter(
                                e.target
                                    .value as
                                    | 'All'
                                    | SaleStatus
                            )
                        }
                        className={`${inputClasses} w-full sm:w-48`}
                    >

                        <option value="All">
                            All Statuses
                        </option>

                        <option value="Pending">
                            Pending
                        </option>

                        <option value="Completed">
                            Completed
                        </option>

                        <option value="Cancelled">
                            Cancelled
                        </option>
                    </select>

                    <button
                        onClick={() =>
                            setIsModalOpen(
                                true
                            )
                        }
                        className="bg-sky-600 text-white px-4 py-2 rounded-md hover:bg-sky-700 transition-colors"
                    >
                        New Sale
                    </button>
                </div>
            </div>

            {/* TABLE */}

            <div
                className={`overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 transition-opacity duration-200 ${
                    isLoading
                        ? 'opacity-50 pointer-events-none'
                        : 'opacity-100'
                }`}
            >

                <table className="min-w-full bg-white dark:bg-gray-800">

                    <thead className="bg-gray-50 dark:bg-gray-700">

                        <tr>

                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                Sale ID
                            </th>

                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                Branch
                            </th>

                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                Customer
                            </th>

                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                Date
                            </th>

                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                Serials
                            </th>

                            <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">
                                Total
                            </th>

                            <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">
                                Status
                            </th>

                            <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">

                        {sales.length >
                        0 ? (

                            sales.map(
                                sale => (

                                    <tr
                                        key={
                                            sale.id
                                        }
                                        className="hover:bg-gray-50 dark:hover:bg-gray-700"
                                    >

                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            {
                                                sale.id
                                            }
                                        </td>

                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            {
                                                branches.find(
                                                    b =>
                                                        b.id ===
                                                        sale.branchId
                                                )
                                                    ?.name
                                            }
                                        </td>

                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            {
                                                sale.customer
                                            }
                                        </td>

                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            {
                                                sale.saleDate
                                            }
                                        </td>

                                        <td className="px-6 py-4 whitespace-nowrap text-sm max-w-xs truncate">

                                            {sale.items.flatMap(
                                                item =>
                                                    item.serialNumbers ||
                                                    []
                                            )
                                                .length >
                                            0
                                                ? sale.items
                                                      .flatMap(
                                                          item =>
                                                              item.serialNumbers ||
                                                              []
                                                      )
                                                      .join(
                                                          ', '
                                                      )
                                                : 'N/A'}
                                        </td>

                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                                            $
                                            {sale.total.toFixed(
                                                2
                                            )}
                                        </td>

                                        <td className="px-6 py-4 whitespace-nowrap text-center">

                                            <StatusBadge
                                                status={
                                                sale.status || 'Completed'
                                                }
                                            />
                                        </td>

                                        <td className="px-6 py-4 whitespace-nowrap text-center">

                                            {sale.status !==
                                                'Cancelled' && (

                                                <button
                                                    onClick={() =>
                                                        handleCancelSale(
                                                            sale
                                                        )
                                                    }
                                                    className="text-red-600 hover:underline"
                                                >
                                                    Cancel
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                )
                            )

                        ) : (

                            <tr>

                                <td
                                    colSpan={
                                        8
                                    }
                                    className="px-6 py-12 text-center text-sm text-gray-500"
                                >
                                    {isLoading
                                        ? 'Loading sales...'
                                        : 'No sales found.'}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* PAGINATION */}

            {totalSalesCount >
                0 && (

                <div className="flex flex-col sm:flex-row items-center justify-between mt-6 gap-4 px-2">

                    <div className="flex items-center gap-4">

                        <p className="text-sm text-gray-600 dark:text-gray-400">

                            Showing{' '}

                            <span className="font-medium">
                                {Math.min(
                                    totalSalesCount,
                                    (currentPage -
                                        1) *
                                        itemsPerPage +
                                        1
                                )}
                            </span>

                            {' '}to{' '}

                            <span className="font-medium">
                                {Math.min(
                                    totalSalesCount,
                                    currentPage *
                                        itemsPerPage
                                )}
                            </span>

                            {' '}of{' '}

                            <span className="font-medium">
                                {
                                    totalSalesCount
                                }
                            </span>
                        </p>

                        <select
                            value={
                                itemsPerPage
                            }
                            onChange={(
                                e
                            ) =>
                                setItemsPerPage(
                                    Number(
                                        e.target
                                            .value
                                    )
                                )
                            }
                            className="bg-transparent text-sm"
                        >

                            <option value={5}>
                                5 / page
                            </option>

                            <option value={10}>
                                10 / page
                            </option>

                            <option value={20}>
                                20 / page
                            </option>

                            <option value={50}>
                                50 / page
                            </option>
                        </select>
                    </div>

                    {totalPages >
                        1 && (

                        <div className="flex gap-2">

                            <button
                                onClick={() =>
                                    setCurrentPage(
                                        prev =>
                                            Math.max(
                                                prev -
                                                    1,
                                                1
                                            )
                                    )
                                }
                                disabled={
                                    currentPage ===
                                    1
                                }
                                className="px-3 py-1 border rounded-md text-sm disabled:opacity-50"
                            >
                                Previous
                            </button>

                            <span className="text-sm flex items-center px-2">
                                Page{' '}
                                {
                                    currentPage
                                }{' '}
                                of{' '}
                                {
                                    totalPages
                                }
                            </span>

                            <button
                                onClick={() =>
                                    setCurrentPage(
                                        prev =>
                                            Math.min(
                                                prev +
                                                    1,
                                                totalPages
                                            )
                                    )
                                }
                                disabled={
                                    currentPage ===
                                    totalPages
                                }
                                className="px-3 py-1 border rounded-md text-sm disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* MODAL */}

            {isModalOpen && (

                <Modal
                    title="Record New Sale"
                    onClose={() =>
                        setIsModalOpen(
                            false
                        )
                    }
                >

                    <SaleForm
                        products={
                            products
                        }
                        branches={
                            branches
                        }
                        onAdd={
                            handleAddSale
                        }
                        isSaving={
                            isSaving
                        }
                        onCancel={() =>
                            setIsModalOpen(
                                false
                            )
                        }
                    />
                </Modal>
            )}
        </Placeholder>
    );
};

export default Sale;