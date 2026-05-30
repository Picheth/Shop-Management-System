import React, {
  useMemo,
  useState,
} from 'react';

import Placeholder from '../ui/Placeholder';

import {
  ProductType as ProductTypeInterface,
  Category as CategoryInterface,
  SubCategory as SubCategoryInterface,
  Brand as BrandInterface,
  Variation as VariationInterface,
  ToastType as ToastKind,
} from '../../types';
import { useDuplicateValidation } from './useDuplicateValidation';

interface ProductAttributesProps {
  productTypes: ProductTypeInterface[];
  categories: CategoryInterface[];
  subCategories: SubCategoryInterface[];
  brands: BrandInterface[];
  variations: VariationInterface[];

  onAddProductType: (
    newType: Omit<ProductTypeInterface, 'id' | 'createdAt' | 'updatedAt'>
  ) => Promise<void>;

  onUpdateProductType: (
    updatedType: ProductTypeInterface
  ) => Promise<void>;

  onDeleteProductType: (id: string) => Promise<void>;

  onAddCategory: (
    newCategory: Omit<CategoryInterface, 'id' | 'createdAt' | 'updatedAt'>
  ) => Promise<void>;

  onUpdateCategory: (
    updatedCategory: CategoryInterface
  ) => Promise<void>;

  onDeleteCategory: (id: string) => Promise<void>;

  onAddSubCategory: (
    newSubCategory: Omit<
      SubCategoryInterface,
      'id' | 'createdAt' | 'updatedAt'
    >
  ) => Promise<void>;

  onUpdateSubCategory: (
    updatedSubCategory: SubCategoryInterface
  ) => Promise<void>;

  onDeleteSubCategory: (id: string) => Promise<void>;

  onAddBrand: (
    newBrand: Omit<BrandInterface, 'id' | 'createdAt' | 'updatedAt'>
  ) => Promise<void>;

  onUpdateBrand: (
    updatedBrand: BrandInterface
  ) => Promise<void>;

  onDeleteBrand: (id: string) => Promise<void>;

  onAddVariation: (
    newVariation: Omit<
      VariationInterface,
      'id' | 'createdAt' | 'updatedAt'
    >
  ) => Promise<void>;

  onUpdateVariation: (
    updatedVariation: VariationInterface
  ) => Promise<void>;

  onDeleteVariation: (id: string) => Promise<void>;

  refreshMasterData: () => void;

  showToast: (
    message: string,
    type: ToastKind
  ) => void;

  setIsGlobalLoading: React.Dispatch<
    React.SetStateAction<boolean>
  >;
}

type Tab =
  | 'Product Types'
  | 'Categories'
  | 'Subcategories'
  | 'Brands'
  | 'Variations';

