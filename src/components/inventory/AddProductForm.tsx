import React, { useMemo, useState } from 'react';
import {
  DataProduct,
  Branch,
  ProductType as ProductTypeInterface,
  Category as CategoryInterface,
  SubCategory as SubCategoryInterface,
  Brand as BrandInterface,
  ProductAttribute,
  MasterAttribute,
} from '../../types';

import {
  productTemplates,
  ProductTemplate,
  generateSku,
} from '../../Types/ProductSpecs';

import FormInput from '../ui/FormInput';
import FormSelect from '../ui/FormSelect';

import { useDuplicateValidation } from '../settings/useDuplicateValidation';
import { useFormValidation } from '../settings/useFormValidation';

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

  attributes: ProductAttribute[];

  description: string;
};

interface AddProductFormProps {
  onSubmit: (data: AddProductFormData) => void;
  onCancel: () => void;

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
      sku: /^[A-Z0-9-_]+$/i,
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
        selectedTemplate.processors?.includes(p.name)
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
      (c) => c.name === template.category
    );

    const brand = existingBrands.find(
      (b) => b.name === template.brand
    );

    const productType = existingProductTypes.find(
      (pt) => pt.name === template.type
    );

    const subCategory = existingSubCategories.find(
      (sc) => sc.name === template.subCategory
    );

    setForm((prev) => ({
      ...prev,

      name: template.name,

      brandId: brand?.id || '',
      categoryId: category?.id || '',
      typeId: productType?.id || '',
      subCategoryId: subCategory?.id || '',

      model: template.model,
      displaySize: template.displaySize || '',

      storageId: '',
      ramId: '',
      colorId: '',
      processorId: '',
      regionId: '',
      conditionId: '',
    }));
  };

  const handleChange = (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLTextAreaElement>
      | React.ChangeEvent<HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    let newValue: any = value;

    if (type === 'checkbox') {
      newValue = (e.target as HTMLInputElement).checked;
    }

    if (type === 'number') {
      newValue = value === '' ? 0 : Number(value);
    }

    setForm((prev) => {
      const updated = {
        ...prev,
        [name]: newValue,
      };

      if (name === 'typeId') {
        updated.categoryId = '';
        updated.subCategoryId = '';
      }

      if (name === 'categoryId') {
        updated.subCategoryId = '';
      }

      if (
        [
          'storageId',
          'ramId',
          'colorId',
          'conditionId',
          'processorId',
          'regionId',
        ].includes(name)
      ) {
        updated.sku = updateGeneratedSku(updated);
      }

      return updated;
    });
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

    if (
      isSkuValidating ||
      isSkuDuplicate ||
      isInvalid
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

            <FormInput
              label="SKU"
              name="sku"
              value={form.sku}
              onChange={handleChange}
              isValidating={isSkuValidating}
              isDuplicate={isSkuDuplicate}
              error={fieldErrors.sku}
              required
            />

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
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-sky-600">
              Dynamic Attributes
            </h3>

            <button
              type="button"
              onClick={handleAddAttribute}
              className="bg-sky-600 text-white px-3 py-1 rounded-md text-sm"
            >
              Add Attribute
            </button>
          </div>

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
                    onChange={(e) =>
                      handleAttributeChange(
                        index,
                        'name',
                        e.target.value
                      )
                    }
                  />
                </div>

                <div className="flex-1">
                  <FormInput
                    placeholder="Attribute Value"
                    value={attr.value}
                    onChange={(e) =>
                      handleAttributeChange(
                        index,
                        'value',
                        e.target.value
                      )
                    }
                  />
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
            isSkuDuplicate ||
            isInvalid
          }
          className="bg-sky-600 text-white px-4 py-2 rounded-md"
        >
          {isSkuValidating
            ? 'Checking...'
            : 'Save Product'}
        </button>
      </div>
    </form>
  );
};

export default AddProductForm;