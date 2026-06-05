export interface ProductAttribute {
    name: string;
    value: string;
    description?: string;
    id?: string;
    created_at?: string;
    updated_at?: string;
}

// Auto-generated from productSpecs.json
export interface ProductTemplate {
  [x: string]: any;
  sku?: string;
  templateId: string;
  name: string;
  brand: string;
  type: string;
  category: string;
  brandCodes?: { [key: string]: string };
  subCategory: string;
  categoryCodes?: { [key: string]: string };
  subCategoryCodes?: { [key: string]: string };
  shortModel: string;
  model: string;
  Variant?: {
  processors?: string[];
  processorCodes?: { [key: string]: string };
  categoryCodes?: { [key: string]: string };
  ram?: string[];
  ramCodes?: { [key: string]: string };
  storages?: string[];
  storageCodes?: { [key: string]: string };
  colors: string[];
  colorCodes?: { [key: string]: string };
  regions: string[];
  regionCodes?: { [key: string]: string };
  conditions: string[];
  conditionCodes?: { [key: string]: string };
  
  display_size?: string; // Added for Tablets and Laptops
}
status: string;
is_active?: boolean; // This is already snake_case
created_at?: string;
updated_at?: string;
}



const rawTemplates: any[] = [
  ...(([] as any).MobilePhoneModels ?? []),
  ...(([] as any).TabletModels ?? []),
  ...(([] as any).LaptopModels ?? []),
  ...(([] as any).WatchModels ?? []),
  ...(([] as any).AccessoryModels ?? []),
  ...(([] as any).AudioModels ?? []),
  ...(([] as any).ComputingModels ?? [])
];

export const productTemplates: ProductTemplate[] = rawTemplates.map((spec) => ({
  ...spec,
  templateId: spec.shortModel,
  name: `${spec.brand} ${spec.model}`,
}));

export const getTemplateByModel = (model: string): ProductTemplate | undefined => {
  return productTemplates.find(spec => spec.model === model);
};

export const getAvailableModels = (): string[] => {
  return productTemplates.map(spec => spec.model);
};

/**
 * Automatically generates a professional SKU based on the selected configuration
 */
export const generateSku = (
  template: ProductTemplate,
  category?: string,
  brand?: string,
  subCategory?: string,
  storage?: string,
  color?: string,
  region?: string,
  condition?: string,
  ram?: string,
  processor?: string,
  separator: string = '-', // This is already snake_case
  excludeSegments: string[] = [],
  // New parameter for custom fallbacks per segment type
  customSegmentFallbacks: {
    brand?: string;
    processor?: string;
    ram?: string;
    storage?: string;
    color?: string;
    category?: string;
    subCategory?: string;
    region?: string;
    condition?: string;
  } = {}
): string => {
  // Helper to safely retrieve a code from a mapping object or default to an empty string
  const getAttrCode = (val?: string, codes?: { [key: string]: string }, segmentType?: keyof typeof customSegmentFallbacks) => {
    if (!val) return '';
    if (codes && codes[val]) return codes[val];

    // Use custom fallback if provided for this segment type
    if (segmentType && customSegmentFallbacks[segmentType]) {
      return customSegmentFallbacks[segmentType]!; // Assert non-null as we checked for existence
    }
    // Fallback: Sanitized segment of the attribute name (first 3 alphanumeric characters)
    // This ensures a code is returned even if the template mapping is incomplete.
    return val.replace(/[^a-zA-Z0-9]/g, '').substring(0, 3).toUpperCase();
  };

  const b = getAttrCode(brand || template.brand, template.brandCodes, 'brand');
  const cat = getAttrCode(category || template.category, template.categoryCodes, 'category');
  const subCat = getAttrCode(subCategory || template.subCategory, template.subCategoryCodes, 'subCategory');
  const p = getAttrCode(processor, template.Variant?.processorCodes, 'processor');
  const rm = getAttrCode(ram, template.Variant?.ramCodes, 'ram');
  const s = getAttrCode(storage, template.Variant?.storageCodes, 'storage');
  const c = getAttrCode(color, template.Variant?.colorCodes, 'color');
  const r = getAttrCode(region, template.Variant?.regionCodes, 'region');
  const cond = getAttrCode(condition, template.Variant?.conditionCodes, 'condition');
  
  // Construct segments based on exclusion list
  const segments = [
    !excludeSegments.includes('brand') ? b : '',
    !excludeSegments.includes('category') ? cat : '',
    !excludeSegments.includes('subCategory') ? subCat : '',
    template.shortModel,
    !excludeSegments.includes('processor') ? p : '',
    !excludeSegments.includes('ram') ? rm : '',
    !excludeSegments.includes('storage') ? s : '',
    !excludeSegments.includes('color') ? c : '',
    !excludeSegments.includes('region') ? r : '',
    !excludeSegments.includes('condition') ? cond : ''
  ].filter(Boolean); // Removes empty segments to prevent double hyphens

  return segments.join(separator).toUpperCase().replace(/\s+/g, '');
};

