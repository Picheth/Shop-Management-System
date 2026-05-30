// Auto-generated from productSpecs.json
export interface ProductTemplate {
  sku?: string;
  templateId: string;
  name: string;
  brand: string;
  type: string;
  category: string;
  subCategory: string;
  shortModel: string;
  model: string;
  processors?: string[];
  processorCodes?: { [key: string]: string };
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
  status: string;
  displaySize?: string; // Added for Tablets and Laptops
}

import productData from './productSpecs.json';

const rawTemplates: any[] = [
  ...(productData.MobilePhoneModels ?? []),
  ...(productData.TabletModels ?? []),
  ...(productData.LaptopModels ?? []),
  ...(productData.WatchModels ?? []),
  ...(productData.AccessoryModels ?? []),
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
  storage?: string,
  color?: string,
  region?: string,
  condition?: string,
  ram?: string,
  processor?: string,
  separator: string = '-',
  excludeSegments: string[] = [],
  // New parameter for custom fallbacks per segment type
  customSegmentFallbacks: {
    processor?: string;
    ram?: string;
    storage?: string;
    color?: string;
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

  const p = getAttrCode(processor, template.processorCodes, 'processor');
  const rm = getAttrCode(ram, template.ramCodes, 'ram');
  const s = getAttrCode(storage, template.storageCodes, 'storage');
  const c = getAttrCode(color, template.colorCodes, 'color');
  const r = getAttrCode(region, template.regionCodes, 'region');
  const cond = getAttrCode(condition, template.conditionCodes, 'condition');
  
  // Construct segments based on exclusion list
  const segments = [
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
