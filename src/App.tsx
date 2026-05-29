import React, {
    useState,
    useEffect,
    useMemo,
    useCallback,
} from 'react';

import Sidebar from './components/Sidebar';
import Header from './components/Header';

import {
    Page,
    DataProduct,
    Branch,
    StockTransfer as StockTransferType,
    Sale as SaleType,
    ProductType as ProductTypeInterface,
    Category as CategoryInterface,
    SubCategory as SubCategoryInterface,
    Repair as RepairType,
    Brand as BrandInterface,
} from './types';

import { mockBranches, mockStockTransfers, mockSales, mockRepairs } from './data';
import { supabase } from './utils/supabase';

/* =========================
   CORE
========================= */

import Dashboard from './components/core/Dashboard';

/* =========================
   OPERATIONS
========================= */

import PurchaseOrder from './components/operations/PurchaseOrder';
import Purchase from './components/operations/Purchase';
import Sale from './components/operations/Sale';
import RepairCenter from './components/operations/RepairCenter';
import Settlement from './components/operations/Settlement';

/* =========================
   INVENTORY
========================= */

import Inventory from './components/inventory/Inventory';
import Product from './components/inventory/Product';
import ProductType from './components/inventory/ProductType';
import Category from './components/inventory/Category';
import SubCategory from './components/inventory/SubCategory';
import Brand from './components/inventory/Brand';
import Variation from './components/inventory/Variation';
import BranchLocation from './components/inventory/BranchLocation';
import StockTransfer from './components/inventory/StockTransfer';

/* =========================
   FINANCE
========================= */

import AccountsPayable from './components/finance/AccountsPayable';
import AccountsReceivable from './components/finance/AccountsReceivable';
import CashFlow from './components/finance/CashFlow';
import Expense from './components/finance/Expense';
import TaxPayment from './components/finance/TaxPayment';

/* =========================
   REPORTS
========================= */

import SummaryReport from './components/reports/SummaryReport';
import BalanceSheet from './components/reports/BalanceSheet';
import IncomeStatement from './components/reports/IncomeStatement';
import ProfitAndLoss from './components/reports/ProfitAndLoss';
import Report from './components/reports/Report';

/* =========================
   SETTINGS
========================= */

import ChartOfAccount from './components/settings/ChartOfAccount';
import Supplier from './components/settings/Supplier';
import Contact from './components/settings/Contact';
import ExpenseCategory from './components/settings/ExpenseCategory';

/* =========================
   HR
========================= */

import Staff from './components/hr/Staff';
import Payroll from './components/hr/Payroll';

/* =========================
   PAGE COMPONENTS
========================= */

const pageComponents: Partial<
    Record<Page, React.ComponentType<any>>
> = {
    [Page.Dashboard]: Dashboard,

    [Page.Product]: Product,
    [Page.ProductType]: ProductType,
    [Page.Category]: Category,
    [Page.SubCategory]: SubCategory,
    [Page.Variation]: Variation,
    [Page.Inventory]: Inventory,
    [Page.BranchLocation]: BranchLocation,
    [Page.StockTransfer]: StockTransfer,

    [Page.PurchaseOrder]: PurchaseOrder,
    [Page.Purchase]: Purchase,
    [Page.Sale]: Sale,
    [Page.RepairCenter]: RepairCenter,
    [Page.Settlement]: Settlement,

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

    [Page.Brand]: Brand, // Add Brand component to pageComponents
};

/* =========================
   APP
========================= */