/**
 * Finds the indices of attributes with duplicate names.
 * Used for real-time validation to highlight problematic inputs in the UI.
 */
export const findDuplicateAttributeIndices = (attributes: ProductAttribute[]): number[] => {
    const nameMap: Record<string, number[]> = {};
    attributes.forEach((attr, index) => {
        const name = attr.name.trim().toLowerCase();
        if (!name) return;
        if (!nameMap[name]) nameMap[name] = [];
        nameMap[name].push(index);
    });
    return Object.values(nameMap).filter(indices => indices.length > 1).flat();
};

/**
 * Default attribute names for different product categories.
 * Used to pre-populate the attribute builder in the Product form.
 */
export const CATEGORY_ATTRIBUTE_TEMPLATES: Record<string, string[]> = {
    'Mobile Phones': ['Battery Health', 'Screen Condition', 'Face ID Status', 'Network Status', 'Camera Condition'],
    'Tablets': ['Battery Health', 'Screen Condition', 'Pencil Support', 'Keyboard Support'],
    'Laptops': ['Battery Health', 'Keyboard Layout', 'Screen Condition', 'OS Version', 'Cycle Count'],
    'Watches': ['Battery Health', 'Strap Condition', 'Sensor Status'],
    'Accessories': ['Warranty Status', 'Compatibility'],
    'Audio': ['Battery Health', 'Noise Cancellation', 'Connection Status'],
    'Computing': ['Form Factor', 'Cooling System', 'Power Supply'],
};

/**
 * Flattened list of all unique attribute names across all category templates.
 */
export const ALL_COMMON_ATTRIBUTES = Array.from(new Set(Object.values(CATEGORY_ATTRIBUTE_TEMPLATES).flat()));

/**
 * Pre-defined suggested values for specific attribute names.
 */
export const COMMON_ATTRIBUTE_VALUES: Record<string, string[]> = {
    'Battery Health': ['100%', '95%', '90%', '85%', '80%', 'Service'],
    'Screen Condition': ['Original', 'Refurbished', 'Minor Scratches', 'Cracked'],
    'Keyboard Layout': ['US English', 'UK English', 'Arabic', 'French', 'Japanese'],
    'Warranty Status': ['Active', 'Expired', 'AppleCare+', '3 Months Shop Warranty'],
    'OS Version': ['iOS 17', 'iOS 18', 'macOS Sonoma', 'Windows 11 Pro', 'Android 14'],
    'Network Status': ['Unlocked', 'Carrier Locked', 'iCloud Clean', 'MDM Locked'],
};

/**
 * Generates a consistent ID for attribute value datalists.
 */
export const getAttributeValueListId = (name: string) => `values-for-${name.trim().toLowerCase().replace(/[^a-z0-9]/g, '-')}`;

/**
 * Aggregates all attribute values from existing products and returns the most frequent ones.
 */
export const getMostUsedAttributeValues = (products: any[]): Record<string, string[]> => {
    const valueCounts: Record<string, Record<string, number>> = {};

    products.forEach(p => {
        if (!Array.isArray(p.attributes)) return;

        p.attributes.forEach((attr: ProductAttribute) => {
            const name = attr.name?.trim();
            const value = attr.value?.trim();
            if (!name || !value) return; // Ignore empty values

            if (!valueCounts[name]) valueCounts[name] = {};
            valueCounts[name][value] = (valueCounts[name][value] || 0) + 1;
        });
    });

    const result: Record<string, string[]> = {};
    Object.entries(valueCounts).forEach(([name, counts]) => {
        result[name] = Object.entries(counts)
            .sort((a, b) => b[1] - a[1]) // Rank by frequency
            .slice(0, 5) // Return top 5 suggestions
            .map(([val]) => val);
    });

    return result;
};

/**
 * Checks if a template exists for the given category name.
 */
export const hasCategoryTemplate = (categoryName: string): boolean => {
    return !!CATEGORY_ATTRIBUTE_TEMPLATES[categoryName];
};

/**
 * Returns default attribute objects for a given category name.
 */
export const getDefaultAttributesForCategory = (categoryName: string): ProductAttribute[] => {
    const names = CATEGORY_ATTRIBUTE_TEMPLATES[categoryName];
    if (!names) return [];
    return names.map(name => ({ name, value: '', description: '' }));
};

/**
 * Validates individual attribute values based on their names.
 * Returns a map of index to error message.
 */
export const getAttributeValidationErrors = (attributes: ProductAttribute[]): Record<number, string> => {
    const errors: Record<number, string> = {};
    attributes.forEach((attr, index) => {
        const name = attr.name.trim();
        const value = attr.value.trim();
        
        if (name === 'Battery Health' && value !== '') {
            const numericValue = parseFloat(value.replace('%', ''));
            if (isNaN(numericValue) || numericValue < 0 || numericValue > 100) {
                errors[index] = "Must be 0-100%";
            }
        }
    });
    return errors;
};
