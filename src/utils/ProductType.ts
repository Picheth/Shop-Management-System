import { BaseEntity } from '../types';

export interface ProductType extends BaseEntity {
    code: string;
    name: string;
    description?: string;
    active: boolean;
}

export interface Category extends BaseEntity {
    code: string;
    typeId: string;
    name: string;
    description?: string;
    active: boolean;
}

export interface SubCategory extends BaseEntity {
    code: string;
    categoryId: string;
    name: string;
    description?: string;
    active: boolean;
}

export interface Brand extends BaseEntity {
    code: string;
    name: string;
    shortName?: string;
    country?: string;
}

export interface Variation extends BaseEntity {
    name: string;
    type: string;
    value: string;
}

export interface ProductSpecs extends BaseEntity {
    label: string;
    value: string;
    unit?: string;
}

export interface ProductAttributeSet {
    type?: ProductType;
    category?: Category;
    subCategory?: SubCategory;
    brand?: Brand;
    variations?: Variation[];
    specs?: ProductSpecs[];
}

export interface ProductTemplate extends ProductAttributeSet {
    templateId: string;
    name: string;
    skuPattern?: string;
    productCodePattern?: string;
    status: string;
    isActive?: boolean;
}

export interface Product extends ProductAttributeSet {
    id: string;
    name: string;
    sku: string;
    productCode: string;
    status: string;
    isActive?: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface ProductVariant extends ProductAttributeSet {
    id: string;
    name: string;
    sku: string;
    productCode: string;
    status: string;
    isActive?: boolean;
    createdAt?: string;
    updatedAt?: string;
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

export type ProductStatus = 'In Stock' | 'Low Stock' | 'Out of Stock';

export type StockAction = 'Initial Stock' | 'Purchase' | 'Sale' | 'Adjustment' | 'Stock Adjustment' | 'Transfer In' | 'Transfer Out' | 'Repair' | 'Repair Used' | 'Repair Returned' | 'Return';

export interface StockHistoryItem {
    date: string;
    action: StockAction;
    change: number;
    newStock: number;
    branch: string;
    reason?: string;
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
    typeId: string;
    name: string;
    description?: string;
    active: boolean;
}

export interface SubCategoryFormData {
    code: string;
    categoryId: string;
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
    templateId: string;
    name: string;
    skuPattern?: string;
    productCodePattern?: string;
    status: string;
    isActive?: boolean;
}

export interface ProductFormData extends ProductAttributeSet {
    id: string;
    name: string;
    sku: string;
    productCode: string;
    status: string;
    isActive?: boolean;
}

export interface ProductVariantFormData extends ProductAttributeSet {
    id: string;
    name: string;
    sku: string;
    productCode: string;
    status: string;
    isActive?: boolean;
}

export interface ProductTypeEditFormData extends ProductTypeFormData {
    id: string;
}

export interface CategoryEditFormData extends CategoryFormData {
    id: string;
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
    productId: string;
    branchId: string;
    serialNumber?: string;
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
    purchaseId?: string;
    saleId?: string;
    supplierId?: string;
    customerId?: string;
    repairId?: string;
    status: ProductUnitStatus;
}

export interface StockHistory {
    date: string;
    productId: string;
    branchId: string;
    action: StockAction;
    change: number;
    previousStock?: number;
    newStock: number;
    branch: string;
    referenceId?: string;
    reason?: string;
    note?: string;
    createdBy?: string;
}

export interface InventoryStock {
    productId: string;
    branchId: string;
    quantity: number;
}

export interface LineItem {
    sku?: string;
    productId: string;
    productName: string;
    quantity: number;
    price: number;
    discount?: number;
    total?: number;
    serialNumbers?: string[];
    dimensions?: string;
    imeis?: string[];
}

export type PurchaseStatus = 'Pending' | 'Ordered' | 'Received' | 'Cancelled';

export interface Purchase {
    purchaseNumber?: string;
    id: string;
    supplier: string;
    branchId: string;
    purchaseDate: string;
    expectedDate?: string;
    items: LineItem[];
    total: number;
    status?: PurchaseStatus;
    history?: StockHistoryItem[];
    note?: string;
    createdAt?: string;
    updatedAt?: string;
    active?: boolean;
}

export type PurchaseOrderStatus = 'Pending' | 'Ordered' | 'Received' | 'Cancelled';

export interface PurchaseOrder {
    poNumber?: string;
    id: string;
    supplier: string;
    branchId: string;
    orderDate: string;
    expectedDate: string;
    items: LineItem[];
    total: number;
    status: PurchaseOrderStatus;
}

export type SaleStatus = 'Pending' | 'Completed' | 'Cancelled';

export interface Sale {
    saleNumber?: string;
    id: string;
    customer: string;
    branchId: string;
    saleDate: string;
    items: LineItem[];
    total: number;
    status?: SaleStatus;
}

export interface Settlement {
    settlementNumber?: string;
    branchId: string;
    date: string;
    totalIn: number;
    totalOut: number;
    note?: string;
    id: string;
    createdAt?: string;
    updatedAt?: string;
    active?: boolean;
}

export type StockTransferStatus = 'Pending' | 'Completed' | 'Cancelled';

export interface StockTransfer {
    transferNumber?: string;
    fromBranchId: string;
    toBranchId: string;
    transferDate: string;
    id: string;
    shortCode?: string;
    items: LineItem[];
    total: number;
    note?: string;
    status: StockTransferStatus;
    quantity?: number;
    history?: StockHistoryItem[];
    createdAt?: string;
    updatedAt?: string;
    purpose?: string;
    signatureUrl?: string;
    purposeOptions?: string[];
}

export interface BranchLocation {
    branchId: string;
    name: string;
    address?: string;
    phone?: string;
}

export interface Supplier {
    code: string;
    name: string;
    contactPerson?: string;
    phone?: string;
    email?: string;
    address?: string;
    id: string;
    createdAt?: string;
    updatedAt?: string;
    active?: boolean;
}

export interface Contact {
    name: string;
    phone?: string;
    email?: string;
    address?: string;
}