const App: React.FC = () => {
    const [currentPage, setCurrentPage] =
        useState<Page>(Page.Dashboard);

    const [isSidebarOpen, setSidebarOpen] =
        useState(false);

    /* =========================
       MASTER DATA
    ========================= */

    const [products, setProducts] = useState<
        DataProduct[]
    >([]);

    const [productTypes, setProductTypes] =
        useState<ProductTypeInterface[]>([]);

    const [categories, setCategories] =
        useState<CategoryInterface[]>([]);

    const [subCategories, setSubCategories] =
        useState<SubCategoryInterface[]>([]);

    const [sales, setSales] =
        useState<SaleType[]>(mockSales);

    const [repairs, setRepairs] =
        useState<RepairType[]>(mockRepairs);

    const [brands, setBrands] =
        useState<BrandInterface[]>([]);

    const [branches] =
        useState<Branch[]>(mockBranches);

    const [stockTransfers, setStockTransfers] =
        useState<StockTransferType[]>(
            mockStockTransfers
        );

    /* =========================
       SALE HANDLER
    ========================= */

    const handleSale = useCallback(
        async (sale: SaleType) => {
            try {
                const { error } =
                    await supabase.rpc(
                        'process_sale_stock',
                        {
                            p_branch_id:
                                sale.branchId,

                            p_items: sale.items.map(
                                item => ({
                                    productId:
                                        item.productId,
                                    quantity:
                                        item.quantity,
                                })
                            ),
                        }
                    );

                if (error) {
                    throw error;
                }

                setProducts(prev =>
                    prev.map(product => {
                        const soldItem =
                            sale.items.find(
                                item =>
                                    item.productId ===
                                    product.id
                            );

                        if (!soldItem) {
                            return product;
                        }

                        const updatedStock =
                            (product.stockByLocation[
                                sale.branchId
                            ] || 0) -
                            soldItem.quantity;

                        const newStockByLocation =
                            {
                                ...product.stockByLocation,
                                [sale.branchId]:
                                    updatedStock,
                            };

                        const totalStock =
                            Object.values(
                                newStockByLocation
                            ).reduce(
                                (sum, qty) =>
                                    sum + qty,
                                0
                            );

                        return {
                            ...product,
                            stockByLocation:
                                newStockByLocation,
                            status:
                                totalStock > 10
                                    ? 'In Stock'
                                    : totalStock > 0
                                    ? 'Low Stock'
                                    : 'Out of Stock',
                        };
                    })
                );
            } catch (error) {
                console.error(
                    'Failed sale processing:',
                    error
                );
            }
        },
        []
    );

    /* =========================
       PRODUCT PERSISTENCE
    ========================= */

    const handleAddProduct = useCallback(
        async (newProduct: any) => {
            const { data, error } = await supabase
                .from('products')
                .insert([{ ...newProduct, createdAt: new Date().toISOString() }])
                .select();

            if (error) {
                console.error('Add product error:', error.message);
                return;
            }

            if (data?.[0]) {
                setProducts(prev => [data[0], ...prev]);
            }
        },
        []
    );

    const handleUpdateProduct = useCallback(
        async (updatedProduct: DataProduct) => {
            const { error } = await supabase
                .from('products')
                .update({ ...updatedProduct, updatedAt: new Date().toISOString() })
                .eq('id', updatedProduct.id);

            if (error) {
                console.error('Update product error:', error.message);
                return;
            }

            setProducts(prev =>
                prev.map(item => (item.id === updatedProduct.id ? updatedProduct : item))
            );
        },
        []
    );

    const handleDeleteProduct = useCallback(async (id: string) => {
        const { error } = await supabase.from('products').delete().eq('id', id);
        if (error) {
            console.error('Delete product error:', error.message);
            return;
        }
        setProducts(prev => prev.filter(item => item.id !== id));
    }, []);

    /* =========================
       PRODUCT TYPES
    ========================= */

    const handleAddProductType =
        useCallback(
            async (
                newType: Omit<
                    ProductTypeInterface,
                    'id'
                >
            ) => {
                const { data, error } =
                    await supabase
                        .from('product_types')
                        .insert([
                            {
                                ...newType,
                                createdAt:
                                    new Date().toISOString(),
                            },
                        ])
                        .select();

                if (error) {
                    console.error(error);
                    return;
                }

                if (data?.[0]) {
                    setProductTypes(prev => [
                        ...prev,
                        data[0],
                    ]);
                }
            },
            []
        );

    const handleUpdateProductType =
        useCallback(
            async (
                updatedType: ProductTypeInterface
            ) => {
                const { error } =
                    await supabase
                        .from('product_types')
                        .update({
                            ...updatedType,
                            updatedAt:
                                new Date().toISOString(),
                        })
                        .eq('id', updatedType.id);

                if (error) {
                    console.error(error);
                    return;
                }

                setProductTypes(prev =>
                    prev.map(item =>
                        item.id === updatedType.id
                            ? updatedType
                            : item
                    )
                );
            },
            []
        );

    const handleDeleteProductType =
        useCallback(async (id: string) => {
            const { error } =
                await supabase
                    .from('product_types')
                    .delete()
                    .eq('id', id);

            if (error) {
                console.error(error);
                return;
            }

            setProductTypes(prev =>
                prev.filter(item => item.id !== id)
            );
        }, []);

    /* =========================
       CATEGORY
    ========================= */

    const handleAddCategory = useCallback(
        async (
            newCategory: Omit<
                CategoryInterface,
                'id'
            >
        ) => {
            const { data, error } =
                await supabase
                    .from('categories')
                    .insert([
                        {
                            ...newCategory,
                            createdAt:
                                new Date().toISOString(),
                        },
                    ])
                    .select();

            if (error) {
                console.error(error);
                return;
            }

            if (data?.[0]) {
                setCategories(prev => [
                    ...prev,
                    data[0],
                ]);
            }
        },
        []
    );

    const handleUpdateCategory =
        useCallback(
            async (
                updatedCategory: CategoryInterface
            ) => {
                const { error } =
                    await supabase
                        .from('categories')
                        .update({
                            ...updatedCategory,
                            updatedAt:
                                new Date().toISOString(),
                        })
                        .eq(
                            'id',
                            updatedCategory.id
                        );

                if (error) {
                    console.error(error);
                    return;
                }

                setCategories(prev =>
                    prev.map(item =>
                        item.id ===
                        updatedCategory.id
                            ? updatedCategory
                            : item
                    )
                );
            },
            []
        );

    const handleDeleteCategory =
        useCallback(async (id: string) => {
            const { error } =
                await supabase
                    .from('categories')
                    .delete()
                    .eq('id', id);

            if (error) {
                console.error(error);
                return;
            }

            setCategories(prev =>
                prev.filter(item => item.id !== id)
            );
        }, []);

    /* =========================
       SUB CATEGORY
    ========================= */

    const handleAddSubCategory =
        useCallback(
            async (
                newSubCategory: Omit<
                    SubCategoryInterface,
                    'id'
                >
            ) => {
                const { data, error } =
                    await supabase
                        .from('sub_categories')
                        .insert([
                            {
                                ...newSubCategory,
                                createdAt:
                                    new Date().toISOString(),
                            },
                        ])
                        .select();

                if (error) {
                    console.error(error);
                    return;
                }

                if (data?.[0]) {
                    setSubCategories(prev => [
                        ...prev,
                        data[0],
                    ]);
                }
            },
            []
        );

    const handleUpdateSubCategory =
        useCallback(
            async (
                updatedSubCategory: SubCategoryInterface
            ) => {
                const { error } =
                    await supabase
                        .from('sub_categories')
                        .update({
                            ...updatedSubCategory,
                            updatedAt:
                                new Date().toISOString(),
                        })
                        .eq(
                            'id',
                            updatedSubCategory.id
                        );

                if (error) {
                    console.error(error);
                    return;
                }

                setSubCategories(prev =>
                    prev.map(item =>
                        item.id ===
                        updatedSubCategory.id
                            ? updatedSubCategory
                            : item
                    )
                );
            },
            []
        );

    const handleDeleteSubCategory =
        useCallback(async (id: string) => {
            const { error } =
                await supabase
                    .from('sub_categories')
                    .delete()
                    .eq('id', id);

            if (error) {
                console.error(error);
                return;
            }

            setSubCategories(prev =>
                prev.filter(item => item.id !== id)
            );
        }, []);

    /* =========================
       BRAND
    ========================= */

    const handleAddBrand = useCallback(
        async (
            newBrand: Omit<
                Brand,
                'id' | 'createdAt' | 'updatedAt'
            >
        ) => {
            const { data, error } =
                await supabase
                    .from('brands')
                    .insert([
                        {
                            ...newBrand,
                            createdAt:
                                new Date().toISOString(),
                        },
                    ])
                    .select();

            if (error) {
                console.error(error);
                return;
            }

            if (data?.[0]) {
                setBrands(prev => [
                    ...prev,
                    data[0],
                ]);
            }
        },
        []
    );

    const handleUpdateBrand = useCallback(
        async (updatedBrand: Brand) => {
            const { error } =
                await supabase
                    .from('brands')
                    .update({
                        ...updatedBrand,
                        updatedAt:
                            new Date().toISOString(),
                    })
                    .eq('id', updatedBrand.id);

            if (error) {
                console.error(error);
                return;
            }

            setBrands(prev =>
                prev.map(item =>
                    item.id === updatedBrand.id
                        ? updatedBrand
                        : item
                )
            );
        },
        []
    );

    const handleDeleteBrand = useCallback(
        async (id: string) => {
            const { error } =
                await supabase.from('brands').delete().eq('id', id);

            if (error) {
                console.error(error);
                return;
            }

            setBrands(prev => prev.filter(item => item.id !== id));
        },
        []
    );

    /* =========================
       INITIAL FETCH
    ========================= */

    useEffect(() => {
    const fetchInitialData = async () => {
        try {
            const [
                brandsRes,
                productsRes,
                productTypesRes,
                categoriesRes,
                subCategoriesRes,
                salesRes,
                repairsRes,
            ] = await Promise.all([
                supabase.from('brands').select('*'),
                supabase.from('products').select('*'),
                supabase.from('product_types').select('*'),
                supabase.from('categories').select('*'),
                supabase.from('sub_categories').select('*'),
                supabase.from('sales').select('*'),
                supabase.from('repairs').select('*'),
            ]);

            if (brandsRes.data) {
                setBrands(brandsRes.data as Brand[]);
            }

            if (productsRes.data) {
                setProducts(productsRes.data as DataProduct[]);
            }

            if (productTypesRes.data) {
                setProductTypes(
                    productTypesRes.data as ProductTypeInterface[]
                );
            }

            if (categoriesRes.data) {
                setCategories(
                    categoriesRes.data as CategoryInterface[]
                );
            }

            if (subCategoriesRes.data) {
                setSubCategories(
                    subCategoriesRes.data as SubCategoryInterface[]
                );
            }

            if (salesRes.data) {
                setSales(salesRes.data as SaleType[]);
            }

            if (repairsRes.data) {
                setRepairs(repairsRes.data as RepairType[]);
            }
        } catch (error) {
            console.error('Failed to fetch initial data:', error);
        }
    };

    fetchInitialData();
}, []);

    /* =========================
       CURRENT PAGE
    ========================= */

    const CurrentPageComponent =
        useMemo(
            () =>
                pageComponents[currentPage] ||
                Dashboard,
            [currentPage]
        );

    /* =========================
       PAGE PROPS
    ========================= */

    const pageProps: Partial<
        Record<Page, object>
    > = {
        [Page.ProductType]: {
            productTypes,
            onAdd: handleAddProductType,
            onUpdate:
                handleUpdateProductType,
            onDelete:
                handleDeleteProductType,
        },

        [Page.Category]: {
            categories,
            productTypes,
            onAdd: handleAddCategory,
            onUpdate:
                handleUpdateCategory,
            onDelete:
                handleDeleteCategory,
        },

        [Page.SubCategory]: {
            subCategories,
            categories,
            onAdd:
                handleAddSubCategory,
            onUpdate:
                handleUpdateSubCategory,
            onDelete:
                handleDeleteSubCategory,
        },

        [Page.Brand]: {
            brands,
            onAdd: handleAddBrand,
            onUpdate: handleUpdateBrand,
            onDelete: handleDeleteBrand,
        },

        [Page.Product]: {
            products,
            setProducts,
            branches,
            allProductTypes:
                productTypes,
            allCategories:
                categories,
            allBrands: brands, // Pass brands to Product
            allSubCategories:
                subCategories,
        },

        [Page.Inventory]: {
            products,
            setProducts,
            branches,
        },

        [Page.PurchaseOrder]: {
            products,
        },

        [Page.Purchase]: {
            products,
            setProducts,
            branches,
        },

        [Page.Sale]: {
            products,
            setProducts,
            branches,
            onSaleComplete:
                handleSale,
        },

        [Page.StockTransfer]: {
            products,
            setProducts,
            branches,
            stockTransfers,
            setStockTransfers,
        },

        [Page.RepairCenter]: {
            products,
            setProducts,
            branches,
            onNavigate:
                setCurrentPage,
        },
    };

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
            <Sidebar
                currentPage={currentPage}
                setCurrentPage={
                    setCurrentPage
                }
                isOpen={isSidebarOpen}
                setIsOpen={setSidebarOpen}
            />

            <div className="flex flex-1 flex-col overflow-hidden">
                <Header
                    currentPage={
                        currentPage
                    }
                    toggleSidebar={() =>
                        setSidebarOpen(
                            !isSidebarOpen
                        )
                    }
                />

                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 dark:bg-gray-800 p-4 sm:p-6">
                    <CurrentPageComponent
                        {...(pageProps[
                            currentPage
                        ] || {})}
                    />
                </main>
            </div>
        </div>
    );
};

export default App;