const ProductAttributes: React.FC<ProductAttributesProps> = ({
  productTypes,
  categories,
  subCategories,
  brands,
  variations,

  onAddProductType,
  onUpdateProductType,
  onDeleteProductType,

  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,

  onAddSubCategory,
  onUpdateSubCategory,
  onDeleteSubCategory,

  onAddBrand,
  onUpdateBrand,
  onDeleteBrand,

  onAddVariation,
  onUpdateVariation,
  onDeleteVariation,

  refreshMasterData,
  showToast,
  setIsGlobalLoading,
}) => {
  const [activeTab, setActiveTab] =
    useState<Tab>('Product Types');

  const inputClasses =
    'w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500';

  const tabButtonClasses = (tabName: Tab) =>
    `px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
      activeTab === tabName
        ? 'bg-white dark:bg-gray-800 text-sky-600 border-b-2 border-sky-600'
        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
    }`;

  // =========================================================
  // PRODUCT TYPE TAB
  // =========================================================

  const ProductTypeTab: React.FC = () => {
    const [search, setSearch] = useState('');
    const [editingId, setEditingId] =
      useState<string | null>(null);

    const [form, setForm] = useState({
      code: '',
      name: '',
      description: '',
      active: true,
    });

    const { isDuplicate, isValidating } = useDuplicateValidation('product_types', 'code', form.code, editingId);

    const filteredProductTypes = useMemo(() => {
      if (!search) return productTypes;

      const term = search.toLowerCase();

      return productTypes.filter(
        (type) =>
          type.code.toLowerCase().includes(term) ||
          type.name.toLowerCase().includes(term) ||
          (type.description || '')
            .toLowerCase()
            .includes(term)
      );
    }, [search, productTypes]);

    const handleChange = (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement
      >
    ) => {
      const { name, value } = e.target;

      setForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    };

    const resetForm = () => {
      setEditingId(null);

      setForm({
        code: '',
        name: '',
        description: '',
        active: true,
      });
    };

    const handleSubmit = async (
      e: React.FormEvent
    ) => {
      e.preventDefault();

      if (isDuplicate) {
        showToast(`Product type code "${form.code}" already exists.`, 'error');
        return;
      }

      try {
        if (editingId) {
          await onUpdateProductType({
            id: editingId,
            ...form,
            updatedAt: new Date().toISOString(),
          });
        } else {
          await onAddProductType(form);
        }

        resetForm();
        refreshMasterData();
      } catch (error) {
        console.error(error);

        showToast(
          'Failed to save product type',
          'error'
        );
      }
    };

    return (
      <>
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search product types..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            className={inputClasses}
          />
        </div>

        <form
          onSubmit={handleSubmit}
          className="card mb-4"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">
              {editingId
                ? 'Edit Product Type'
                : 'Add Product Type'}
            </h3>

            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="text-sm text-red-500"
              >
                Cancel
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              name="code"
              placeholder="Type Code"
              value={form.code}
              onChange={handleChange}
              className={`${inputClasses} ${isDuplicate ? 'border-red-500 focus:ring-red-500' : ''}`}
              required
            />

            <input
              type="text"
              name="name"
              placeholder="Type Name"
              value={form.name}
              onChange={handleChange}
              className={inputClasses}
              required
            />
          </div>

          <textarea
            name="description"
            placeholder="Description"
            value={form.description}
            onChange={handleChange}
            className={`${inputClasses} mt-4 h-24`}
          />

          <div className="flex justify-end mt-4">
            <button
              type="submit"
              disabled={isValidating || isDuplicate}
              className="btn-primary disabled:opacity-50"
            >
              {isValidating ? 'Checking...' : isDuplicate ? 'Code Exists' : editingId ? 'Update' : 'Add'}
            </button>
          </div>
        </form>

        <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
          <table className="min-w-full bg-white dark:bg-gray-800">
            <thead>
              <tr>
                <th>Code</th>
                <th>Name</th>
                <th>Description</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredProductTypes.length > 0 ? (
                filteredProductTypes.map((type) => (
                  <tr key={type.id}>
                    <td className="px-4 py-3 text-sm">{type.code}</td>
                    <td className="px-4 py-3 text-sm">{type.name}</td>
                    <td className="px-4 py-3 text-sm">
                      {type.description || 'N/A'}
                    </td>

                    <td className="px-4 py-3 text-center">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          type.active
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {type.active
                          ? 'Active'
                          : 'Inactive'}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => {
                            setEditingId(type.id);
                            setForm({
                              code: type.code,
                              name: type.name,
                              description:
                                type.description || '',
                              active: type.active,
                            });
                          }}
                          className="px-3 py-1 text-sm bg-amber-500 text-white rounded"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => {
                            if (window.confirm('Delete this product type?')) {
                              onDeleteProductType(type.id);
                            }
                          }}
                          className="px-3 py-1 text-sm bg-red-500 text-white rounded"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="text-center py-8 text-gray-500"
                  >
                    No product types found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </>
    );
  };

  // =========================================================
  // CATEGORY TAB
  // =========================================================

  const CategoryTab: React.FC = () => {
    const [search, setSearch] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);

    const [form, setForm] = useState({
      code: '',
      name: '',
      typeId: productTypes[0]?.id || '',
      description: '',
      active: true,
    });

    const { isDuplicate, isValidating } = useDuplicateValidation('categories', 'code', form.code, editingId);

    const typeMap = useMemo(() => {
      const map: Record<string, string> = {};
      productTypes.forEach((t) => {
        map[t.id] = t.name;
      });
      return map;
    }, []);

    const filteredCategories = useMemo(() => {
      const term = search.toLowerCase();
      if (!term) return categories;

      return categories.filter(
        (cat) =>
          cat.code.toLowerCase().includes(term) ||
          cat.name.toLowerCase().includes(term) ||
          (typeMap[cat.typeId] || '').toLowerCase().includes(term)
      );
    }, [search, categories, typeMap]);

    const handleChange = (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
      const { name, value } = e.target;
      setForm((prev) => ({ ...prev, [name]: value }));
    };

    const resetForm = () => {
      setEditingId(null);
      setForm({
        code: '',
        name: '',
        typeId: productTypes[0]?.id || '',
        description: '',
        active: true,
      });
    };

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();

      if (isDuplicate) {
        showToast(`Category code "${form.code}" already exists.`, 'error');
        return;
      }

      setIsGlobalLoading(true);
      try {
        if (editingId) {
          await onUpdateCategory({
            id: editingId,
            ...form,
            updatedAt: new Date().toISOString(),
          });
          showToast('Category updated successfully', 'success');
        } else {
          await onAddCategory(form);
          showToast('Category added successfully', 'success');
        }
        resetForm();
        refreshMasterData();
      } catch (error) {
        showToast('Failed to save category', 'error');
      } finally {
        setIsGlobalLoading(false);
      }
    };

    const handleDelete = async (id: string) => {
      if (!window.confirm('Delete this category?')) return;
      setIsGlobalLoading(true);
      try {
        await onDeleteCategory(id);
        showToast('Category deleted successfully', 'success');
        refreshMasterData();
      } catch (error) {
        showToast('Failed to delete category', 'error');
      } finally {
        setIsGlobalLoading(false);
      }
    };

    return (
      <>
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search categories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={inputClasses}
          />
        </div>

        <form onSubmit={handleSubmit} className="card mb-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">{editingId ? 'Edit Category' : 'Add Category'}</h3>
            {editingId && (
              <button type="button" onClick={resetForm} className="text-sm text-red-500">
                Cancel
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input name="code" placeholder="Code" value={form.code} onChange={handleChange} className={`${inputClasses} ${isDuplicate ? 'border-red-500 focus:ring-red-500' : ''}`} required />
            <input name="name" placeholder="Name" value={form.name} onChange={handleChange} className={inputClasses} required />
            <select name="typeId" value={form.typeId} onChange={handleChange} className={inputClasses} required>
              <option value="">Select Product Type</option>
              {productTypes.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
          <textarea name="description" placeholder="Description" value={form.description} onChange={handleChange} className={`${inputClasses} mt-4 h-24`} />
          <div className="flex justify-end mt-4">
            <button type="submit" disabled={isValidating || isDuplicate} className="btn-primary disabled:opacity-50">
              {isValidating ? 'Validating...' : isDuplicate ? 'Code Exists' : editingId ? 'Update' : 'Add'}
            </button>
          </div>
        </form>

        <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
          <table className="min-w-full bg-white dark:bg-gray-800">
            <thead>
              <tr><th>Code</th><th>Name</th><th>Type</th><th className="text-center">Status</th><th className="text-center">Actions</th></tr>
            </thead>
            <tbody>
              {filteredCategories.length > 0 ? (
                filteredCategories.map((cat) => (
                  <tr key={cat.id}>
                    <td className="px-4 py-3 text-sm">{cat.code}</td>
                    <td className="px-4 py-3 text-sm">{cat.name}</td>
                    <td className="px-4 py-3 text-sm">{typeMap[cat.typeId] || 'N/A'}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${cat.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{cat.active ? 'Active' : 'Inactive'}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex justify-center gap-2">
                        <button onClick={() => { setEditingId(cat.id); setForm({ code: cat.code, name: cat.name, typeId: cat.typeId, description: cat.description || '', active: cat.active }); }} className="px-3 py-1 text-sm bg-amber-500 text-white rounded">Edit</button>
                        <button onClick={() => handleDelete(cat.id)} className="px-3 py-1 text-sm bg-red-500 text-white rounded">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={5} className="text-center py-8 text-gray-500">No categories found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </>
    );
  };

  // =========================================================
  // SUBCATEGORY TAB
  // =========================================================

  const SubcategoryTab: React.FC = () => {
    const [search, setSearch] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);

    const [form, setForm] = useState({
      code: '',
      name: '',
      categoryId: categories[0]?.id || '',
      description: '',
      active: true,
    });

    const { isDuplicate, isValidating } = useDuplicateValidation('sub_categories', 'code', form.code, editingId);

    const categoryMap = useMemo(() => {
      const map: Record<string, string> = {};
      categories.forEach((c) => {
        map[c.id] = c.name;
      });
      return map;
    }, []);

    const filteredSubCategories = useMemo(() => {
      const term = search.toLowerCase();
      if (!term) return subCategories;

      return subCategories.filter(
        (sub) =>
          sub.code.toLowerCase().includes(term) ||
          sub.name.toLowerCase().includes(term) ||
          (categoryMap[sub.categoryId] || '').toLowerCase().includes(term)
      );
    }, [search, subCategories, categoryMap]);

    const handleChange = (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
      const { name, value } = e.target;
      setForm((prev) => ({ ...prev, [name]: value }));
    };

    const resetForm = () => {
      setEditingId(null);
      setForm({
        code: '',
        name: '',
        categoryId: categories[0]?.id || '',
        description: '',
        active: true,
      });
    };

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();

      if (isDuplicate) {
        showToast(`Subcategory code "${form.code}" already exists.`, 'error');
        return;
      }

      setIsGlobalLoading(true);
      try {
        if (editingId) {
          await onUpdateSubCategory({
            id: editingId,
            ...form,
            updatedAt: new Date().toISOString(),
          });
          showToast('Subcategory updated successfully', 'success');
        } else {
          await onAddSubCategory(form);
          showToast('Subcategory added successfully', 'success');
        }
        resetForm();
        refreshMasterData();
      } catch (error) {
        showToast('Failed to save subcategory', 'error');
      } finally {
        setIsGlobalLoading(false);
      }
    };

    const handleDelete = async (id: string) => {
      if (!window.confirm('Delete this subcategory?')) return;
      setIsGlobalLoading(true);
      try {
        await onDeleteSubCategory(id);
        showToast('Subcategory deleted successfully', 'success');
        refreshMasterData();
      } catch (error) {
        showToast('Failed to delete subcategory', 'error');
      } finally {
        setIsGlobalLoading(false);
      }
    };

    return (
      <>
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search subcategories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={inputClasses}
          />
        </div>

        <form onSubmit={handleSubmit} className="card mb-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">{editingId ? 'Edit Subcategory' : 'Add Subcategory'}</h3>
            {editingId && (
              <button type="button" onClick={resetForm} className="text-sm text-red-500">
                Cancel
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input name="code" placeholder="Code" value={form.code} onChange={handleChange} className={`${inputClasses} ${isDuplicate ? 'border-red-500 focus:ring-red-500' : ''}`} required />
            <input name="name" placeholder="Name" value={form.name} onChange={handleChange} className={inputClasses} required />
            <select name="categoryId" value={form.categoryId} onChange={handleChange} className={inputClasses} required>
              <option value="">Select Category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <textarea name="description" placeholder="Description" value={form.description} onChange={handleChange} className={`${inputClasses} mt-4 h-24`} />
          <div className="flex justify-end mt-4">
            <button type="submit" disabled={isValidating || isDuplicate} className="btn-primary disabled:opacity-50">
              {isValidating ? 'Validating...' : isDuplicate ? 'Code Exists' : editingId ? 'Update' : 'Add'}
            </button>
          </div>
        </form>

        <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
          <table className="min-w-full bg-white dark:bg-gray-800">
            <thead>
              <tr><th>Code</th><th>Name</th><th>Category</th><th className="text-center">Status</th><th className="text-center">Actions</th></tr>
            </thead>
            <tbody>
              {filteredSubCategories.length > 0 ? (
                filteredSubCategories.map((sub) => (
                  <tr key={sub.id}>
                    <td className="px-4 py-3 text-sm">{sub.code}</td>
                    <td className="px-4 py-3 text-sm">{sub.name}</td>
                    <td className="px-4 py-3 text-sm">{categoryMap[sub.categoryId] || 'N/A'}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${sub.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{sub.active ? 'Active' : 'Inactive'}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex justify-center gap-2">
                        <button onClick={() => { setEditingId(sub.id); setForm({ code: sub.code, name: sub.name, categoryId: sub.categoryId, description: sub.description || '', active: sub.active }); }} className="px-3 py-1 text-sm bg-amber-500 text-white rounded">Edit</button>
                        <button onClick={() => handleDelete(sub.id)} className="px-3 py-1 text-sm bg-red-500 text-white rounded">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={5} className="text-center py-8 text-gray-500">No subcategories found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </>
    );
  };

  // =========================================================
  // BRAND TAB
  // =========================================================

  const BrandTab: React.FC = () => {
    const [search, setSearch] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);

    const [form, setForm] = useState({
      code: '',
      name: '',
      shortName: '',
      country: '',
    });

    const { isDuplicate, isValidating } = useDuplicateValidation('brands', 'code', form.code, editingId);

    const filteredBrands = useMemo(() => {
      const term = search.toLowerCase();
      if (!term) return brands;

      return brands.filter(
        (b) =>
          b.code.toLowerCase().includes(term) ||
          b.name.toLowerCase().includes(term) ||
          (b.shortName || '').toLowerCase().includes(term) ||
          (b.country || '').toLowerCase().includes(term)
      );
    }, [search, brands]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setForm((prev) => ({ ...prev, [name]: value }));
    };

    const resetForm = () => {
      setEditingId(null);
      setForm({
        code: '',
        name: '',
        shortName: '',
        country: '',
      });
    };

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();

      if (isDuplicate) {
        showToast(`Brand code "${form.code}" already exists.`, 'error');
        return;
      }

      setIsGlobalLoading(true);
      try {
        if (editingId) {
          await onUpdateBrand({
            id: editingId,
            ...form,
            updatedAt: new Date().toISOString(),
          });
          showToast('Brand updated successfully', 'success');
        } else {
          await onAddBrand(form);
          showToast('Brand added successfully', 'success');
        }
        resetForm();
        refreshMasterData();
      } catch (error) {
        showToast('Failed to save brand', 'error');
      } finally {
        setIsGlobalLoading(false);
      }
    };

    const handleDelete = async (id: string) => {
      if (!window.confirm('Delete this brand?')) return;
      setIsGlobalLoading(true);
      try {
        await onDeleteBrand(id);
        showToast('Brand deleted successfully', 'success');
        refreshMasterData();
      } catch (error) {
        showToast('Failed to delete brand', 'error');
      } finally {
        setIsGlobalLoading(false);
      }
    };

    return (
      <>
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search brands..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={inputClasses}
          />
        </div>

        <form onSubmit={handleSubmit} className="card mb-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">{editingId ? 'Edit Brand' : 'Add Brand'}</h3>
            {editingId && (
              <button type="button" onClick={resetForm} className="text-sm text-red-500">Cancel</button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <input name="code" placeholder="Code" value={form.code} onChange={handleChange} className={`${inputClasses} ${isDuplicate ? 'border-red-500 focus:ring-red-500' : ''}`} required />
            <input name="name" placeholder="Name" value={form.name} onChange={handleChange} className={inputClasses} required />
            <input name="shortName" placeholder="Short Name" value={form.shortName} onChange={handleChange} className={inputClasses} />
            <input name="country" placeholder="Country" value={form.country} onChange={handleChange} className={inputClasses} />
          </div>
          <div className="flex justify-end mt-4">
            <button type="submit" disabled={isValidating || isDuplicate} className="btn-primary disabled:opacity-50">
              {isValidating ? 'Validating...' : isDuplicate ? 'Code Exists' : editingId ? 'Update' : 'Add'}
            </button>
          </div>
        </form>

        <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
          <table className="min-w-full bg-white dark:bg-gray-800">
            <thead>
              <tr><th>Code</th><th>Name</th><th>Short Name</th><th>Country</th><th className="text-center">Actions</th></tr>
            </thead>
            <tbody>
              {filteredBrands.length > 0 ? filteredBrands.map((brand) => (
                <tr key={brand.id}>
                  <td className="px-4 py-3 text-sm">{brand.code}</td>
                  <td className="px-4 py-3 text-sm">{brand.name}</td>
                  <td className="px-4 py-3 text-sm">{brand.shortName || '-'}</td>
                  <td className="px-4 py-3 text-sm">{brand.country || '-'}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex justify-center gap-2">
                      <button onClick={() => { setEditingId(brand.id); setForm({ code: brand.code, name: brand.name, shortName: brand.shortName || '', country: brand.country || '' }); }} className="px-3 py-1 text-sm bg-amber-500 text-white rounded">Edit</button>
                      <button onClick={() => handleDelete(brand.id)} className="px-3 py-1 text-sm bg-red-500 text-white rounded">Delete</button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={5} className="text-center py-8 text-gray-500">No brands found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </>
    );
  };

  // =========================================================
  // VARIATION TAB
  // =========================================================

  const VariationTab: React.FC = () => {
    const [search, setSearch] = useState('');

    const [editingId, setEditingId] =
      useState<string | null>(null);

    const [form, setForm] = useState({
      name: '',
      type: '',
      value: '',
    });

    const filteredVariations = useMemo(() => {
      const term = search.toLowerCase();

      if (!term) return variations;

      return variations.filter(
        (item) =>
          item.name
            .toLowerCase()
            .includes(term) ||
          item.type
            .toLowerCase()
            .includes(term)
      );
    }, [search, variations]);

    const handleChange = (
      e: React.ChangeEvent<HTMLInputElement>
    ) => {
      const { name, value } = e.target;

      setForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    };

    const resetForm = () => {
      setEditingId(null);

      setForm({
        name: '',
        type: '',
        value: '',
      });
    };

    const handleSubmit = async (
      e: React.FormEvent
    ) => {
      e.preventDefault();

      setIsGlobalLoading(true);

      try {
        if (editingId) {
          await onUpdateVariation({
            id: editingId,
            ...form,
            updatedAt: new Date().toISOString(),
          });
        } else {
          await onAddVariation(form);
        }

        resetForm();
        refreshMasterData();
      } catch (error: any) {
        showToast(
          'Failed to save variation',
          'error'
        );
      } finally {
        setIsGlobalLoading(false);
      }
    };

    const handleDelete = async (
      id: string
    ) => {
      if (
        !window.confirm(
          'Delete this variation?'
        )
      ) {
        return;
      }

      try {
        await onDeleteVariation(id);
        showToast('Variation deleted successfully', 'success');
        refreshMasterData();
      } catch (error: any) {
        showToast(
          error.message,
          'error'
        );
      }
    };

    return (
      <>
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search variation..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            className={inputClasses}
          />
        </div>

        <form
          onSubmit={handleSubmit}
          className="card mb-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Name"
              className={inputClasses}
              required
            />

            <input
              name="type"
              value={form.type}
              onChange={handleChange}
              placeholder="Type (e.g. Color, Size)"
              className={inputClasses}
              required
            />

            <input
              name="value"
              value={form.value}
              onChange={handleChange}
              placeholder="Value (e.g. Red, XL)"
              className={inputClasses}
              required
            />
          </div>

          <div className="flex justify-end mt-4">
            <button
              type="submit"
              className="btn-primary"
            >
              {editingId
                ? 'Update'
                : 'Add'}
            </button>
          </div>
        </form>

        <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
          <table className="min-w-full bg-white dark:bg-gray-800">
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Value</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredVariations.length >
              0 ? (
                filteredVariations.map(
                  (item) => (
                    <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-4 py-3 text-sm">{item.name}</td>
                      <td className="px-4 py-3 text-sm">{item.type}</td>
                      <td className="px-4 py-3 text-sm">{item.value}</td>

                      <td>
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => {
                              setEditingId(
                                item.id
                              );

                              setForm({
                                name: item.name,
                                type: item.type,
                                value: item.value,
                              });
                            }}
                            className="px-3 py-1 text-sm bg-amber-500 text-white rounded"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() =>
                              handleDelete(
                                item.id
                              )
                            }
                            className="px-3 py-1 text-sm bg-red-500 text-white rounded"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                )
              ) : (
                <tr>
                  <td
                    colSpan={4}
                    className="text-center py-8 text-gray-500"
                  >
                    No variations found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'Product Types':
        return <ProductTypeTab />;

      case 'Categories':
        return <CategoryTab />;

      case 'Subcategories':
        return <SubcategoryTab />;

      case 'Brands':
        return <BrandTab />;

      case 'Variations':
        return <VariationTab />;

      default:
        return (
          <div className="p-6 text-center text-gray-500">
            Tab content not added yet.
          </div>
        );
    }
  };

  return (
    <Placeholder title="Product Attributes Management">
      <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
        <nav
          className="-mb-px flex space-x-4"
          aria-label="Tabs"
        >
          {(
            [
              'Product Types',
              'Categories',
              'Subcategories',
              'Brands',
              'Variations',
            ] as Tab[]
          ).map((tab) => (
            <button
              key={tab}
              onClick={() =>
                setActiveTab(tab)
              }
              className={tabButtonClasses(
                tab
              )}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {renderTabContent()}
    </Placeholder>
  );
};

export default ProductAttributes;