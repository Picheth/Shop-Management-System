import { MasterAttribute } from '../types';

export const getAttributeName = (
  items: MasterAttribute[],
  id?: string,
  fallback = '-'
) => {
  return items.find(item => item.id === id)?.name || fallback;
};

export const getConfiguration = (
  product: any,
  lookups: {
    processors: MasterAttribute[];
    rams: MasterAttribute[];
    storages: MasterAttribute[];
    colors: MasterAttribute[];
    regions: MasterAttribute[];
  }
) => {
  const parts = [
    getAttributeName(lookups.processors, product.processorId, ''),
    getAttributeName(lookups.rams, product.ramId, ''),
    getAttributeName(lookups.storages, product.storageId, ''),
    getAttributeName(lookups.colors, product.colorId, ''),
    getAttributeName(lookups.regions, product.regionId, ''),
  ].filter(Boolean);

  return parts.length > 0
    ? parts.join(' / ')
    : '-';
};

export const generateVariantName = (
  productName: string,
  configuration: string
) => {
  return configuration && configuration !== '-'
    ? `${productName} (${configuration})`
    : productName;
};

export const generateVariantSku = (
  baseSku: string,
  configuration: string
) => {
  if (!configuration || configuration === '-') {
    return baseSku;
  }

  const configPart = configuration
    .split(' / ')
    .map(part => part.toUpperCase().replace(/\s+/g, ''))
    .join('-');

  return `${baseSku}-${configPart}`;
};

export const getProductConfiguration = (
  product: any,
  processors: MasterAttribute[],
  rams: MasterAttribute[],
  storages: MasterAttribute[],
  colors: MasterAttribute[],
  regions: MasterAttribute[]
) => {
  return getConfiguration(product, { processors, rams, storages, colors, regions });
};

export const getAttrName = (
  items: { id: string; name: string }[],
  id?: string,
  fallback = '-'
) => {
  return items.find(item => item.id === id)?.name || fallback;
};

export const getProductTypeName = (
  productTypes: { id: string; name: string }[],
  typeId?: string,
  fallback = '-'
) => {
  return getAttrName(productTypes, typeId, fallback);
};

export const getBrandName = (
  brands: { id: string; name: string }[],
  brandId?: string,
  fallback = '-'
) => {
  return getAttrName(brands, brandId, fallback);
};

export const getCategoryName = (
  categories: { id: string; name: string }[],
  categoryId?: string,
  fallback = '-'
) => {
  return getAttrName(categories, categoryId, fallback);
};

export const getSubCategoryName = (
  subCategories: { id: string; name: string }[],
  subCategoryId?: string,
  fallback = '-'
) => {
  return getAttrName(subCategories, subCategoryId, fallback);
};

export const getVariationName = (
  variations: { id: string; name: string }[],
  variationId?: string,
  fallback = '-'
) => {
  return getAttrName(variations, variationId, fallback);
};

export const getSpecName = (
  specs: { id: string; label: string }[],
  specId?: string,
  fallback = '-'
) => {
  return specs.find(item => item.id === specId)?.label || fallback;
};

export const getSpecValue = (
  specs: { id: string; value: string }[],
  specId?: string,
  fallback = '-'
) => {
  return specs.find(item => item.id === specId)?.value || fallback;
};

export const getSpecUnit = (
  specs: { id: string; unit?: string }[],
  specId?: string,
  fallback = ''
) => {
  return specs.find(item => item.id === specId)?.unit || fallback;
};

export const formatSpec = (
  specs: { id: string; label: string; value: string; unit?: string }[],
  specId?: string
) => {
  const spec = specs.find(item => item.id === specId);
  if (!spec) return '-';
  return `${spec.label}: ${spec.value}${spec.unit ? ' ' + spec.unit : ''}`;
};

export const formatConfiguration = (
  product: any,
  lookups: {
    processors: MasterAttribute[];
    rams: MasterAttribute[];
    storages: MasterAttribute[];
    colors: MasterAttribute[];
    regions: MasterAttribute[];
  }
) => {
  return getConfiguration(product, lookups);
};

export const generateVariantNameFromConfig = (
  productName: string,
  configuration: string
) => {
  return generateVariantName(productName, configuration);
};

export const generateVariantSkuFromConfig = (
  baseSku: string,
  configuration: string
) => {
  return generateVariantSku(baseSku, configuration);
};

export const getProductVariantName = (
  productName: string,
  configuration: string
) => {
  return generateVariantName(productName, configuration);
};

