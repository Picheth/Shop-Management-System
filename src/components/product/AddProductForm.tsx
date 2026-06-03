import React, {
  useMemo,
  useState,
  useEffect,
  useRef,
} from 'react';

import iphoneTemplates from '../../data/productTemplates/apple/iphone.json';

import {
  
  Branch,
  ProductType as ProductTypeInterface,
  Category as CategoryInterface,
  SubCategory as SubCategoryInterface,
  Brand as BrandInterface,
  DataProduct,
  MasterAttribute,
} from '../../types';

import {
  productTemplates,
  ProductAttribute,
  ProductTemplate,
  generateSku,
  findDuplicateAttributeIndices,
  getAttributeValidationErrors,
  CATEGORY_ATTRIBUTE_TEMPLATES,
  ALL_COMMON_ATTRIBUTES,
  COMMON_ATTRIBUTE_VALUES,
  getAttributeValueListId,
  getDefaultAttributesForCategory,
  getMostUsedAttributeValues,
} from '../../Types/ProductSpecs';

import { supabase } from '../../utils/supabase';

import FormInput from '../ui/FormInput';
import FormSelect from '../ui/FormSelect';

import { useDuplicateValidation } from '../../hooks/useDuplicateValidation';
import { useFormValidation } from '../../hooks/useFormValidation';

type AddProductFormData = {
  name: string;
  sku: string;

  categoryId: string;
  typeId: string;
  subCategoryId: string;
  brandId: string;

  model: string;
  displaySize: string;

  salePrice: number;
  costPrice: number;
  initialStock: number;
  isActive: boolean;

  branchId: string;

  hasSerialNumber: boolean;
  hasIMEI: boolean;

  imageUrl: string;

  regionId: string;
  processorId: string;
  ramId: string;
  storageId: string;
  colorId: string;
  conditionId: string;

  skuSeparator: string;
  skuExcludeSegments: string[];
  isSkuLocked: boolean;

  attributes: ProductAttribute[];

  description: string;
};

interface AddProductFormProps {
  onSubmit: (data: AddProductFormData) => void;
  onCancel: () => void;

  products: DataProduct[];
  initialData?: Partial<DataProduct>;

  existingCategories: CategoryInterface[];
  branches: Branch[];
  existingProductTypes: ProductTypeInterface[];
  existingSubCategories: SubCategoryInterface[];
  existingBrands: BrandInterface[];
  onQuickAddBrand?: (brand: any) => Promise<BrandInterface>;
  onQuickAddCategory?: (category: any) => Promise<CategoryInterface>;

  processors: MasterAttribute[];
  rams: MasterAttribute[];
  storages: MasterAttribute[];
  colors: MasterAttribute[];
  regions: MasterAttribute[];
  conditions: MasterAttribute[];
}

