import { BaseEntity } from '../types';

export interface ProductType extends BaseEntity {
    code: string;
    name: string;
    description?: string;
    active: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface Category extends BaseEntity {
    code: string;
    type_id: string;
    name: string;
    description?: string;
    active: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface SubCategory extends BaseEntity {
    code: string;
    category_id: string;
    name: string;
    description?: string;
    active: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface Brand extends BaseEntity {
    code: string;
    name: string;
    short_name?: string;
    country?: string;
    created_at?: string;
    updated_at?: string;
}

export interface Variation extends BaseEntity {
    name: string;
    type: string;
    value: string;
    created_at?: string;
    updated_at?: string;
}

export interface ProductSpecs extends BaseEntity {
    label: string;
    value: string;
    unit?: string;
    created_at?: string;
    updated_at?: string;
    active?: boolean;
}

export interface ProductAttributeSet {
    type?: ProductType;
    category?: Category;
    subCategory?: SubCategory;
    brand?: Brand;
    variations?: Variation[];
    specs?: ProductSpecs[];
    created_at?: string;
    updated_at?: string;
    is_active?: boolean;
    id?: string;
    itemsPerPage: number;
    itemsPerPageOptions: number[];
}

export interface ProductTemplate extends ProductAttributeSet {
    template_id: string;
    name: string;
    sku_pattern?: string;
    product_code_pattern?: string;
    status: string;
    is_active?: boolean;
    created_at?: string;
    updated_at?: string;
    itemsPerPage: number;
    itemsPerPageOptions: number[];
}

export interface Product extends ProductAttributeSet {
    id: string;
    name: string;
    sku: string;
    product_ode: string;
    status: string;
    isActive?: boolean;
    created_at?: string;
    updated_at?: string;
    stock_by_location: Record<string, number>;
    serial_numbers_by_location?: Record<string, string[]>;
    stock_quantity_by_location?: Record<string, number>;
    stock?: number;
    history?: StockHistoryItem[];
    history_by_location?: Record<string, StockHistoryItem[]>;
    stock_history?: StockHistoryItem[];
    stock_history_by_location?: Record<string, StockHistoryItem[]>;
    itemsPerPage: number;
    itemsPerPageOptions: number[];
}

export interface ProductVariant extends ProductAttributeSet {
    id: string;
    name: string;
    sku: string;
    product_code: string;
    status: string;
    is_active?: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface ProductTypeSummary {
    type: ProductType;
    category_count: number;
    sub_category_count: number;
    brand_count: number;
    variation_count: number;
    spec_count: number;
}

export interface ProductSummary {
    product: Product;
    type: ProductType;
    category: Category;
    subCategory: SubCategory;
    brand: Brand;
    variations: Variation[];
    specs: ProductSpecs[];
}

export interface ProductVariantSummary {
    productVariant: ProductVariant;
    type: ProductType;
    category: Category;
    subCategory: SubCategory;
    brand: Brand;
    variations: Variation[];
    specs: ProductSpecs[];
}

export interface ProductTypeContextType {
    productTypes: ProductType[];
    categories: Category[];
    subCategories: SubCategory[];
    brands: Brand[];
    variations: Variation[];
    specs: ProductSpecs[];
    templates: ProductTemplate[];
    products: Product[];
    productVariants: ProductVariant[];
    loading: boolean;
    error: string | null;
    fetchProductTypes: () => Promise<void>;
    fetchCategories: () => Promise<void>;
    fetchSubCategories: () => Promise<void>;
    fetchBrands: () => Promise<void>;
    fetchVariations: () => Promise<void>;
    fetchSpecs: () => Promise<void>;
    fetchTemplates: () => Promise<void>;
    fetchProducts: () => Promise<void>;
    fetchProductVariants: () => Promise<void>;
}

export interface ProductContextType {
    product: Product | null;
    type: ProductType | null;
    category: Category | null;
    subCategory: SubCategory | null;
    brand: Brand | null;
    variations: Variation[];
    specs: ProductSpecs[];
    loading: boolean;
    error: string | null;
    fetchProduct: (id: string) => Promise<void>;
    fetchType: (id: string) => Promise<void>;
    fetchCategory: (id: string) => Promise<void>;
    fetchSubCategory: (id: string) => Promise<void>;
    fetchBrand: (id: string) => Promise<void>;
    fetchVariations: () => Promise<void>;
    fetchSpecs: () => Promise<void>;
}

export interface ProductVariantContextType {
    productVariant: ProductVariant | null;
    type: ProductType | null;
    category: Category | null;
    subCategory: SubCategory | null;
    brand: Brand | null;
    variations: Variation[];
    specs: ProductSpecs[];
    loading: boolean;
    error: string | null;
    fetchProductVariant: (id: string) => Promise<void>;
    fetchType: (id: string) => Promise<void>;
    fetchCategory: (id: string) => Promise<void>;
    fetchSubCategory: (id: string) => Promise<void>;
    fetchBrand: (id: string) => Promise<void>;
    fetchVariations: () => Promise<void>;
    fetchSpecs: () => Promise<void>;
}

export interface ProductTypeProviderProps {
    children: React.ReactNode;
}

export interface ProductProviderProps {
    children: React.ReactNode;
}

export interface ProductVariantProviderProps {
    children: React.ReactNode;
}

export type ProductStatus = 'In Stock' | 'Low Stock' | 'Out of Stock';

export type StockAction = 'Initial Stock' | 'Purchase' | 'Sale' | 'Adjustment' | 'Stock Adjustment' | 'Transfer In' | 'Transfer Out' | 'Repair' | 'Repair Used' | 'Repair Returned' | 'Return';

export interface StockHistoryItem {
    date: string;
    action: StockAction;
    change: number;
    newStock: number;
    branch: string;
    reason?: string;
    note?: string;
    createdBy?: string;
    createdAt?: string;
    updatedAt?: string;
    active?: boolean;
    id?: string;
    history?: StockHistoryItem[];
    itemsPerPage: number;
    itemsPerPageOptions: number[];
}

export interface Branch extends BaseEntity {
    code: string;
    name: string;
    location?: string;
    address?: string;
    phone?: string;
    email?: string;
}

export interface ProductTypeFormData {
    code: string;
    name: string;
    description?: string;
    active: boolean;
}

export interface CategoryFormData {
    code: string;
    type_id: string;
    name: string;
    description?: string;
    active: boolean;
}

export interface SubCategoryFormData {
    code: string;
    category_id: string;
    name: string;
    description?: string;
    active: boolean;
}

export interface BrandFormData {
    code: string;
    name: string;
    shortName?: string;
    country?: string;
}

export interface VariationFormData {
    name: string;
    type: string;
    value: string;
}

export interface ProductSpecsFormData {
    label: string;
    value: string;
    unit?: string;
}

export interface ProductTemplateFormData extends ProductAttributeSet {
    template_id: string;
    name: string;
    sku_pattern?: string;
    product_code_pattern?: string;
    status: string;
    is_active?: boolean;
}

export interface ProductFormData extends ProductAttributeSet {
    id: string;
    name: string;
    sku: string;
    product_code: string;
    status: string;
    is_active?: boolean;
}

export interface ProductVariantFormData extends ProductAttributeSet {
    id: string;
    name: string;
    sku: string;
    product_code: string;
    status: string;
    is_active?: boolean;
}

export interface ProductTypeEditFormData extends ProductTypeFormData {
    id: string;
    active: boolean;
    created_at?: string;
    updated_at?: string;
    itemsPerPage: number;
    itemsPerPageOptions: number[];
    history?: StockHistoryItem[];
    history_by_location?: Record<string, StockHistoryItem[]>;
}

export interface CategoryEditFormData extends CategoryFormData {
    id: string;
    active: boolean;
    created_at?: string;
    updated_at?: string;

}

export interface SubCategoryEditFormData extends SubCategoryFormData {
    id: string;

}

export interface BrandEditFormData extends BrandFormData {
    id: string;

}

export interface VariationEditFormData extends VariationFormData {
    id: string;

}

export interface ProductSpecsEditFormData extends ProductSpecsFormData {
    id: string;

}

export interface ProductTemplateEditFormData extends ProductTemplateFormData {
    id: string;

}

export interface ProductEditFormData extends ProductFormData {
    id: string;

}

export interface ProductVariantEditFormData extends ProductVariantFormData {
    id: string;

}

export interface ProductTypeSummary {
    type: ProductType;
    categoryCount: number;
    subCategoryCount: number;
    brandCount: number;
    variationCount: number;
    specCount: number;

}

export interface ProductSummary {
    product: Product;
    type: ProductType;
    category: Category;
    subCategory: SubCategory;
    brand: Brand;
    variations: Variation[];
    specs: ProductSpecs[];

}

export interface ProductVariantSummary {
    productVariant: ProductVariant;
    type: ProductType;
    category: Category;
    subCategory: SubCategory;
    brand: Brand;
    variations: Variation[];
    specs: ProductSpecs[];

}

export interface ProductTypeContextType {
    productTypes: ProductType[];
    categories: Category[];
    subCategories: SubCategory[];
    brands: Brand[];
    variations: Variation[];
    specs: ProductSpecs[];
    templates: ProductTemplate[];
    products: Product[];
    productVariants: ProductVariant[];
    loading: boolean;
    error: string | null;
    fetchProductTypes: () => Promise<void>;
    fetchCategories: () => Promise<void>;
    fetchSubCategories: () => Promise<void>;
    fetchBrands: () => Promise<void>;
    fetchVariations: () => Promise<void>;
    fetchSpecs: () => Promise<void>;
    fetchTemplates: () => Promise<void>;
    fetchProducts: () => Promise<void>;
    fetchProductVariants: () => Promise<void>;
}

export interface ProductContextType {
    product: Product | null;
    type: ProductType | null;
    category: Category | null;
    subCategory: SubCategory | null;
    brand: Brand | null;
    variations: Variation[];
    specs: ProductSpecs[];
    loading: boolean;
    error: string | null;
    fetchProduct: (id: string) => Promise<void>;
    fetchType: (id: string) => Promise<void>;
    fetchCategory: (id: string) => Promise<void>;
    fetchSubCategory: (id: string) => Promise<void>;
    fetchBrand: (id: string) => Promise<void>;
    fetchVariations: () => Promise<void>;
    fetchSpecs: () => Promise<void>;
}

export interface ProductVariantContextType {
    productVariant: ProductVariant | null;
    type: ProductType | null;
    category: Category | null;
    subCategory: SubCategory | null;
    brand: Brand | null;
    variations: Variation[];
    specs: ProductSpecs[];
    loading: boolean;
    error: string | null;
    fetchProductVariant: (id: string) => Promise<void>;
    fetchType: (id: string) => Promise<void>;
    fetchCategory: (id: string) => Promise<void>;
    fetchSubCategory: (id: string) => Promise<void>;
    fetchBrand: (id: string) => Promise<void>;
    fetchVariations: () => Promise<void>;
    fetchSpecs: () => Promise<void>;
}

export interface ProductTypeProviderProps {
    children: React.ReactNode;
}

export interface ProductProviderProps {
    children: React.ReactNode;
}

export interface ProductVariantProviderProps {
    children: React.ReactNode;
}

export type ProductUnitStatus = 'In Stock' | 'Sold' | 'Repair' | 'Returned' | 'Reserved' | 'Damaged';

export interface ProductUnit {
    product_id: string;
    branch_id: string;
    serial_number?: string;
    imei?: string;
    barcode?: string;
    qrCode?: string;
    condition?: 'New' | 'Used' | 'Refurbished';
    batteryHealth?: number;
    color?: string;
    storage?: string;
    ram?: string;
    costPrice: number;
    salePrice?: number;
    purchase_id?: string;
    sale_id?: string;
    supplier_id?: string;
    customer_id?: string;
    repair_id?: string;
    status: ProductUnitStatus;
}

export interface StockHistory {
    date: string;
    product_id: string;
    branch_id: string;
    action: StockAction;
    change: number;
    previous_stock?: number;
    new_stock: number;
    branch: string;
    reference_id?: string;
    reason?: string;
    note?: string;
    created_by?: string;
}

export interface InventoryStock {
    product_id: string;
    branch_id: string;
    quantity: number;
    created_at?: string;
    updated_at?: string;
    active?: boolean;
    id?: string;
    itemsPerPage: number;
    itemsPerPageOptions: number[];
}

export interface LineItem {
    sku?: string;
    product_id: string;
    product_name: string;
    quantity: number;
    price: number;
    discount?: number;
    total?: number;
    serial_numbers?: string[];
    dimensions?: string;
    imeis?: string[];
    created_at?: string;
    updated_at?: string;
    active?: boolean;
}

export type PurchaseStatus = 'Pending' | 'Ordered' | 'Received' | 'Cancelled';

export interface Purchase {
    purchase_umber?: string;
    id: string;
    supplier: string;
    branch_id: string;
    purchase_date: string;
    expected_date?: string;
    items: LineItem[];
    total: number;
    status?: PurchaseStatus;
    history?: StockHistoryItem[];
    note?: string;
    created_at?: string;
    updated_at?: string;
    active?: boolean;
}

export type PurchaseOrderStatus = 'Pending' | 'Ordered' | 'Received' | 'Cancelled';

export interface PurchaseOrder {
    po_number?: string;
    id: string;
    supplier: string;
    branch_id: string;
    order_date: string;
    expected_date: string;
    items: LineItem[];
    total: number;
    status: PurchaseOrderStatus;
}

export type SaleStatus = 'Pending' | 'Completed' | 'Cancelled';

export interface Sale {
    sale_number?: string;
    id: string;
    customer: string;
    branch_id: string;
    sale_date: string;
    items: LineItem[];
    total: number;
    status?: SaleStatus;
}

export interface Settlement {
    settlement_number?: string;
    branch_id: string;
    date: string;
    total_in: number;
    total_out: number;
    note?: string;
    id: string;
    created_at?: string;
    updated_at?: string;
    active?: boolean;
}

export type StockTransferStatus = 'Pending' | 'Completed' | 'Cancelled';

export interface StockTransfer {
    transfer_number?: string;
    fromBranch_id: string;
    toBranch_id: string;
    transfer_date: string;
    id: string;
    short_code?: string;
    items: LineItem[];
    total: number;
    note?: string;
    status: StockTransferStatus;
    quantity?: number;
    history?: StockHistoryItem[];
    created_at?: string;
    updated_at?: string;
    purpose?: string;
    signature_url?: string;
    purposeOptions?: string[];
}

export interface BranchLocation {
    branch_id: string;
    name: string;
    address?: string;
    phone?: string;
}

export interface Supplier {
    code: string;
    name: string;
    contact_person?: string;
    phone?: string;
    email?: string;
    address?: string;
    id: string;
    created_at?: string;
    updated_at?: string;
    active?: boolean;
}

export interface Contact {
    name: string;
    phone?: string;
    email?: string;
    address?: string;
}
