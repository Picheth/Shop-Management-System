import React, { useMemo, useState } from 'react';
import Placeholder from '../ui/Placeholder';

interface VariationItem {
    id: string;
    name: string;
    sku: string;
    color: string;
    storage: string;
    price: number;
    stock: number;
    status: 'Active' | 'Inactive';
}

const initialVariations: VariationItem[] = [
    {
        id: 'VAR-001',
        name: 'iPhone 15 Pro',
        sku: 'IP15P-BLK-256',
        color: 'Black',
        storage: '256GB',
        price: 1199,
        stock: 12,
        status: 'Active',
    },
    {
        id: 'VAR-002',
        name: 'iPhone 15 Pro',
        sku: 'IP15P-WHT-512',
        color: 'White',
        storage: '512GB',
        price: 1399,
        stock: 6,
        status: 'Active',
    },
    {
        id: 'VAR-003',
        name: 'Samsung S25',
        sku: 'SS25-BLU-256',
        color: 'Blue',
        storage: '256GB',
        price: 999,
        stock: 0,
        status: 'Inactive',
    },
];

const Variation: React.FC = () => {
    const [variations, setVariations] =
        useState<VariationItem[]>(initialVariations);

    const [search, setSearch] = useState('');

    const [form, setForm] = useState({
        name: '',
        sku: '',
        color: '',
        storage: '',
        price: '',
        stock: '',
    });

    const filteredVariations = useMemo(() => {
        if (!search) return variations;

        const term = search.toLowerCase();

        return variations.filter(
            item => item.name.toLowerCase().includes(term) ||
                item.sku.toLowerCase().includes(term) ||
                item.color.toLowerCase().includes(term) ||
                item.storage.toLowerCase().includes(term) ||
                item.price.toString().includes(term) ||
                item.stock.toString().includes(term) ||
                item.status.toLowerCase().includes(term)
        );
    }, [search, variations]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        setForm(prev => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleAddVariation = (
        e: React.FormEvent
    ) => {
        e.preventDefault();

        const newVariation: VariationItem = {
            id: `VAR-${String(
                variations.length + 1
            ).padStart(3, '0')}`,
            name: form.name,
            sku: form.sku,
            color: form.color,
            storage: form.storage,
            price: Number(form.price),
            stock: Number(form.stock),
            status:
                Number(form.stock) > 0
                    ? 'Active'
                    : 'Inactive',
        };

        setVariations(prev => [
            newVariation,
            ...prev,
        ]);

        setForm({
            name: '',
            sku: '',
            color: '',
            storage: '',
            price: '',
            stock: '',
        });
    };

    const toggleStatus = (id: string) => {
        setVariations(prev =>
            prev.map(item =>
                item.id === id
                    ? {
                          ...item,
                          status:
                              item.status ===
                              'Active'
                                  ? 'Inactive'
                                  : 'Active',
                      }
                    : item
            )
        );
    };

    const inputClasses =
        'w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500';

    return (
        <Placeholder title="Variation Management">

            {/* Header */}
            <div className="flex flex-col lg:flex-row gap-3 mb-6">

                {/* Search */}
                <input
                    type="text"
                    placeholder="Search variation..."
                    value={search}
                    onChange={e =>
                        setSearch(e.target.value)
                    }
                    className={`${inputClasses} flex-1`}
                />
            </div>

            {/* Add Form */}
            <form
                onSubmit={handleAddVariation}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 mb-6"
            >
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Add New Variation
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

                    <input
                        type="text"
                        name="name"
                        placeholder="Product Name"
                        value={form.name}
                        onChange={handleChange}
                        className={inputClasses}
                        required
                    />

                    <input
                        type="text"
                        name="sku"
                        placeholder="SKU"
                        value={form.sku}
                        onChange={handleChange}
                        className={inputClasses}
                        required
                    />

                    <input
                        type="text"
                        name="color"
                        placeholder="Color"
                        value={form.color}
                        onChange={handleChange}
                        className={inputClasses}
                        required
                    />

                    <input
                        type="text"
                        name="storage"
                        placeholder="Storage"
                        value={form.storage}
                        onChange={handleChange}
                        className={inputClasses}
                        required
                    />

                    <input
                        type="number"
                        name="price"
                        placeholder="Price"
                        value={form.price}
                        onChange={handleChange}
                        className={inputClasses}
                        required
                    />

                    <input
                        type="number"
                        name="stock"
                        placeholder="Stock"
                        value={form.stock}
                        onChange={handleChange}
                        className={inputClasses}
                        required
                    />
                </div>

                <div className="mt-4 flex justify-end">
                    <button
                        type="submit"
                        className="bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-md"
                    >
                        Add Variation
                    </button>
                </div>
            </form>

            {/* Table */}
            <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">

                <table className="min-w-full bg-white dark:bg-gray-800">

                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-300">
                                SKU
                            </th>

                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-300">
                                Product
                            </th>

                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-300">
                                Color
                            </th>

                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-300">
                                Storage
                            </th>

                            <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-gray-500 dark:text-gray-300">
                                Price
                            </th>

                            <th className="px-4 py-3 text-center text-xs font-semibold uppercase text-gray-500 dark:text-gray-300">
                                Stock
                            </th>

                            <th className="px-4 py-3 text-center text-xs font-semibold uppercase text-gray-500 dark:text-gray-300">
                                Status
                            </th>

                            <th className="px-4 py-3 text-center text-xs font-semibold uppercase text-gray-500 dark:text-gray-300">
                                Actions
                            </th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">

                        {filteredVariations.length > 0 ? (
                            filteredVariations.map(item => (
                                <tr
                                    key={item.id}
                                    className="hover:bg-gray-50 dark:hover:bg-gray-700"
                                >
                                    <td className="px-4 py-3 text-sm font-medium text-sky-600 dark:text-sky-400">
                                        {item.sku}
                                    </td>

                                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                                        {item.name}
                                    </td>

                                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                                        {item.color}
                                    </td>

                                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                                        {item.storage}
                                    </td>

                                    <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white font-medium">
                                        $
                                        {item.price.toFixed(
                                            2
                                        )}
                                    </td>

                                    <td className="px-4 py-3 text-center text-sm text-gray-700 dark:text-gray-300">
                                        {item.stock}
                                    </td>

                                    <td className="px-4 py-3 text-center">
                                        <span
                                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                item.status ===
                                                'Active'
                                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                            }`}
                                        >
                                            {item.status}
                                        </span>
                                    </td>

                                    <td className="px-4 py-3 text-center">
                                        <button
                                            onClick={() =>
                                                toggleStatus(
                                                    item.id
                                                )
                                            }
                                            className="px-3 py-1 text-sm bg-amber-500 hover:bg-amber-600 text-white rounded"
                                        >
                                            Toggle
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td
                                    colSpan={8}
                                    className="text-center py-8 text-gray-500 dark:text-gray-400"
                                >
                                    No variations found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </Placeholder>
    );
};

export default Variation;