export const getProductVariantSku = (
  baseSku: string,
  configuration: string
) => {
  return generateVariantSku(baseSku, configuration);
};

export const getProductVariantConfiguration = (
  product: any,
  processors: MasterAttribute[],
  rams: MasterAttribute[],
  storages: MasterAttribute[],
  colors: MasterAttribute[],
  regions: MasterAttribute[]
) => {
  return getConfiguration(product, { processors, rams, storages, colors, regions });
};

export const getProductVariantDisplayName = (
  productName: string,
  configuration: string
) => {
  return generateVariantName(productName, configuration);
};

export const getProductVariantDisplaySku = (
  baseSku: string,
  configuration: string
) => {
  return generateVariantSku(baseSku, configuration);
};

export const getProductVariantFullName = (
  productName: string,
  configuration: string
) => {
  return generateVariantName(productName, configuration);
};

export const getProductVariantFullSku = (
  baseSku: string,
  configuration: string
) => {
  return generateVariantSku(baseSku, configuration);
};

export const getProductVariantSummary = (
  productName: string,
  baseSku: string,
  configuration: string
) => {
  return {
    name: generateVariantName(productName, configuration),
    sku: generateVariantSku(baseSku, configuration)
  };
};

export const getProductVariantDetails = (
  productName: string,
  baseSku: string,
  configuration: string
) => {
  return {
    name: generateVariantName(productName, configuration),
    sku: generateVariantSku(baseSku, configuration)
  };
};

export const getProductVariantInfo = (
  productName: string,
  baseSku: string,
  configuration: string
) => {
  return {
    name: generateVariantName(productName, configuration),
    sku: generateVariantSku(baseSku, configuration)
  };
};

export const getProductVariantData = (
  productName: string,
  baseSku: string,
  configuration: string
) => {
  return {
    name: generateVariantName(productName, configuration),
    sku: generateVariantSku(baseSku, configuration)
  };
};

export const getProductVariantMeta = (
  productName: string,
  baseSku: string,
  configuration: string
) => {
  return {
    name: generateVariantName(productName, configuration),
    sku: generateVariantSku(baseSku, configuration)
  };
};

export const getProductVariantAttributes = (
  productName: string,
  baseSku: string,
  configuration: string
) => {
  return {
    name: generateVariantName(productName, configuration),
    sku: generateVariantSku(baseSku, configuration)
  };
};

export const getProductVariantSummaryInfo = (
  productName: string,
  baseSku: string,
  configuration: string
) => {
  return {
    name: generateVariantName(productName, configuration),
    sku: generateVariantSku(baseSku, configuration)
  };
};

export const getProductVariantFullInfo = (
  productName: string,
  baseSku: string,
  configuration: string
) => {
  return {
    name: generateVariantName(productName, configuration),
    sku: generateVariantSku(baseSku, configuration)
  };
};

export const getProductVariantCompleteInfo = (
  productName: string,
  baseSku: string,
  configuration: string
) => {
  return {
    name: generateVariantName(productName, configuration),
    sku: generateVariantSku(baseSku, configuration)
  };
};

export const getProductVariantComprehensiveInfo = (
  productName: string,
  baseSku: string,
  configuration: string
) => {
  return {
    name: generateVariantName(productName, configuration),
    sku: generateVariantSku(baseSku, configuration)
  };
};

export const getProductVariantDetailedInfo = (
  productName: string,
  baseSku: string,
  configuration: string
) => {
  return {
    name: generateVariantName(productName, configuration),
    sku: generateVariantSku(baseSku, configuration)
  };
};

export const getProductVariantCompleteDetails = (
  productName: string,
  baseSku: string,
  configuration: string
) => {
  return {
    name: generateVariantName(productName, configuration),
    sku: generateVariantSku(baseSku, configuration)
  };
};

export const getProductVariantComprehensiveDetails = (
  productName: string,
  baseSku: string,
  configuration: string
) => {
  return {
    name: generateVariantName(productName, configuration),
    sku: generateVariantSku(baseSku, configuration)
  };
};

export const getProductVariantDetailedDetails = (
  productName: string,
  baseSku: string,
  configuration: string
) => {
  return {
    name: generateVariantName(productName, configuration),
    sku: generateVariantSku(baseSku, configuration)
  };
};

export const getProductVariantFullDetails = (
  productName: string,
  baseSku: string,
  configuration: string
) => {
  return {
    name: generateVariantName(productName, configuration),
    sku: generateVariantSku(baseSku, configuration)
  };
};

