
import React, { useState, useMemo } from 'react';
import { Page, DataProduct } from './types';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import { mockProducts } from './data';

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

// The page components are now typed with `any` to allow passing down shared state
// like `products` and `setProducts` without requiring every component to accept them.
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
};

const App: React.FC = () => {
    const [currentPage, setCurrentPage] = useState<Page>(Page.Dashboard);
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    
    // The `products` state is "lifted" to the App component, making it the single source of truth.
    const [products, setProducts] = useState<DataProduct[]>(mockProducts);

    const CurrentPageComponent = useMemo(() => pageComponents[currentPage], [currentPage]);

    // This object defines which props to pass to which page.
    // This is a simple way to provide shared state to only the components that need it.
    const pageProps: { [key in Page]?: object } = {
        [Page.Product]: { products, setProducts },
        [Page.PurchaseOrder]: { products },
        [Page.Purchase]: { products, setProducts },
        [Page.Sale]: { products, setProducts },
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