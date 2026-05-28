import React, { useMemo, useState } from 'react';
import Placeholder from '../ui/Placeholder';
import { type Brand } from '../../types';

interface BrandProps {
    brands: Brand[];
    onAdd: (newBrand: Omit<Brand, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
    onUpdate: (updatedBrand: Brand) => Promise<void>;
    onDelete: (id: string) => Promise<void>;
}

const Brand: React.FC<BrandProps> = ({ brands, onAdd, onUpdate, onDelete }) => {
    const [search, setSearch] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState({
        code: '',
        name: '',
        shortName: '',
        country: '',
    });

    const filteredBrands = useMemo(() => {
        if (!search) return brands;
        const term = search.toLowerCase();
        return brands.filter(b => 
            b.code.toLowerCase().includes(term) ||
            b.name.toLowerCase().includes(term) ||
            (b.shortName && b.shortName.toLowerCase().includes(term)) ||
            (b.country && b.country.toLowerCase().includes(term))
        );
    }, [search, brands]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const resetForm = () => {
        setEditingId(null);
        setForm({ code: '', name: '', shortName: '', country: '' });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingId) {
                await onUpdate({ id: editingId, ...form });
            } else {
                await onAdd(form);
            }
            resetForm();
        } catch (error) {
            console.error('Failed to save brand:', error);
        }
    };

    const handleEdit = (brand: Brand) => {
        setEditingId(brand.id);
        setForm({
            code: brand.code,
            name: brand.name,
            shortName: brand.shortName || '',
            country: brand.country || '',
        });
    };

    const handleDelete = async (id: string) => {
        const confirmed = window.confirm('Delete this brand?');
        if (!confirmed) return;
        try {
            await onDelete(id);
        } catch (error) {
            console.error('Delete failed:', error);
        }
    };

    const inputClasses = "w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500";

    return (
        <Placeholder title="Brand Management">
            <div className="mb-6">
                <input
                    type="text"
                    placeholder="Search brands..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className={inputClasses}
                />
            </div>

            <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 mb-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {editingId ? 'Edit Brand' : 'Add New Brand'}
                    </h2>
                    {editingId && (
                        <button type="button" onClick={resetForm} className="text-sm text-red-500 hover:text-red-600">
                            Cancel Edit
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input type="text" name="code" placeholder="Brand Code" value={form.code} onChange={handleChange} className={inputClasses} required />
                    <input type="text" name="name" placeholder="Brand Name" value={form.name} onChange={handleChange} className={inputClasses} required />
                    <input type="text" name="shortName" placeholder="Short Name" value={form.shortName} onChange={handleChange} className={inputClasses} />
                    <input type="text" name="country" placeholder="Country" value={form.country} onChange={handleChange} className={inputClasses} />
                </div>

                <div className="flex justify-end mt-4">
                    <button type="submit" className="bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-md">
                        {editingId ? 'Update Brand' : 'Add Brand'}
                    </button>
                </div>
            </form>

            <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
                <table className="min-w-full bg-white dark:bg-gray-800">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-300">Code</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-300">Name</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-300">Short Name</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-300">Country</th>
                            <th className="px-4 py-3 text-center text-xs font-semibold uppercase text-gray-500 dark:text-gray-300">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {filteredBrands.length > 0 ? filteredBrands.map(brand => (
                            <tr key={brand.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                <td className="px-4 py-3 text-sm font-medium text-sky-600 dark:text-sky-400">{brand.code}</td>
                                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{brand.name}</td>
                                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{brand.shortName || '-'}</td>
                                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{brand.country || '-'}</td>
                                <td className="px-4 py-3 text-center">
                                    <div className="flex justify-center gap-2">
                                        <button onClick={() => handleEdit(brand)} className="px-3 py-1 text-sm bg-amber-500 hover:bg-amber-600 text-white rounded">Edit</button>
                                        <button onClick={() => handleDelete(brand.id)} className="px-3 py-1 text-sm bg-red-500 hover:bg-red-600 text-white rounded">Delete</button>
                                    </div>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={5} className="text-center py-8 text-gray-500 dark:text-gray-400">
                                    No brands found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </Placeholder>
    );
};

export default Brand;