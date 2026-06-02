import React, {
    useState,
    useEffect,
    useMemo,
    useCallback,
    useRef,
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
    ToastType,
    MasterAttribute,
    ErrorLog,
} from './types';

import { mockBranches, mockStockTransfers, mockSales, mockRepairs } from './data';
import { supabase } from './utils/supabase';
import ConfirmationModal from './components/ui/ConfirmationModal';

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
import ErrorDashboard from './components/reports/ErrorDashboard';

/* =========================
   SETTINGS
========================= */

import ChartOfAccount from './components/settings/ChartOfAccount';
import Supplier from './components/settings/Supplier';
import Contact from './components/settings/Contact';
import ExpenseCategory from './components/settings/ExpenseCategory';
import CompanySettings from './components/settings/CompanySettings';

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
    [Page.ErrorDashboard]: ErrorDashboard,

    [Page.ChartOfAccount]: ChartOfAccount,
    [Page.Supplier]: Supplier,
    [Page.Contact]: Contact,
    [Page.ExpenseCategory]: ExpenseCategory,
    [Page.Inventory]: Inventory,
    [Page.BranchLocation]: BranchLocation,
    [Page.StockTransfer]: StockTransfer,
    [Page.CompanySettings]: CompanySettings, // Assuming Page.CompanySettings exists in Page enum

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

    const [isGlobalLoading, setIsGlobalLoading] =
        useState(false);

    const [initialSearchTerm, setInitialSearchTerm] =
        useState('');

    const [companyLogoUrl, setCompanyLogoUrl] = useState(
        "https://via.placeholder.com/150x50?text=Your+Logo"
    );
    const [companyName, setCompanyName] = useState("");
    const [address, setAddress] = useState("");
    const [signatureUrl, setSignatureUrl] = useState("");

    const [toasts, setToasts] = useState<Array<{ id: string; message: string; type: ToastType; isVisible: boolean }>>([]);
    const toastTimers = useRef<Map<string, { exitId: any; removeId: any; remaining: number; start: number }>>(new Map());
    const TOAST_DURATION = 3000;
    const EXIT_OFFSET = 300;

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

    const [productToUpdate, setProductToUpdate] =
        useState<DataProduct | null>(null);

    const [pendingSale, setPendingSale] =
        useState<SaleType | null>(null);

    const [pendingStockTransfer, setPendingStockTransfer] =
        useState<StockTransferType | null>(null);
    
    const [pendingTransfersCount, setPendingTransfersCount] =
        useState(0);

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

    const [errorLogs, setErrorLogs] = useState<ErrorLog[]>([]);
    const [showClearLogsConfirm, setShowClearLogsConfirm] =
        useState(false);

    const [branches] =
        useState<Branch[]>(mockBranches);

    const [stockTransfers, setStockTransfers] =
        useState<StockTransferType[]>(
            mockStockTransfers
        );

    /* =========================
       ROUTING HANDLER (URL PARAMS)
    ========================= */

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const pageParam = params.get('page');
        const searchParam = params.get('search');
        const idParam = params.get('id');

        if (pageParam && Object.values(Page).includes(pageParam as any)) {
            setCurrentPage(pageParam as Page);
        }

        if (searchParam || idParam) {
            setInitialSearchTerm(searchParam || idParam || '');
        }

        // Clean up URL to prevent unwanted re-routing on manual page refreshes later
        if (pageParam || searchParam || idParam) {
            window.history.replaceState({}, '', window.location.pathname);
        }
    }, []);

    /* =========================
       TOAST HANDLER
    ========================= */

    const clearToastTimers = (id: string) => {
        const timer = toastTimers.current.get(id);
        if (timer) {
            clearTimeout(timer.exitId);
            clearTimeout(timer.removeId);
        }
    };

    const startToastTimers = useCallback((id: string, duration: number) => {
        clearToastTimers(id);

        const exitId = setTimeout(() => {
            setToasts(prev => prev.map(t => t.id === id ? { ...t, isVisible: false } : t));
        }, Math.max(0, duration - EXIT_OFFSET));

        const removeId = setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
            toastTimers.current.delete(id);
        }, duration);

        toastTimers.current.set(id, { exitId, removeId, remaining: duration, start: Date.now() });
    }, []);

    const fetchPendingTransfersCount = useCallback(async () => {
        const { count, error } = await supabase
            .from('stock_transfers')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'Pending');
        if (!error && count !== null) setPendingTransfersCount(count);
    }, []);

    const showToast = useCallback((message: string, type: ToastType = 'info') => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts(prev => [...prev, { id, message, type, isVisible: true }]);
        startToastTimers(id, TOAST_DURATION);
    }, [startToastTimers]);

    const handleToastMouseEnter = (id: string) => {
        const timer = toastTimers.current.get(id);
        if (timer) {
            const elapsed = Date.now() - timer.start;
            timer.remaining = Math.max(0, timer.remaining - elapsed);
            clearToastTimers(id);
        }
    };

    const handleToastMouseLeave = (id: string) => {
        const timer = toastTimers.current.get(id);
        if (timer && timer.remaining > 0) {
            startToastTimers(id, timer.remaining);
        }
    };

    const handleCopy = useCallback((text: string) => {
        navigator.clipboard.writeText(text);
        showToast('Message copied to clipboard', 'info');
    }, [showToast]);

    const handleUpdateSignature = useCallback(async (file: File) => {
        setIsGlobalLoading(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `authorized-signature-${Date.now()}.${fileExt}`;
            const filePath = `branding/${fileName}`;

            // 1. Upload to Supabase Storage (Bucket name: 'settings')
            const { error: uploadError } = await supabase.storage
                .from('settings')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            // 2. Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('settings')
                .getPublicUrl(filePath);

            // 3. Update state
            setSignatureUrl(publicUrl);
            
            // 4. Persist to database
            const { error: dbError } = await supabase
                .from('settings')
                .update({ signature_url: publicUrl })
                .eq('id', 1);

            if (dbError) throw dbError;

            showToast('Signature updated successfully', 'success');
        } catch (error: any) {
            showToast(`Upload failed: ${error.message}`, 'error');
        } finally {
            setIsGlobalLoading(false);
        }
    }, [showToast]);

    /* =========================
       ERROR LOG HANDLERS
    ========================= */

    const fetchErrorLogs = useCallback(async () => {
        const { data, error } = await supabase
            .from('error_logs')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (!error && data) {
            setErrorLogs(data as ErrorLog[]);
        }
    }, []);

    const handleDeleteLog = useCallback(async (id: string) => {
        setIsGlobalLoading(true);
        try {
            const { error } = await supabase.from('error_logs').delete().eq('id', id);
            if (error) throw error;
            setErrorLogs(prev => prev.filter(log => log.id !== id));
            showToast('Log entry deleted', 'success');
        } finally {
            setIsGlobalLoading(false);
        }
    }, [showToast]);

    const confirmClearAllLogs = useCallback(async () => {
        setShowClearLogsConfirm(false);
        setIsGlobalLoading(true);
        try {
            // Delete all entries from error_logs
            const { error } = await supabase
                .from('error_logs')
                .delete()
                .neq('id', '00000000-0000-0000-0000-000000000000');

            if (error) throw error;
            setErrorLogs([]);
            showToast('All system logs have been cleared', 'success');
        } catch (error: any) {
            console.error('Clear logs error:', error.message);
            showToast('Failed to clear logs: ' + error.message, 'error');
        } finally {
            setIsGlobalLoading(false);
        }
    }, [showToast]);

    /* =========================
       LOGO HANDLER
    ========================= */

    const handleUpdateLogo = useCallback(async (file: File) => {
        setIsGlobalLoading(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `company-logo-${Date.now()}.${fileExt}`;
            const filePath = `branding/${fileName}`;

            // 1. Upload to Supabase Storage (Bucket name: 'settings')
            const { error: uploadError } = await supabase.storage
                .from('settings')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            // 2. Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('settings')
                .getPublicUrl(filePath);

            // 3. Update state
            setCompanyLogoUrl(publicUrl);
            
            // 4. Persist to database
            const { error: dbError } = await supabase
                .from('settings')
                .update({ company_logo_url: publicUrl })
                .eq('id', 1);

            if (dbError) throw dbError;

            showToast('Company logo updated successfully', 'success');
        } catch (error: any) {
            console.error('Logo upload error:', error.message);
            showToast(`Upload failed: ${error.message}`, 'error');
        } finally {
            setIsGlobalLoading(false);
        }
    }, [showToast]);

    const handleUpdateCompanyInfo = useCallback(async (name: string, addr: string) => {
        setIsGlobalLoading(true);
        try {
            const { error } = await supabase
                .from('settings')
                .update({ 
                    company_name: name,
                    address: addr 
                })
                .eq('id', 1);

            if (error) throw error;
            setCompanyName(name);
            setAddress(addr);
            showToast('Company information updated successfully', 'success');
        } catch (error: any) {
            showToast(`Update failed: ${error.message}`, 'error');
        } finally {
            setIsGlobalLoading(false);
        }
    }, [showToast]);

    /* =========================
       SALE HANDLER
    ========================= */

    const confirmSale = useCallback(
        async () => {
            if (!pendingSale) return;
            const sale = pendingSale;
            setPendingSale(null);
            setIsGlobalLoading(true);
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
                showToast('Sale processed and stock updated', 'success');
            } catch (error: any) {
                console.error(
                    'Failed sale processing:',
                    error
                );
                showToast(`Sale failed: ${error.message}`, 'error');
            } finally {
                setIsGlobalLoading(false);
            }
        },
        [pendingSale, showToast]
    );

    const handleSale = useCallback(
        (sale: SaleType) => {
            setPendingSale(sale);
        },
        []
    );

    /* =========================
       STOCK TRANSFER HANDLER
    ========================= */

    const confirmStockTransfer = useCallback(async () => {
        if (!pendingStockTransfer) return;
        const transfer = pendingStockTransfer;
        setPendingStockTransfer(null);
        setIsGlobalLoading(true);

        try {
            // 1. Record the transfer in Supabase
            const { error: transferError } = await supabase
                .from('stock_transfers')
                .insert([{
                    ...transfer,
                    createdAt: new Date().toISOString()
                }]);

            if (transferError) throw transferError;

            // 2. Update local product state only if the transfer is being saved as 'Completed' (Bulk Support)
            if (transfer.status === 'Completed') {
                setProducts(prev => prev.map(product => {
                    const item = transfer.items.find(i => i.productId === product.id);
                    if (!item) return product;

                    const newStockByLocation = { ...product.stockByLocation };
                    
                    // Deduct from source
                    newStockByLocation[transfer.fromBranchId] = 
                        (newStockByLocation[transfer.fromBranchId] || 0) - item.quantity;
                    
                    // Add to destination
                    newStockByLocation[transfer.toBranchId] = 
                        (newStockByLocation[transfer.toBranchId] || 0) + item.quantity;

                    return {
                        ...product,
                        stockByLocation: newStockByLocation
                    };
                }));
            }

            // 3. Update local transfers list
            setStockTransfers(prev => [transfer, ...prev]);
            
            showToast(transfer.status === 'Pending' ? 'Stock transfer request created' : 'Stock transfer successful', 'success');
            fetchPendingTransfersCount(); // Re-fetch count after new transfer
        } catch (error: any) {
            console.error('Transfer failed:', error.message);
            showToast(`Transfer failed: ${error.message}`, 'error');
        } finally {
            setIsGlobalLoading(false);
        }
    }, [pendingStockTransfer, showToast, branches, fetchPendingTransfersCount]);

    const handleStockTransfer = useCallback(
        (transfer: StockTransferType) => {
            setPendingStockTransfer(transfer);
        },
        []
    );

    const handleCancelStockTransfer = useCallback(async (transfer: StockTransferType) => {
        if (!window.confirm('Are you sure you want to cancel this transfer?')) return;

        setIsGlobalLoading(true);
        try {
            // 1. Reverse stock changes if the transfer was already 'Completed'
            if (transfer.status === 'Completed') {
                setProducts(prev => prev.map(product => {
                    const item = transfer.items.find(i => i.productId === product.id);
                    if (!item) return product;

                    const newStockByLocation = { ...product.stockByLocation };
                    
                    // Add back to source
                    newStockByLocation[transfer.fromBranchId] = 
                        (newStockByLocation[transfer.fromBranchId] || 0) + item.quantity;
                    
                    // Deduct from destination
                    newStockByLocation[transfer.toBranchId] = 
                        (newStockByLocation[transfer.toBranchId] || 0) - item.quantity;

                    return {
                        ...product,
                        stockByLocation: newStockByLocation
                    };
                }));
            }

            // 2. Update status in Supabase
            const { error } = await supabase
                .from('stock_transfers')
                .update({ status: 'Cancelled' })
                .eq('id', transfer.id);

            if (error) throw error;

            // 3. Update local state
            setStockTransfers(prev => 
                prev.map(t => t.id === transfer.id ? { ...t, status: 'Cancelled' } : t)
            );
            
            showToast('Stock transfer cancelled successfully', 'success');
            fetchPendingTransfersCount(); // Re-fetch count after cancellation
        } catch (error: any) {
            console.error('Cancel transfer failed:', error.message);
            showToast(`Cancel failed: ${error.message}`, 'error');
        } finally {
            setIsGlobalLoading(false);
        }
    }, [showToast, fetchPendingTransfersCount]);

    const handleConfirmStockTransfer = useCallback(async (transfer: StockTransferType) => {
        if (!window.confirm('Confirm and process this stock movement?')) return;

        setIsGlobalLoading(true);
        try {
            // Check stock for all items in the transfer
            for (const item of transfer.items) {
                const productInQuestion = products.find(p => p.id === item.productId);
                const currentSourceStock = productInQuestion?.stockByLocation[transfer.fromBranchId] || 0;

                if (currentSourceStock < item.quantity) {
                    throw new Error(`Insufficient stock for ${productInQuestion?.name || 'Product'}. Available: ${currentSourceStock}`);
                }
            }

            // If stock is sufficient, proceed with confirmation

            // 1. Update status in Supabase
            const { error } = await supabase
                .from('stock_transfers')
                .update({ status: 'Completed' })
                .eq('id', transfer.id);

            if (error) throw error;

            // 2. Perform stock movement in local state
            setProducts(prev => prev.map(product => {
                const item = transfer.items.find(i => i.productId === product.id);
                if (!item) return product;

                const newStockByLocation = { ...product.stockByLocation };
                
                // Deduct from source
                newStockByLocation[transfer.fromBranchId] = 
                    (newStockByLocation[transfer.fromBranchId] || 0) - item.quantity;
                
                // Add to destination
                newStockByLocation[transfer.toBranchId] = 
                    (newStockByLocation[transfer.toBranchId] || 0) + item.quantity;

                return {
                    ...product,
                    stockByLocation: newStockByLocation
                };
            }));

            // 3. Update local transfers list status
            setStockTransfers(prev => 
                prev.map(t => t.id === transfer.id ? { ...t, status: 'Completed' } : t)
            );
            
            showToast('Transfer confirmed and inventory updated', 'success');
            fetchPendingTransfersCount(); // Re-fetch count after confirmation
        } catch (error: any) {
            console.error('Confirmation failed:', error.message);
            showToast(`Confirmation failed: ${error.message}`, 'error');
        } finally {
            setIsGlobalLoading(false);
        }
    }, [showToast, products, fetchPendingTransfersCount]);

    /* =========================
       PRODUCT PERSISTENCE
    ========================= */

    const handleAddProduct = useCallback(
        async (formData: any) => {
            setIsGlobalLoading(true);
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
                showToast('Product added successfully', 'success');

            } catch (error: any) {
                console.error('Failed to add product spec/variant:', error.message);
                showToast(`Save failed: ${error.message}`, 'error');
            } finally {
                setIsGlobalLoading(false);
            }
        },
        [showToast]
    );

    const confirmUpdateProduct = useCallback(
        async () => {
            if (!productToUpdate) return;
            const updatedProduct = productToUpdate;
            setProductToUpdate(null);
            setIsGlobalLoading(true);
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
                showToast('Product updated successfully', 'success');
            } catch (error: any) {
                console.error('Update product error:', error.message);
                showToast('Update failed: ' + error.message, 'error');
            } finally {
                setIsGlobalLoading(false);
            }
        },
        [productToUpdate, showToast]
    );

    const handleUpdateProduct = useCallback(
        (updatedProduct: DataProduct) => {
            setProductToUpdate(updatedProduct);
        },
        []
    );

    const handleDeleteProduct = useCallback(async (specId: string) => {
        setIsGlobalLoading(true);
        try {
            const { error } = await supabase.rpc('delete_product_spec_cascade', {
                p_spec_id: specId
            });

            if (error) throw error;

            // Filter out all variants that belong to this specification
            setProducts(prev => prev.filter(item => item.productSpecId !== specId));
            showToast('Product and all its variants deleted successfully', 'success');
        } catch (error: any) {
            console.error('Delete product spec error:', error.message);
            showToast('Delete failed: ' + error.message, 'error');
        } finally {
            setIsGlobalLoading(false);
        }
    }, [showToast]);

    const handleDeleteVariant = useCallback(async (variantId: string) => {
        setIsGlobalLoading(true);
        try {
            const { error } = await supabase.rpc('delete_specific_variant', {
                p_variant_id: variantId
            });

            if (error) throw error;

            setProducts(prev => prev.filter(item => item.id !== variantId));
            showToast('Variant deleted successfully', 'success');
        } catch (error: any) {
            console.error('Delete variant error:', error.message);
            showToast('Delete failed: ' + error.message, 'error');
        } finally {
            setIsGlobalLoading(false);
        }
    }, [showToast]);

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
                settingsRes,
                errorLogsRes,
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
                supabase.from('settings').select('*').eq('id', 1).single(),
                supabase.from('error_logs').select('*').order('created_at', { ascending: false }),
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

            if (settingsRes.data) {
                // Existing settings logic
                if (settingsRes.data.company_logo_url) setCompanyLogoUrl(settingsRes.data.company_logo_url);
                if (settingsRes.data.company_name) setCompanyName(settingsRes.data.company_name);
                if (settingsRes.data.address) setAddress(settingsRes.data.address);
            }

            if (errorLogsRes.data) {
                setErrorLogs(errorLogsRes.data as ErrorLog[]);
            }

        } catch (error) {
            console.error('Failed to fetch initial data:', error);
        }
        fetchPendingTransfersCount(); // Fetch pending count after initial data
    };

    fetchInitialData();
}, [fetchPendingTransfersCount]);

    /**
     * Refreshes the product variants list from the database.
     * This uses the specific ordering requested: newest first.
     */
    const refreshVariants = useCallback(async () => {
        setIsGlobalLoading(true);
        try {
        const { data, error } = await supabase
            .from('product_variants')
            .select('*')
            .order('createdAt', { ascending: false });
        
        if (error) {
            console.error('Error fetching variants:', error.message);
            return;
        }
        
        if (data) {
            setVariants(data as ProductVariant[]);
        }
        } finally {
            setIsGlobalLoading(false);
        }
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
        setIsGlobalLoading(true);
        try {
            const { error } = await supabase.rpc('delete_specific_variant', {
                p_variant_id: id
            });
            if (error) throw error;
            setVariants(prev => prev.filter(v => v.id !== id));
            showToast('Variant deleted successfully', 'success');
        } catch (error: any) {
            console.error('Delete variant error:', error.message);
            showToast('Delete failed: ' + error.message, 'error');
        } finally {
            setIsGlobalLoading(false);
        }
    }, [showToast]);

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

    const pageProps = useMemo((): Partial<
        Record<Page, object>
    > => ({
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
            setIsGlobalLoading,
            showToast,
            refreshMasterData: refreshVariants, // Mapping refreshVariants to the expected prop
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
            onUpdate: handleUpdateProduct,
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
            branches,
            stockTransfers,
            onTransfer: handleStockTransfer,
            onCancelTransfer: handleCancelStockTransfer,
            onConfirmTransfer: handleConfirmStockTransfer,
            companyLogoUrl,
            companyName,
            address,
            initialSearchTerm,
            pendingTransfersCount, // Pass pending count to Sidebar
            signatureUrl,
            showToast,
        },

        [Page.CompanySettings]: {
            currentLogo: companyLogoUrl,
            onUpdateLogo: handleUpdateLogo,
            companyName,
            address,
            onUpdateInfo: handleUpdateCompanyInfo,
            currentSignature: signatureUrl,
            onUpdateSignature: handleUpdateSignature,
        },

        [Page.ErrorDashboard]: {
            logs: errorLogs,
            onDelete: handleDeleteLog,
            onRefresh: fetchErrorLogs,
            onClearAll: () => setShowClearLogsConfirm(true),
            showToast,
        },

        [Page.RepairCenter]: {
            products,
            setProducts,
            branches,
            onNavigate:
                setCurrentPage,
        },
    }), [
        productTypes, categories, subCategories, brands, variants, products, 
        processors, rams, storages, colors, regions, conditions,
        branches, stockTransfers, initialSearchTerm, pendingTransfersCount,
        companyLogoUrl, companyName, address, showToast, 
        handleSale, handleStockTransfer, handleCancelStockTransfer, 
        handleConfirmStockTransfer, handleAddProduct, handleUpdateProduct,
        handleDeleteProduct, handleDeleteVariant, handleAddVariant,
        handleBulkAddVariants, handleUpdateVariant, handleDeleteVariantGlobal,
        handleUpdateProductType, handleDeleteProductType, handleAddCategory,
        handleUpdateCategory, handleDeleteCategory, handleAddSubCategory,
        handleUpdateSubCategory, handleDeleteSubCategory, handleAddBrand,
        handleUpdateBrand, handleDeleteBrand, refreshVariants, handleUpdateLogo,
        handleUpdateCompanyInfo, handleUpdateSignature,
        errorLogs, handleDeleteLog, fetchErrorLogs, confirmClearAllLogs,
        signatureUrl
    ]);

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
            {isGlobalLoading && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/10 dark:bg-white/5 backdrop-blur-[1px]">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-sky-600 border-t-transparent"></div>
                </div>
            )}

            <div className="fixed bottom-4 right-4 z-[10000] flex flex-col-reverse items-end space-y-2">
                {toasts.map(t => {
                    const isCopyable = t.type === 'error' || /\[[A-Z0-9_-]+\]/.test(t.message);
                    
                    return (
                    <div
                        key={t.id}
                        onMouseEnter={() => handleToastMouseEnter(t.id)}
                        onMouseLeave={() => handleToastMouseLeave(t.id)}
                        className={`w-full max-w-sm group ${
                            t.isVisible ? 'animate-fade-in-up group-hover:[animation-play-state:paused]' : 'animate-fade-out-down'
                        }`}
                    >
                        <div className={`relative overflow-hidden flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border ${
                            t.type === 'success' 
                                ? 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/30 dark:border-green-800 dark:text-green-400' 
                                : t.type === 'error'
                                ? 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/30 dark:border-red-800 dark:text-red-400'
                                : 'bg-sky-50 border-sky-200 text-sky-800 dark:bg-sky-900/30 dark:border-sky-800 dark:text-sky-400'
                        }`}>
                            <div 
                                className={`flex-1 text-sm font-medium ${isCopyable ? 'cursor-pointer hover:opacity-80' : ''}`}
                                onClick={() => isCopyable && handleCopy(t.message)}
                                title={isCopyable ? 'Click to copy message' : undefined}
                            >
                                {t.message}
                                {isCopyable && (
                                    <span className="ml-2 inline-block opacity-40 group-hover:opacity-100 transition-opacity">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                                        </svg>
                                    </span>
                                )}
                            </div>
                            
                            <button 
                                onClick={() => setToasts(prev => prev.filter(toastItem => toastItem.id !== t.id))}
                                className="hover:opacity-70 transition-opacity"
                            >
                                ✕
                            </button>

                            {/* Progress Bar */}
                            <div 
                                className={`absolute bottom-0 left-0 h-0.5 ${
                                    t.isVisible ? 'animate-toast-progress group-hover:[animation-play-state:paused]' : 'w-0'
                                } ${
                                    t.type === 'success' ? 'bg-green-500' : t.type === 'error' ? 'bg-red-500' : 'bg-sky-500'
                                }`}
                            />
                        </div>
                    </div>
                );})}
            </div>

            {productToUpdate && (
                <ConfirmationModal
                    title="Confirm Product Update"
                    message={`Are you sure you want to save changes to "${productToUpdate.name}"? This will update inventory and specification details across all branches.`}
                    confirmText="Save Changes"
                    isDanger={false}
                    onConfirm={confirmUpdateProduct}
                    onCancel={() => setProductToUpdate(null)}
                />
            )}

            {pendingSale && (
                <ConfirmationModal
                    title="Confirm Sale Transaction"
                    message={`Proceed with processing this sale? This will immediately reduce stock by ${pendingSale.items.reduce((acc, item) => acc + item.quantity, 0)} unit(s) at the selected branch.`}
                    confirmText="Process Sale"
                    isDanger={false}
                    onConfirm={confirmSale}
                    onCancel={() => setPendingSale(null)}
                />
            )}

            {pendingStockTransfer && (
                <ConfirmationModal
                    title="Confirm Stock Transfer"
                    message={pendingStockTransfer.status === 'Pending' 
                        ? `Create a transfer request for ${pendingStockTransfer.quantity} unit(s) from ${
                            branches.find(b => b.id === pendingStockTransfer.fromBranchId)?.name || 'Source'
                        } to ${
                            branches.find(b => b.id === pendingStockTransfer.toBranchId)?.name || 'Destination'
                        }?`
                        : `Move ${pendingStockTransfer.quantity} unit(s) from ${
                            branches.find(b => b.id === pendingStockTransfer.fromBranchId)?.name || 'Source'
                        } to ${
                            branches.find(b => b.id === pendingStockTransfer.toBranchId)?.name || 'Destination'
                        }?`
                    }
                    confirmText={pendingStockTransfer.status === 'Pending' ? "Create Request" : "Transfer Stock"}
                    isDanger={false}
                    onConfirm={confirmStockTransfer}
                    onCancel={() => setPendingStockTransfer(null)}
                />
            )}

            {showClearLogsConfirm && (
                <ConfirmationModal
                    title="Clear All Error Logs"
                    message="Are you sure you want to permanently delete all error log entries? This action cannot be undone and will clear the system health history."
                    confirmText="Clear All Logs"
                    isDanger={true}
                    onConfirm={confirmClearAllLogs}
                    onCancel={() => setShowClearLogsConfirm(false)}
                />
            )}

            <Sidebar
                currentPage={currentPage}
                setCurrentPage={(page: Page) => {
                    setCurrentPage(page);
                    setInitialSearchTerm(''); // Clear search when user navigates manually
                }}
                pendingTransfersCount={pendingTransfersCount} // Pass to Sidebar
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