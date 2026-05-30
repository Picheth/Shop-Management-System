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
    ProductVariant,
    MasterAttribute,
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
import ProductAttributes from './components/settings/ProductAttribute';
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
    [Page.ProductAttributes]: ProductAttributes,
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
    [Page.Inventory]: Inventory,
    [Page.BranchLocation]: BranchLocation,
    [Page.StockTransfer]: StockTransfer,

    [Page.Staff]: Staff,
    [Page.Payroll]: Payroll,
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

    const [variants, setVariants] =
        useState<ProductVariant[]>([]);

    const [subCategories, setSubCategories] =
        useState<SubCategoryInterface[]>([]);

    const [sales, setSales] =
        useState<SaleType[]>(mockSales);

    const [repairs, setRepairs] =
        useState<RepairType[]>(mockRepairs);

    const [brands, setBrands] =
        useState<BrandInterface[]>([]);

    /* New Master Attribute States */
    const [processors, setProcessors] = useState<MasterAttribute[]>([]);
    const [rams, setRams] = useState<MasterAttribute[]>([]);
    const [storages, setStorages] = useState<MasterAttribute[]>([]);
    const [colors, setColors] = useState<MasterAttribute[]>([]);
    const [regions, setRegions] = useState<MasterAttribute[]>([]);
    const [conditions, setConditions] = useState<MasterAttribute[]>([]);

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
        async (formData: any) => {
            try {
                // Call the atomic RPC function
                const { data, error } = await supabase.rpc('create_product_with_variant', {
                    p_name: formData.name,
                    p_brand_id: formData.brandId,
                    p_type_id: formData.typeId,
                    p_category_id: formData.categoryId,
                    p_sub_category_id: formData.subCategoryId || null,
                    p_model: formData.model || null,
                    p_display_size: formData.displaySize || null,
                    p_sku: formData.sku,
                    p_stock: Number(formData.initialStock),
                    p_cost_price: Number(formData.costPrice),
                    p_sale_price: Number(formData.salePrice),
                    p_storage_id: formData.storageId || null,
                    p_ram_id: formData.ramId || null,
                    p_color_id: formData.colorId || null,
                    p_condition_id: formData.conditionId || null,
                    p_description: formData.description || null,
                    p_has_serial_number: !!formData.hasSerialNumber,
                    p_has_imei: !!formData.hasIMEI,
                    p_image_url: formData.imageUrl || null,
                    p_attributes: formData.attributes || [],
                    p_is_active: formData.isActive ?? true
                });

                if (error) throw error;

                // Construct local state object from the returned JSON
                const newProductEntry: DataProduct = {
                    ...data,
                    stockByLocation: formData.stockByLocation,
                    status: formData.status || 'In Stock',
                    hasSerialNumber: formData.hasSerialNumber,
                    hasIMEI: formData.hasIMEI,
                    imageUrl: formData.imageUrl,
                    description: formData.description,
                    attributes: formData.attributes
                } as DataProduct;

                setProducts(prev => [newProductEntry, ...prev]);

            } catch (error: any) {
                console.error('Failed to add product spec/variant:', error.message);
                alert('Save failed: ' + error.message);
            }
        },
        []
    );

    const handleUpdateProduct = useCallback(
        async (updatedProduct: DataProduct) => {
            try {
                // Use the isActive field directly instead of deriving it from stock status
                const isActive = updatedProduct.isActive ?? true;

                const { data, error } = await supabase.rpc('update_product_spec_and_variant', {
                    p_variant_id: updatedProduct.id,
                    p_spec_id: updatedProduct.productSpecId,
                    p_name: updatedProduct.name,
                    p_brand_id: updatedProduct.brandId,
                    p_type_id: updatedProduct.typeId,
                    p_category_id: updatedProduct.categoryId,
                    p_sub_category_id: updatedProduct.subCategoryId || null,
                    p_model: updatedProduct.model || null,
                    p_display_size: updatedProduct.displaySize || null,
                    p_sku: updatedProduct.sku,
                    p_stock_quantity: Number(updatedProduct.stockQuantity), // Assuming stockQuantity is the source of truth
                    p_cost_price: Number(updatedProduct.costPrice),
                    p_sale_price: Number(updatedProduct.salePrice),
                    p_processor_id: updatedProduct.processorId || null,
                    p_ram_id: updatedProduct.ramId || null,
                    p_storage_id: updatedProduct.storageId || null,
                    p_color_id: updatedProduct.colorId || null,
                    p_region_id: updatedProduct.regionId || null,
                    p_condition_id: updatedProduct.conditionId || null,
                    p_is_active: isActive,
                    p_description: updatedProduct.description || null,
                    p_has_serial_number: !!updatedProduct.hasSerialNumber,
                    p_has_imei: !!updatedProduct.hasIMEI,
                    p_image_url: updatedProduct.imageUrl || null,
                    p_attributes: updatedProduct.attributes || []
                });

                if (error) throw error;

                // Merge the updated data from RPC with existing client-side fields
                const mergedProduct: DataProduct = {
                    ...updatedProduct, // Preserve client-side fields like stockByLocation, resolved names
                    ...data, // Overwrite with fresh data from DB
                    // Ensure stockQuantity is correctly set from the RPC response
                    stockQuantity: data.stockQuantity,
                    // Re-derive status if needed, or ensure RPC returns a compatible status
                    status: isActive ? (data.stockQuantity > 0 ? 'In Stock' : 'Out of Stock') : 'Out of Stock',
                } as DataProduct;

                setProducts(prev =>
                    prev.map(item => (item.id === mergedProduct.id ? mergedProduct : item))
                );
            } catch (error: any) {
                console.error('Update product error:', error.message);
                alert('Update failed: ' + error.message);
            }
        },
        []
    );

    const handleDeleteProduct = useCallback(async (specId: string) => {
        try {
            const { error } = await supabase.rpc('delete_product_spec_cascade', {
                p_spec_id: specId
            });

            if (error) throw error;

            // Filter out all variants that belong to this specification
            setProducts(prev => prev.filter(item => item.productSpecId !== specId));
        } catch (error: any) {
            console.error('Delete product spec error:', error.message);
            alert('Delete failed: ' + error.message);
        }
    }, []);

    const handleDeleteVariant = useCallback(async (variantId: string) => {
        try {
            const { error } = await supabase.rpc('delete_specific_variant', {
                p_variant_id: variantId
            });

            if (error) throw error;

            setProducts(prev => prev.filter(item => item.id !== variantId));
        } catch (error: any) {
            console.error('Delete variant error:', error.message);
            alert('Delete failed: ' + error.message);
        }
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
                    return data[0];
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
                BrandInterface,
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
                    return data[0];
            }
        },
        []
    );

    const handleUpdateBrand = useCallback(
        async (updatedBrand: BrandInterface) => {
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
                variantsRes,
                processorsRes,
                ramsRes,
                storagesRes,
                colorsRes,
                regionsRes,
                conditionsRes,
            ] = await Promise.all([
                supabase.from('brands').select('*'),
                supabase.from('products').select('*'),
                supabase.from('product_types').select('*'),
                supabase.from('categories').select('*'),
                supabase.from('sub_categories').select('*'),
                supabase.from('sales').select('*'),
                supabase.from('repairs').select('*'),
                supabase.from('product_variants').select('*').order('createdAt', { ascending: false }),
                supabase.from('processors').select('*'),
                supabase.from('rams').select('*'),
                supabase.from('storages').select('*'),
                supabase.from('colors').select('*'),
                supabase.from('regions').select('*'),
                supabase.from('conditions').select('*'),
            ]);

            if (brandsRes.data) {
                setBrands(brandsRes.data as BrandInterface[]);
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

            if (variantsRes.data) {
                setVariants(variantsRes.data as ProductVariant[]);
            }

            /* Set Master Attributes */
            if (processorsRes.data) setProcessors(processorsRes.data);
            if (ramsRes.data) setRams(ramsRes.data);
            if (storagesRes.data) setStorages(storagesRes.data);
            if (colorsRes.data) setColors(colorsRes.data);
            if (regionsRes.data) setRegions(regionsRes.data);
            if (conditionsRes.data) setConditions(conditionsRes.data);

        } catch (error) {
            console.error('Failed to fetch initial data:', error);
        }
    };

    fetchInitialData();
}, []);

    const handleAddVariant = useCallback(async (newVar: any) => {
        const { data, error } = await supabase.from('product_variants').insert([{ ...newVar, createdAt: new Date().toISOString() }]).select();
        if (error) console.error(error);
        if (data?.[0]) setVariants(prev => [data[0], ...prev]);
    }, []);

    const handleBulkAddVariants = useCallback(async (newVariants: any[]) => {
        const { data, error } = await supabase.rpc('create_product_variants_bulk', {
            p_variants: newVariants
        });

        if (error) {
            console.error('Bulk variant creation failed:', error.message);
            throw error;
        }

        if (data) setVariants(prev => [...data, ...prev]);
    }, []);

    const handleUpdateVariant = useCallback(async (updatedVar: ProductVariant) => {
        const { error } = await supabase.from('product_variants').update({ ...updatedVar, updatedAt: new Date().toISOString() }).eq('id', updatedVar.id);
        if (error) console.error(error);
        else setVariants(prev => prev.map(v => v.id === updatedVar.id ? updatedVar : v));
    }, []);

    const handleDeleteVariantGlobal = useCallback(async (id: string) => {
        try {
            const { error } = await supabase.rpc('delete_specific_variant', {
                p_variant_id: id
            });
            if (error) throw error;
            setVariants(prev => prev.filter(v => v.id !== id));
        } catch (error: any) {
            console.error('Delete variant error:', error.message);
        }
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
        [Page.ProductAttributes]: {
            productTypes,
            categories,
            subCategories,
            brands,
            variants,
            products,
            onAddVariant: handleAddVariant,
            onBulkAddVariants: handleBulkAddVariants,
            onUpdateVariant: handleUpdateVariant,
            onDeleteVariant: handleDeleteVariantGlobal,
            onUpdateProductType: handleUpdateProductType,
            onDeleteProductType: handleDeleteProductType,
            onAddCategory: handleAddCategory,
            onUpdateCategory: handleUpdateCategory,
            onDeleteCategory: handleDeleteCategory,
            onAddSubCategory: handleAddSubCategory,
            onUpdateSubCategory: handleUpdateSubCategory,
            onDeleteSubCategory: handleDeleteSubCategory,
            onAddBrand: handleAddBrand,
            onUpdateBrand: handleUpdateBrand,
            onDeleteBrand: handleDeleteBrand,
            processors,
            rams,
            storages,
            colors,
            regions,
            conditions,
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
            onAddBrand: handleAddBrand,
            onAddCategory: handleAddCategory,
            onDeleteVariant: handleDeleteVariant,
            allSubCategories:
                subCategories,
            /* Pass new master tables to components */
            processors,
            rams,
            storages,
            colors,
            regions,
            conditions,
            onAdd: handleAddProduct,
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