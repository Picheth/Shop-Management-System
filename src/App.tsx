import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Page, DataProduct, Branch, StockTransfer as StockTransferType, Sale as SaleType } from './types';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import { mockProducts, mockBranches, mockStockTransfers } from './data';
import { supabase } from './utils/supabase';

import Dashboard from './components/core/Dashboard';
import PurchaseOrder from './components/operations/PurchaseOrder';
import Purchase from './components/operations/Purchase';
import Sale from './components/operations/Sale';
import RepairCenter from './components/operations/RepairCenter';
import Settlement from './components/operations/Settlement';
import Inventory from './components/inventory/Inventory';
import Product from './components/inventory/Product';
import Variation from './components/inventory/Variation';
import BranchLocation from './components/inventory/BranchLocation';
import StockTransfer from './components/inventory/StockTransfer';
import AccountsPayable from './components/finance/AccountsPayable';
import AccountsReceivable from './components/finance/AccountsReceivable';
import CashFlow from './components/finance/CashFlow';
import Expense from './components/finance/Expense';
import TaxPayment from './components/finance/TaxPayment';
import SummaryReport from './components/reports/SummaryReport';
import BalanceSheet from './components/reports/BalanceSheet';
import IncomeStatement from './components/reports/IncomeStatement';
import ProfitAndLoss from './components/reports/ProfitAndLoss';
import Report from './components/reports/Report';
import ChartOfAccount from './components/settings/ChartOfAccount';
import Supplier from './components/settings/Supplier';
import Contact from './components/settings/Contact';
import ExpenseCategory from './components/settings/ExpenseCategory';
import Staff from './components/hr/Staff';
import Payroll from './components/hr/Payroll';

const pageComponents: Record<Page, React.ComponentType<any>> = {
    [Page.Dashboard]: Dashboard,
    [Page.PurchaseOrder]: PurchaseOrder,
    [Page.Purchase]: Purchase,
    [Page.Sale]: Sale,
    [Page.RepairCenter]: RepairCenter,
    [Page.Settlement]: Settlement,
    [Page.Inventory]: Inventory,
    [Page.Product]: Product,
    [Page.Variation]: Variation,
    [Page.BranchLocation]: BranchLocation,
    [Page.StockTransfer]: StockTransfer,
    [Page.AccountsPayable]: AccountsPayable,
    [Page.AccountsReceivable]: AccountsReceivable,
    [Page.CashFlow]: CashFlow,
    [Page.Expense]: Expense,
    [Page.TaxPayment]: TaxPayment,
    [Page.SummaryReport]: SummaryReport,
    [Page.BalanceSheet]: BalanceSheet,
    [Page.IncomeStatement]: IncomeStatement,
    [Page.ProfitAndLoss]: ProfitAndLoss,
    [Page.Report]: Report,
    [Page.ChartOfAccount]: ChartOfAccount,
    [Page.Supplier]: Supplier,
    [Page.Contact]: Contact,
    [Page.ExpenseCategory]: ExpenseCategory,
    [Page.Staff]: Staff,
    [Page.Payroll]: Payroll,
    [Page.ProductType]: () => null,
    [Page.Category]: () => null,
    [Page.SubCategory]: () => null,
    [Page.Brand]: () => null
};

const App: React.FC = () => {
    const [currentPage, setCurrentPage] = useState<Page>(Page.Dashboard);
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    
    const [products, setProducts] = useState<DataProduct[]>([]);
    const [branches] = useState<Branch[]>(mockBranches);
    const [stockTransfers, setStockTransfers] = useState<StockTransferType[]>(mockStockTransfers);

    const handleSale = useCallback(async (sale: SaleType) => {
        try {
            // 1. Execute atomic stock decrement in Supabase via RPC
            // This handles all items in the sale within a single database transaction
            const { error } = await supabase.rpc('process_sale_stock', {
                p_branch_id: sale.branchId,
                p_items: sale.items.map(item => ({
                    productId: item.productId,
                    quantity: item.quantity
                }))
            });

            if (error) throw error;

            // 2. Update local state for immediate UI feedback
            setProducts(prev => prev.map(p => {
                const soldItem = sale.items.find(item => item.productId === p.id);
                if (soldItem) {
                    return {
                        ...p,
                        stockByLocation: {
                            ...p.stockByLocation,
                            [sale.branchId]: (p.stockByLocation[sale.branchId] || 0) - soldItem.quantity
                        }
                    };
                }
                return p;
            }));
        } catch (error) {
            console.error('Failed to update stock after sale:', error);
        }
    }, []); // products dependency removed as math is now handled by Postgres

    useEffect(() => {
        const fetchInitialData = async () => {
            const { data, error } = await supabase
                .from('products')
                .select('*');

            if (error) {
                console.error('Error fetching products:', error.message);
            } else if (data) {
                setProducts(data as DataProduct[]);
            }
        };

        fetchInitialData();
    }, []);

    const CurrentPageComponent = useMemo(() => pageComponents[currentPage], [currentPage]);

    const pageProps: { [key in Page]?: object } = {
        [Page.Product]: { products, setProducts, branches },
        [Page.PurchaseOrder]: { products },
        [Page.Purchase]: { products, setProducts, branches },
        [Page.Sale]: { products, setProducts, branches, onSaleComplete: handleSale },
        [Page.StockTransfer]: { products, setProducts, branches, stockTransfers, setStockTransfers },
        [Page.Inventory]: { products, setProducts, branches },
        [Page.RepairCenter]: { products, setProducts, branches, onNavigate: setCurrentPage, stockTransfers, setStockTransfers },
    };

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
            <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} isOpen={isSidebarOpen} setIsOpen={setSidebarOpen} />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header currentPage={currentPage} toggleSidebar={() => setSidebarOpen(!isSidebarOpen)} />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 dark:bg-gray-800 p-4 sm:p-6">
                    <CurrentPageComponent {...(pageProps[currentPage] || {})} />
                </main>
            </div>
        </div>
    );
};

export default App;