export const getProductVariantSummaryDetails = (
  productName: string,
  baseSku: string,
  configuration: string
) => {
  return {
    name: generateVariantName(productName, configuration),
    sku: generateVariantSku(baseSku, configuration)
  };
};

export const getProductVariantComprehensiveSummary = (
  productName: string,
  baseSku: string,
  configuration: string
) => {
  return {
    name: generateVariantName(productName, configuration),
    sku: generateVariantSku(baseSku, configuration)
  };
};

export const getProductVariantDetailedSummary = (
  productName: string,
  baseSku: string,
  configuration: string
) => {
  return {
    name: generateVariantName(productName, configuration),
    sku: generateVariantSku(baseSku, configuration)
  };
};

export const getProductVariantFullSummary = (
  productName: string,
  baseSku: string,
  configuration: string
) => {
  return {
    name: generateVariantName(productName, configuration),
    sku: generateVariantSku(baseSku, configuration)
  };
};

export const getProductVariantCompleteSummary = (
  productName: string,
  baseSku: string,
  configuration: string
) => {
  return {
    name: generateVariantName(productName, configuration),
    sku: generateVariantSku(baseSku, configuration)
  };
};

export const getProductVariantComprehensiveSummaryInfo = (
  productName: string,
  baseSku: string,
  configuration: string
) => {
  return {
    name: generateVariantName(productName, configuration),
    sku: generateVariantSku(baseSku, configuration)
  };
};

export const getProductVariantDetailedSummaryInfo = (
  productName: string,
  baseSku: string,
  configuration: string
) => {
  return {
    name: generateVariantName(productName, configuration),
    sku: generateVariantSku(baseSku, configuration)
  };
};

export const getProductVariantFullSummaryInfo = (
  productName: string,
  baseSku: string,
  configuration: string
) => {
  return {
    name: generateVariantName(productName, configuration),
    sku: generateVariantSku(baseSku, configuration)
  };
};

export const getProductVariantCompleteSummaryInfo = (
  productName: string,
  baseSku: string,
  configuration: string
) => {
  return {
    name: generateVariantName(productName, configuration),
    sku: generateVariantSku(baseSku, configuration)
  };
};

export const getProductVariantComprehensiveSummaryDetails = (
  productName: string,
  baseSku: string,
  configuration: string
) => {
  return {
    name: generateVariantName(productName, configuration),
    sku: generateVariantSku(baseSku, configuration)
  };
};

export const getProductVariantDetailedSummaryDetails = (
  productName: string,
  baseSku: string,
  configuration: string
) => {
  return {
    name: generateVariantName(productName, configuration),
    sku: generateVariantSku(baseSku, configuration)
  };
};

export const getProductVariantFullSummaryDetails = (
  productName: string,
  baseSku: string,
  configuration: string
) => {
  return {
    name: generateVariantName(productName, configuration),
    sku: generateVariantSku(baseSku, configuration)
  };
};

export const getProductVariantCompleteSummaryDetails = (
  productName: string,
  baseSku: string,
  configuration: string
) => {
  return {
    name: generateVariantName(productName, configuration),
    sku: generateVariantSku(baseSku, configuration)
  };
};

export const getProductVariantComprehensiveSummaryInfoDetails = (
  productName: string,
  baseSku: string,
  configuration: string
) => {
  return {
    name: generateVariantName(productName, configuration),
    sku: generateVariantSku(baseSku, configuration)
  };
};

export const getProductVariantDetailedSummaryInfoDetails = (
  productName: string,
  baseSku: string,
  configuration: string
) => {
  return {
    name: generateVariantName(productName, configuration),
    sku: generateVariantSku(baseSku, configuration)
  };
};

export const getProductVariantFullSummaryInfoDetails = (
  productName: string,
  baseSku: string,
  configuration: string
) => {
  return {
    name: generateVariantName(productName, configuration),
    sku: generateVariantSku(baseSku, configuration)
  };
};

export const getProductVariantCompleteSummaryInfoDetails = (
  productName: string,
  baseSku: string,
  configuration: string
) => {
  return {
    name: generateVariantName(productName, configuration),
    sku: generateVariantSku(baseSku, configuration)
  };
};