const AddProductForm: React.FC<AddProductFormProps> = ({
  onSubmit,
  onCancel,
  initialData,
  products,

  existingCategories,
  branches,
  existingProductTypes,
  existingSubCategories,
  existingBrands,

  processors,
  rams,
  storages,
  colors,
  regions,
  conditions,
}) => {
  const [selectedTemplate, setSelectedTemplate] =
    useState<ProductTemplate | null>(null);

  const [isManualValidating, setIsManualValidating] = useState(false);
  const [manualValidationResult, setManualValidationResult] = useState<boolean | null>(null);

  const [showSkuHistory, setShowSkuHistory] = useState(false);
  const [clearedHistoryCategories, setClearedHistoryCategories] = useState<Set<string>>(new Set());
  const [clearedDynamicSuggestions, setClearedDynamicSuggestions] = useState<Set<string>>(new Set());
  
  const DYNAMIC_SUGGESTIONS_KEY = 'disableDynamicSuggestions';
  const [disableDynamicSuggestions, setDisableDynamicSuggestions] = useState(() => {
    try {
      const storedValue = localStorage.getItem(DYNAMIC_SUGGESTIONS_KEY);
      return storedValue ? JSON.parse(storedValue) : false;
    } catch (error) {
      console.error("Failed to parse disableDynamicSuggestions from localStorage", error);
      return false;
    }
  });

  // Effect to persist disableDynamicSuggestions to localStorage
  useEffect(() => {
    localStorage.setItem(DYNAMIC_SUGGESTIONS_KEY, JSON.stringify(disableDynamicSuggestions));
  }, [disableDynamicSuggestions]);

  const historyRef = useRef<HTMLDivElement>(null);

  const [form, setForm] = useState<AddProductFormData>({
    name: initialData?.name || '',
    sku: initialData?.sku || '',

    categoryId: initialData?.categoryId || '',
    typeId: initialData?.typeId || '',
    subCategoryId: initialData?.subCategoryId || '',
    brandId: initialData?.brandId || '',

    model: initialData?.model || '',
    displaySize: initialData?.displaySize || '',

    salePrice: initialData?.salePrice || 0,
    costPrice: initialData?.costPrice || 0,

    initialStock: initialData?.stockByLocation
      ? Object.values(initialData.stockByLocation).reduce(
          (sum, qty) => sum + qty,
          0
        )
      : 0,

    isActive: initialData?.isActive ?? true,

    branchId:
      initialData?.stockByLocation
        ? Object.keys(initialData.stockByLocation)[0]
        : branches[0]?.id || '',

    hasSerialNumber: initialData?.hasSerialNumber || false,
    hasIMEI: initialData?.hasIMEI || false,

    imageUrl: initialData?.imageUrl || '',

    regionId: '',
    processorId: '',
    ramId: '',
    storageId: '',
    colorId: '',
    conditionId: '',

    skuSeparator: '-',
    skuExcludeSegments: [],
    isSkuLocked: !!initialData?.sku,

    attributes: initialData?.attributes || [],

    description: initialData?.description || '',
  });

  const { isDuplicate: isSkuDuplicate, isValidating: isSkuValidating } =
    useDuplicateValidation(
      'products',
      'sku',
      form.sku,
      initialData?.id || null
    );

  const { isInvalid, errors: fieldErrors } = useFormValidation(form, {
    required: ['name', 'sku', 'branchId'],

    patterns: {
      sku: /^[A-Z]{3}-\d{5}$/, // Enforces pattern like ABC-12345
    },

    minMax: {
      salePrice: { min: 0.01 },
      costPrice: { min: 0.01 },
      initialStock: { min: 0 },
    },

    maxLength: {
      description: 500,
    },

    labels: {
      name: 'Product Name',
      sku: 'SKU',
      salePrice: 'Sale Price',
      costPrice: 'Cost Price',
      branchId: 'Branch',
      initialStock: 'Initial Stock',
    },
  });

  /**
   * Calculates the last 5 unique SKUs used in the currently selected category.
   * Respects the "Clear History" action by checking against dismissed categories.
   */
  const skuHistory = useMemo(() => {
    if (!form.categoryId || !products || clearedHistoryCategories.has(form.categoryId)) return [];
    return products
      .filter((p) => p.categoryId === form.categoryId && p.sku && p.id !== initialData?.id)
      .sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
      })
      .map((p) => p.sku)
      .filter((sku, index, self) => self.indexOf(sku) === index)
      .slice(0, 5);
  }, [form.categoryId, products, initialData?.id, clearedHistoryCategories]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (historyRef.current && !historyRef.current.contains(event.target as Node)) {
        setShowSkuHistory(false);
      }
    };
    if (showSkuHistory) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showSkuHistory]);

  /**
   * Helper to automatically select cascading fields (Category/Sub-Category) 
   * when only one option is available.
   */
  const autoSelectCascading = (typeId: string, categoryId: string) => {
    let finalCatId = categoryId;
    let finalSubCatId = '';

    // Auto-select category if type is provided and category is currently empty
    if (typeId && !finalCatId) {
      const cats = existingCategories.filter(c => c.typeId === typeId);
      if (cats.length === 1) finalCatId = cats[0].id;
    }

    // Auto-select sub-category if category is set
    if (finalCatId) {
      const subs = existingSubCategories.filter(sc => sc.categoryId === finalCatId);
      if (subs.length === 1) finalSubCatId = subs[0].id;
    }

    return { categoryId: finalCatId, subCategoryId: finalSubCatId };
  };

  /**
   * Auto-select Product Type on mount if only one option exists.
   */
  useEffect(() => {
    if (!initialData && existingProductTypes.length === 1 && !form.typeId) {
      const typeId = existingProductTypes[0].id;
      const { categoryId, subCategoryId } = autoSelectCascading(typeId, '');
      setForm(prev => ({
        ...prev,
        typeId,
        categoryId,
        subCategoryId
      }));
    }
  }, [existingProductTypes, initialData]);

  /**
   * Real-time calculation of duplicate attribute indices for UI highlighting.
   */
  const duplicateAttributeIndices = useMemo(() => 
    findDuplicateAttributeIndices(form.attributes), 
  [form.attributes]);

  /**
   * Real-time validation of attribute values (e.g., Battery Health).
   */
  const attributeValidationErrors = useMemo(() => 
    getAttributeValidationErrors(form.attributes), 
  [form.attributes]);

  /**
   * Computes a prioritized list of attribute suggestions.
   * Category-specific templates appear first, followed by all other common attributes.
   */
  const attributeSuggestions = useMemo(() => {
    const category = existingCategories.find((c) => c.id === form.categoryId);
    const categorySpecific = category
      ? CATEGORY_ATTRIBUTE_TEMPLATES[category.name] || []
      : [];
    return Array.from(new Set([...categorySpecific, ...ALL_COMMON_ATTRIBUTES]));
  }, [form.categoryId, existingCategories]);

  /**
   * Merges hardcoded common values with dynamic "most used" values from the database.
   */
  const mergedAttributeValues = useMemo(() => {
    const dynamicSuggestions = disableDynamicSuggestions ? {} : getMostUsedAttributeValues(products);
    const merged: Record<string, string[]> = { ...COMMON_ATTRIBUTE_VALUES };

    const suggestionsToMerge = dynamicSuggestions as Record<string, string[]>;
    Object.entries(suggestionsToMerge).forEach(([name, values]) => {
      // Only merge dynamic suggestions if they haven't been cleared for this attribute name
      if (clearedDynamicSuggestions.has(name)) return;

      if (merged[name]) {
        // Combine and ensure uniqueness
        merged[name] = Array.from(new Set([...merged[name], ...values]));
      } else {
        merged[name] = values;
      }
    });

    return merged;
  }, [products, clearedDynamicSuggestions, disableDynamicSuggestions]);

  const currentCategory = useMemo(() => 
    existingCategories.find((c) => c.id === form.categoryId),
  [form.categoryId, existingCategories]);

  const filteredCategories = useMemo(() => {
    return existingCategories.filter(
      (c) => c.typeId === form.typeId
    );
  }, [existingCategories, form.typeId]);

  const filteredSubCategories = useMemo(() => {
    return existingSubCategories.filter(
      (sc) => sc.categoryId === form.categoryId
    );
  }, [existingSubCategories, form.categoryId]);

  const filteredAttributeOptions = useMemo(() => {
    if (!selectedTemplate) {
      return {
        processors: [],
        rams: [],
        storages: [],
        colors: [],
        regions: [],
        conditions: [],
      };
    }

    return {
      processors: processors.filter((p) =>
        selectedTemplate.processor?.includes(p.name)
      ),

      rams: rams.filter((r) =>
        selectedTemplate.ram?.includes(r.name)
      ),

      storages: storages.filter((s) =>
        selectedTemplate.storages?.includes(s.name)
      ),

      colors: colors.filter((c) =>
        selectedTemplate.colors?.includes(c.name)
      ),

      regions: regions.filter((r) =>
        selectedTemplate.regions?.includes(r.name)
      ),

      conditions: conditions.filter((c) =>
        selectedTemplate.conditions?.includes(c.name)
      ),
    };
  }, [
    selectedTemplate,
    processors,
    rams,
    storages,
    colors,
    regions,
    conditions,
  ]);

  const updateGeneratedSku = (
    updatedForm: AddProductFormData
  ) => {
    if (!selectedTemplate) return updatedForm.sku;

    const categoryName =
      existingCategories.find((c) => c.id === updatedForm.categoryId)?.name || '';

    const brandName =
      existingBrands.find((b) => b.id === updatedForm.brandId)?.name || '';

    const subCategoryName =
      existingSubCategories.find((s) => s.id === updatedForm.subCategoryId)?.name || '';

    const storageName =
      storages.find((s) => s.id === updatedForm.storageId)?.name || '';

    const colorName =
      colors.find((c) => c.id === updatedForm.colorId)?.name || '';

    const regionName =
      regions.find((r) => r.id === updatedForm.regionId)?.name || '';

    const conditionName =
      conditions.find((c) => c.id === updatedForm.conditionId)?.name || '';

    const ramName =
      rams.find((r) => r.id === updatedForm.ramId)?.name || '';

    const processorName =
      processors.find((p) => p.id === updatedForm.processorId)?.name || '';

    return generateSku(
      selectedTemplate,
      categoryName,
      brandName,
      subCategoryName,
      storageName,
      colorName,
      regionName,
      conditionName,
      ramName,
      processorName,
      updatedForm.skuSeparator,
      updatedForm.skuExcludeSegments
    );
  };

  const handleManualValidateSku = async () => {
    const skuToTest = form.sku.trim();
    if (!skuToTest) return;
    
    setIsManualValidating(true);
    setManualValidationResult(null);
    
    try {
      let query = supabase
        .from('products')
        .select('id')
        .eq('sku', skuToTest);

      if (initialData?.id) {
        query = query.neq('id', initialData.id);
      }

      const { data, error } = await query.maybeSingle();
      if (error) throw error;
      
      const exists = !!data;
      setManualValidationResult(exists);
      
    } catch (err) {
      console.error('Manual SKU validation failed:', err);
    } finally {
      setIsManualValidating(false);
    }
  };

  const handleTemplateChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const modelName = e.target.value;

    const template = productTemplates.find(
      (t) => t.model === modelName
    );

    if (!template) return;

    setSelectedTemplate(template);

    const category = existingCategories.find(
      (c) => c.name.toLowerCase().trim() === template.category.toLowerCase().trim()
    );

    const brand = existingBrands.find(
      (b) => b.name.toLowerCase().trim() === template.brand.toLowerCase().trim()
    );

    const productType = existingProductTypes.find(
      (pt) => pt.name.toLowerCase().trim() === template.type.toLowerCase().trim()
    );

    const subCategory = existingSubCategories.find(
      (sc) => sc.name.toLowerCase().trim() === template.subCategory.toLowerCase().trim()
    );

    const { categoryId: autoCat, subCategoryId: autoSub } = autoSelectCascading(
      productType?.id || '',
      category?.id || ''
    );

    setForm((prev) => ({
      ...prev,

      name: template.name,

      brandId: brand?.id || '',
      categoryId: autoCat,
      typeId: productType?.id || '',
      subCategoryId: subCategory?.id || autoSub,

      model: template.model,
      displaySize: template.displaySize || '',

      storageId: '',
      ramId: '',
      colorId: '',
      processorId: '',
      regionId: '',
      conditionId: '',

      isSkuLocked: false,
    }));
  };

  const handleChange = (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLTextAreaElement>
      | React.ChangeEvent<HTMLSelectElement>
  ) => {
    const target = e.target;
const { name, value } = target;

const inputType =
  target instanceof HTMLInputElement
    ? target.type
    : undefined;

    if (name === 'sku') setManualValidationResult(null);

    let newValue: any = value;

    if (inputType === 'checkbox') {
      newValue = (e.target as HTMLInputElement).checked;
    }

    if (inputType === 'number') {
      newValue = value === '' ? 0 : Number(value);
    }

    setForm((prev) => {
      const updated: AddProductFormData = {
      ...prev,
      [name]: newValue,
      } as AddProductFormData;

      if (name === 'sku' && newValue !== prev.sku) {
        updated.isSkuLocked = true;
      }

      if (name === 'typeId') {
        const { categoryId, subCategoryId } = autoSelectCascading(newValue, '');
        updated.categoryId = categoryId;
        updated.subCategoryId = subCategoryId;
      }

      if (name === 'categoryId') {
        const { subCategoryId } = autoSelectCascading(updated.typeId, newValue);
        updated.subCategoryId = subCategoryId;
      }

      if (
        [
          'brandId',
          'categoryId',
          'subCategoryId',
          'storageId',
          'ramId',
          'colorId',
          'conditionId',
          'processorId',
          'regionId',
        ].includes(name)
      ) {
        if (!updated.isSkuLocked) {
          updated.sku = updateGeneratedSku(updated);
        }
      }

      return updated;
    });
  };

  const handleRegenerateSku = () => {
    const newSku = updateGeneratedSku(form);
    setForm((prev) => ({
      ...prev,
      sku: newSku,
      isSkuLocked: false,
    }));
  };

  const handleAddAttribute = () => {
    setForm((prev) => ({
      ...prev,
      attributes: [
        ...prev.attributes,
        {
          name: '',
          value: '',
        },
      ],
    }));
  };

  const handleBulkAddAttributes = () => {
    if (!currentCategory) return;
    
    const defaults = getDefaultAttributesForCategory(currentCategory.name);
    if (defaults.length === 0) return;

    const existingNames = new Set(form.attributes.map(a => a.name.trim().toLowerCase()));
    const toAdd = defaults.filter(d => !existingNames.has(d.name.toLowerCase()));

    if (toAdd.length > 0) {
      setForm(prev => ({
        ...prev,
        attributes: [...prev.attributes, ...toAdd]
      }));
    }
  };

  const handleClearAllAttributes = () => {
    if (form.attributes.length === 0) return;
    
    if (window.confirm('Are you sure you want to remove all dynamic attributes from this product? This action cannot be undone.')) {
      setForm(prev => ({ ...prev, attributes: [] }));
    }
  };

  const handleRestoreHistory = () => {
    if (form.categoryId) {
      setClearedHistoryCategories(prev => {
        const next = new Set(prev);
        next.delete(form.categoryId);
        return next;
      });
    }
  };

  const handleClearSuggestions = (attrName: string) => {
    setClearedDynamicSuggestions(prev => new Set(prev).add(attrName.trim()));
  };

  const handleRestoreAllSuggestions = () => {
    setClearedDynamicSuggestions(new Set());
  };

  const handleAttributeChange = (
    index: number,
    field: 'name' | 'value',
    value: string
  ) => {
    setForm((prev) => {
      const updated = [...prev.attributes];

      updated[index] = {
        ...updated[index],
        [field]: value,
      };

      return {
        ...prev,
        attributes: updated,
      };
    });
  };

  const handleRemoveAttribute = (index: number) => {
    setForm((prev) => ({
      ...prev,
      attributes: prev.attributes.filter(
        (_, i) => i !== index
      ),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const hasAttributeErrors = Object.keys(attributeValidationErrors).length > 0;

    if (
      isSkuValidating ||
      isSkuDuplicate ||
      isInvalid ||
      duplicateAttributeIndices.length > 0 ||
      hasAttributeErrors
    ) {
      return;
    }

    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="space-y-8">

        {/* BASIC INFO */}
        <section>
          <h3 className="text-sm font-bold uppercase tracking-wider text-sky-600 mb-4 border-b pb-2 dark:border-gray-700">
            Basic Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            <FormSelect
              label="Select Model"
              name="modelSelect"
              value={selectedTemplate?.model || ''}
              onChange={handleTemplateChange}
              options={productTemplates.map((t) => ({
                value: t.model,
                label: t.name,
              }))}
              placeholder="Select Product Model"
            />

            <FormInput
              label="Product Name"
              name="name"
              value={form.name}
              onChange={handleChange}
              error={fieldErrors.name}
              required
            />

            <div className="relative">
              <FormInput
                label="SKU"
                name="sku"
                value={form.sku}
                onChange={handleChange}
                isValidating={isSkuValidating || isManualValidating}
                isDuplicate={isSkuDuplicate || manualValidationResult === true}
                error={fieldErrors.sku}
                required
              />
              <div className="absolute right-3 top-[32px] flex items-center gap-1" ref={historyRef}>
                {skuHistory.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowSkuHistory(!showSkuHistory)}
                    className={`p-1 rounded-md transition-colors ${showSkuHistory ? 'text-sky-600 bg-sky-50 dark:bg-sky-900/20' : 'text-gray-400 hover:text-sky-500'}`}
                    title="View SKU History for this Category"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </button>
                )}
                {form.isSkuLocked && (
                  <button
                    type="button"
                    onClick={handleRegenerateSku}
                    className="p-1 text-gray-400 hover:text-sky-600 transition-colors"
                    title="Regenerate SKU from current selection"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleManualValidateSku}
                  disabled={!form.sku.trim() || isManualValidating}
                  className={`p-1 rounded-md transition-colors ${
                    manualValidationResult === false 
                      ? 'text-green-500 bg-green-50 dark:bg-green-900/20' 
                      : manualValidationResult === true
                      ? 'text-red-500 bg-red-50 dark:bg-red-900/20'
                      : 'text-gray-400 hover:text-sky-600'
                  } disabled:opacity-30`}
                  title="Manually check SKU availability"
                >
                  {isManualValidating ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-sky-600 border-t-transparent"></div>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setForm(prev => ({ ...prev, isSkuLocked: !prev.isSkuLocked }))}
                  className={`p-1 rounded-md transition-colors ${
                    form.isSkuLocked 
                      ? 'text-amber-500 hover:text-amber-600 bg-amber-50 dark:bg-amber-900/20' 
                      : 'text-gray-400 hover:text-sky-500'
                  }`}
                  title={form.isSkuLocked ? "SKU Locked (Manual)" : "SKU Unlocked (Auto-generate)"}
                >
                  {form.isSkuLocked ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10 2a5 5 0 00-5 5v2a2 2 0 00-2 2v5a2 2 0 002 2h10a2 2 0 002-2v-5a2 2 0 00-2-2V7a5 5 0 00-5-5zM7 7a3 3 0 016 0v2H7V7z" />
                    </svg>
                  )}
                </button>
              </div>

              {/* SKU History Dropdown */}
              {showSkuHistory && (
                <div className="absolute right-0 top-[62px] z-[100] w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl py-2 animate-fade-in-down">
                  <div className="px-4 py-1 flex justify-between items-center border-b border-gray-100 dark:border-gray-700 mb-1">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      Recent Category SKUs
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        if (form.categoryId) {
                          setClearedHistoryCategories(prev => new Set(prev).add(form.categoryId));
                          setShowSkuHistory(false);
                        }
                      }}
                      className="text-[9px] font-black text-red-500 hover:text-red-600 uppercase tracking-tighter"
                    >
                      Clear
                    </button>
                  </div>
                  {skuHistory.map((sku) => (
                    <button
                      key={sku}
                      type="button"
                      onClick={() => {
                        setForm(prev => ({ ...prev, sku, isSkuLocked: true }));
                        setShowSkuHistory(false);
                        setManualValidationResult(null);
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-sky-50 dark:hover:bg-sky-900/30 transition-colors font-mono"
                    >
                      {sku}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <FormSelect
              label="Product Type"
              name="typeId"
              value={form.typeId}
              onChange={handleChange}
              options={existingProductTypes.map((t) => ({
                value: t.id,
                label: t.name,
              }))}
            />

            <FormSelect
              label="Category"
              name="categoryId"
              value={form.categoryId}
              onChange={handleChange}
              options={filteredCategories.map((c) => ({
                value: c.id,
                label: c.name,
              }))}
            />

            <FormSelect
              label="Sub Category"
              name="subCategoryId"
              value={form.subCategoryId}
              onChange={handleChange}
              options={filteredSubCategories.map((s) => ({
                value: s.id,
                label: s.name,
              }))}
            />

            <FormSelect
              label="Brand"
              name="brandId"
              value={form.brandId}
              onChange={handleChange}
              options={existingBrands.map((b) => ({
                value: b.id,
                label: b.name,
              }))}
            />
          </div>
        </section>

        {/* VARIANTS */}
        <section>
          <h3 className="text-sm font-bold uppercase tracking-wider text-sky-600 mb-4 border-b pb-2 dark:border-gray-700">
            Product Variants
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            <FormSelect
              label="Processor"
              name="processorId"
              value={form.processorId}
              onChange={handleChange}
              options={filteredAttributeOptions.processors.map((p) => ({
                value: p.id,
                label: p.name,
              }))}
            />

            <FormSelect
              label="RAM"
              name="ramId"
              value={form.ramId}
              onChange={handleChange}
              options={filteredAttributeOptions.rams.map((r) => ({
                value: r.id,
                label: r.name,
              }))}
            />

            <FormSelect
              label="Storage"
              name="storageId"
              value={form.storageId}
              onChange={handleChange}
              options={filteredAttributeOptions.storages.map((s) => ({
                value: s.id,
                label: s.name,
              }))}
            />

            <FormSelect
              label="Color"
              name="colorId"
              value={form.colorId}
              onChange={handleChange}
              options={filteredAttributeOptions.colors.map((c) => ({
                value: c.id,
                label: c.name,
              }))}
            />

            <FormSelect
              label="Region"
              name="regionId"
              value={form.regionId}
              onChange={handleChange}
              options={filteredAttributeOptions.regions.map((r) => ({
                value: r.id,
                label: r.name,
              }))}
            />

            <FormSelect
              label="Condition"
              name="conditionId"
              value={form.conditionId}
              onChange={handleChange}
              options={filteredAttributeOptions.conditions.map((c) => ({
                value: c.id,
                label: c.name,
              }))}
            />
          </div>
        </section>

        {/* INVENTORY */}
        <section>
          <h3 className="text-sm font-bold uppercase tracking-wider text-sky-600 mb-4 border-b pb-2 dark:border-gray-700">
            Pricing & Inventory
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            <FormInput
              label="Cost Price"
              name="costPrice"
              type="number"
              value={form.costPrice}
              onChange={handleChange}
              error={fieldErrors.costPrice}
              required
            />

            <FormInput
              label="Sale Price"
              name="salePrice"
              type="number"
              value={form.salePrice}
              onChange={handleChange}
              error={fieldErrors.salePrice}
              required
            />

            <FormInput
              label="Initial Stock"
              name="initialStock"
              type="number"
              value={form.initialStock}
              onChange={handleChange}
              error={fieldErrors.initialStock}
            />

            <FormSelect
              label="Branch"
              name="branchId"
              value={form.branchId}
              onChange={handleChange}
              options={branches.map((b) => ({
                value: b.id,
                label: b.name,
              }))}
              error={fieldErrors.branchId}
            />
          </div>
        </section>

        {/* ADVANCED */}
        <section>
          <h3 className="text-sm font-bold uppercase tracking-wider text-sky-600 mb-4 border-b pb-2 dark:border-gray-700">
            Advanced
          </h3>

          <div className="space-y-4">

            <div className="flex flex-wrap gap-6">

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={form.isActive}
                  onChange={handleChange}
                  className="h-4 w-4 text-sky-600 border-gray-300 rounded focus:ring-sky-500"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Active Product</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="hasSerialNumber"
                  checked={form.hasSerialNumber}
                  onChange={handleChange}
                />
                Serial Tracking
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="hasIMEI"
                  checked={form.hasIMEI}
                  onChange={handleChange}
                />
                IMEI Tracking
              </label>
            </div>

            <FormInput
              label="Image URL"
              name="imageUrl"
              value={form.imageUrl}
              onChange={handleChange}
            />
          </div>
        </section>

        {/* DYNAMIC ATTRIBUTES */}
        <section>
          <div className="flex flex-wrap justify-between items-center gap-2 mb-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-sky-600">
              Dynamic Attributes
            </h3>

            <div className="flex gap-2">
              <label className="flex items-center gap-2 cursor-pointer bg-sky-50 dark:bg-sky-900/30 px-3 py-1 rounded-md border border-sky-100 dark:border-sky-800 transition-colors">
                <input
                  type="checkbox"
                  checked={!disableDynamicSuggestions}
                  onChange={(e) => setDisableDynamicSuggestions(!e.target.checked)}
                  className="h-3 w-3 text-sky-600 border-gray-300 rounded focus:ring-sky-500"
                />
                <span className="text-[10px] font-bold text-sky-600 dark:text-sky-400 uppercase tracking-tight">Enable Suggestions</span>
              </label>
              {currentCategory && CATEGORY_ATTRIBUTE_TEMPLATES[currentCategory.name] && (
                <button
                  type="button"
                  onClick={handleBulkAddAttributes}
                  className="bg-sky-50 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 border border-sky-100 dark:border-sky-800 px-3 py-1 rounded-md text-xs font-bold uppercase tracking-tight hover:bg-sky-100 transition-colors"
                >
                  Bulk Add {currentCategory.name} Fields
                </button>
              )}
              {form.categoryId && clearedHistoryCategories.has(form.categoryId) && (
                <button
                  type="button"
                  onClick={handleRestoreHistory}
                  className="bg-sky-50 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 border border-sky-100 dark:border-sky-800 px-3 py-1 rounded-md text-xs font-bold uppercase tracking-tight hover:bg-sky-100 transition-colors"
                >
                  Restore History
                </button>
              )}
              {clearedDynamicSuggestions.size > 0 && (
                <button
                  type="button"
                  onClick={handleRestoreAllSuggestions}
                  className="bg-sky-50 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 border border-sky-100 dark:border-sky-800 px-3 py-1 rounded-md text-xs font-bold uppercase tracking-tight hover:bg-sky-100 transition-colors"
                >
                  Restore Suggestions
                </button>
              )}
              {form.attributes.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearAllAttributes}
                  className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-800 px-3 py-1 rounded-md text-xs font-bold uppercase tracking-tight hover:bg-red-100 transition-colors"
                >
                  Clear All
                </button>
              )}
              <button
                type="button"
                onClick={handleAddAttribute}
                className="bg-sky-600 text-white px-3 py-1 rounded-md text-sm"
              >
                Add Attribute
              </button>
            </div>
          </div>

          {/* Hidden datalist used by Attribute Name inputs */}
          <datalist id="attribute-names-list">
            {attributeSuggestions.map((suggestion) => (
              <option key={suggestion} value={suggestion} />
            ))}
          </datalist>

          {/* Value suggestion datalists for specific common attributes */}
          {Object.entries(mergedAttributeValues).map(([attrName, values]) => (
            <datalist key={attrName} id={getAttributeValueListId(attrName)}>
              {values.map((val) => (
                <option key={val} value={val} />
              ))}
            </datalist>
          ))}

          <div className="space-y-4">

            {form.attributes.map((attr, index) => (
              <div
                key={index}
                className="flex gap-3 items-start"
              >
                <div className="flex-1">
                  <FormInput
                    placeholder="Attribute Name"
                    value={attr.name}
                    list="attribute-names-list"
                    onChange={(e) =>
                      handleAttributeChange(
                        index,
                        'name',
                        e.target.value
                      )
                    }
                    error={duplicateAttributeIndices.includes(index) ? "Duplicate Name" : undefined}
                  />
                </div>

                <div className="flex-1 relative group/val">
                  <FormInput
                    placeholder="Attribute Value"
                    value={attr.value}
                    error={attributeValidationErrors[index]}
                    list={mergedAttributeValues[attr.name.trim()] ? getAttributeValueListId(attr.name) : undefined}
                    onChange={(e) =>
                      handleAttributeChange(
                        index,
                        'value',
                        e.target.value
                      )
                    }
                  />
                  {/* Clear Suggestions Button - Visible if dynamic suggestions are active for this name */}
                  {attr.name.trim() && !disableDynamicSuggestions && !clearedDynamicSuggestions.has(attr.name.trim()) && getMostUsedAttributeValues(products)[attr.name.trim()] && (
                    <button
                      type="button"
                      onClick={() => handleClearSuggestions(attr.name)}
                      className="absolute right-2 top-2.5 p-1 text-gray-300 hover:text-amber-500 opacity-0 group-hover/val:opacity-100 transition-all"
                      title={`Clear dynamic suggestions for "${attr.name}"`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() =>
                    handleRemoveAttribute(index)
                  }
                  className="text-red-500 mt-2"
                >
                  Remove
                </button>
              </div>
            ))}

          </div>
        </section>

        {/* DESCRIPTION */}
        <section>
          <FormInput
            label="Description"
            name="description"
            isTextArea
            value={form.description}
            onChange={handleChange}
            maxLength={500}
          />
        </section>
      </div>

      <div className="flex justify-end gap-3 mt-8 pt-4 border-t dark:border-gray-700">

        <button
          type="button"
          onClick={onCancel}
          className="bg-gray-200 dark:bg-gray-700 px-4 py-2 rounded-md"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={
            isSkuValidating ||
            isManualValidating ||
            isSkuDuplicate ||
            manualValidationResult === true ||
            isInvalid ||
            duplicateAttributeIndices.length > 0 ||
            Object.keys(attributeValidationErrors).length > 0
          }
          className="bg-sky-600 text-white px-4 py-2 rounded-md"
        >
          {isSkuValidating || isManualValidating
            ? 'Checking...'
            : 'Save Product'}
        </button>
      </div>
    </form>
  );
};

export default AddProductForm;