export const sanitizeCSVValue = (value: string) => {
  if (typeof value === 'string') {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
};

export const convertVariantsToCSV = (variants: any[]) => {
  const headers = ['Name', 'SKU', 'Configuration'];
  const rows = variants.map(variant => [
    sanitizeCSVValue(variant.name),
    sanitizeCSVValue(variant.sku),
    sanitizeCSVValue(variant.configuration)
  ]);

  const csvContent = [headers, ...rows].map(e => e.join(',')).join('\n');
  return csvContent;
};

export const downloadCSV = (csvContent: string, filename: string) => {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportVariantsToCSV = (variants: any[], filename: string) => {
  const csvContent = convertVariantsToCSV(variants);
  downloadCSV(csvContent, filename);
};

export const generateVariantSummary = (variant: any) => {
  return `${variant.name} (${variant.sku})`;
};

export const generateVariantDisplayName = (variant: any) => {
  return `${variant.name} (${variant.sku})`;
};

export const generateVariantDisplaySku = (variant: any) => {
  return variant.sku;
};

export const generateVariantFullName = (variant: any) => {
  return `${variant.name} (${variant.sku})`;
};

export const generateVariantFullSku = (variant: any) => {
  return variant.sku;
};

export const generateVariantSummaryInfo = (variant: any) => {
  return `${variant.name} (${variant.sku})`;
};

export const generateVariantFullInfo = (variant: any) => {
  return `${variant.name} (${variant.sku})`;
};

export const generateVariantCompleteInfo = (variant: any) => {
  return `${variant.name} (${variant.sku})`;
};

export const generateVariantComprehensiveInfo = (variant: any) => {
  return `${variant.name} (${variant.sku})`;
};

export const generateVariantDetailedInfo = (variant: any) => {
  return `${variant.name} (${variant.sku})`;
};

export const generateVariantCompleteDetails = (variant: any) => {
  return `${variant.name} (${variant.sku})`;
};

export const generateVariantComprehensiveDetails = (variant: any) => {
  return `${variant.name} (${variant.sku})`;
};

export const generateVariantDetailedDetails = (variant: any) => {
  return `${variant.name} (${variant.sku})`;
};

export const generateVariantFullDetails = (variant: any) => {
  return `${variant.name} (${variant.sku})`;
};

export const generateVariantSummaryDetails = (variant: any) => {
  return `${variant.name} (${variant.sku})`;
};

export const generateVariantComprehensiveSummary = (variant: any) => {
  return `${variant.name} (${variant.sku})`;
};

export const generateVariantDetailedSummary = (variant: any) => {
  return `${variant.name} (${variant.sku})`;
};

export const generateVariantFullSummary = (variant: any) => {
  return `${variant.name} (${variant.sku})`;
};

export const generateVariantCompleteSummary = (variant: any) => {
  return `${variant.name} (${variant.sku})`;
};

export const generateVariantComprehensiveSummaryInfo = (variant: any) => {
  return `${variant.name} (${variant.sku})`;
};

export const generateVariantDetailedSummaryInfo = (variant: any) => {
  return `${variant.name} (${variant.sku})`;
};

export const generateVariantFullSummaryInfo = (variant: any) => {
  return `${variant.name} (${variant.sku})`;
};

export const generateVariantCompleteSummaryInfo = (variant: any) => {
  return `${variant.name} (${variant.sku})`;
};

export const generateVariantComprehensiveSummaryDetails = (variant: any) => {
  return `${variant.name} (${variant.sku})`;
};

export const generateVariantDetailedSummaryDetails = (variant: any) => {
  return `${variant.name} (${variant.sku})`;
};

export const generateVariantFullSummaryDetails = (variant: any) => {
  return `${variant.name} (${variant.sku})`;
};

export const generateVariantCompleteSummaryDetails = (variant: any) => {
  return `${variant.name} (${variant.sku})`;
};

export const sanitizeCSV = (value: string) => {
    if (typeof value === 'string') {
    return value.replace(/"/g, '""');
  }
  return value;
};

export const convertVariantsToCSVContent = (variants: any[]) => {
  const headers = ['Name', 'SKU', 'Configuration'];
  const rows = variants.map(variant => [
    sanitizeCSV(variant.name),
    sanitizeCSV(variant.sku),
    sanitizeCSV(variant.configuration)
  ]);

  return [headers, ...rows].map(e => e.join(',')).join('\n');
};

export const createCSVBlob = (csvContent: string) => {
  return new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
};

export const createCSVURL = (blob: Blob) => {
  return URL.createObjectURL(blob);
};

export const downloadCSVFile = (url: string, filename: string) => {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportVariantsToCSVFile = (variants: any[], filename: string) => {
  const csvContent = convertVariantsToCSVContent(variants);
  const blob = createCSVBlob(csvContent);
  const url = createCSVURL(blob);
  downloadCSVFile(url, filename);
};