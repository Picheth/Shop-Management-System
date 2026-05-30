import React, { useMemo, useState } from 'react';
import FormInput from '../ui/FormInput';
import FormSelect from '../ui/FormSelect';
import { ProductVariant as ProductVariantType, MasterAttribute, DataProduct } from '../../types';

interface ProductVariantProps {
    variants: ProductVariantType[];
    products: DataProduct[];
    processors: MasterAttribute[];
    rams: MasterAttribute[];
    storages: MasterAttribute[];
    colors: MasterAttribute[];
    regions: MasterAttribute[];
    conditions: MasterAttribute[];
    onAdd: (variant: any) => Promise<void>;
    onBulkAdd: (variants: any[]) => Promise<void>;
    onUpdate: (variant: ProductVariantType) => Promise<void>;
    onDelete: (id: string) => Promise<void>;
}

const ProductVariant: React.FC<ProductVariantProps> = ({
    variants,
    products,
    processors,
    rams,
    storages,
    colors,
    regions,
    conditions,
    onAdd,
    onBulkAdd,
    onUpdate,
    onDelete,
}) => {

    const [search, setSearch] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [isBulkMode, setIsBulkMode] = useState(false);

    // Bulk selection states
    const [selectedProcessors, setSelectedProcessors] = useState<string[]>([]);
    const [selectedRams, setSelectedRams] = useState<string[]>([]);
    const [selectedColors, setSelectedColors] = useState<string[]>([]);
    const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
    const [selectedConditions, setSelectedConditions] = useState<string[]>([]);

    const [form, setForm] = useState({
        productId: '',
        processorId: '',
        ramId: '',
        storageId: '',
        colorId: '',
        regionId: '',
        conditionId: '',
        sku: '',
        price: '',
        stock: '',
    });

    const inputClasses =
        'w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500';

    const getNameById = (items: MasterAttribute[], id?: string) => {
        return items.find(item => item.id === id)?.name || '-';
    };

    const getProductName = (id?: string) => {
        if (!id) return '-';
        // Look for the product in the provided specification/product list
        const product = products.find(p => p.id === id || p.productSpecId === id);
        return product?.name || '-';
    };

    const filteredVariants = useMemo(() => {

        if (!search) return variants;

        const term = search.toLowerCase();

        return variants.filter(item => {

            const productName =
                getProductName(
                    item.productId
                ).toLowerCase();

            const colorName =
                getNameById(
                    colors,
                    item.colorId
                ).toLowerCase();

            const storageName =
                getNameById(
                    storages,
                    item.storageId
                ).toLowerCase();

            return (
                productName.includes(term) ||
                item.sku.toLowerCase().includes(term) ||
                colorName.includes(term) ||
                storageName.includes(term) ||
                (item.price || 0).toString().includes(term) ||
                (item.stockQuantity || 0).toString().includes(term)
            );
        });

    }, [search, variants]);

    const generateSku = (pId?: string, cId?: string, sId?: string, rId?: string, regId?: string, condId?: string) => {
        const product = products.find(p => p.id === form.productId);
        if (!product) return '';

        const processor = processors.find(p => p.id === (pId || form.processorId));
        const color = colors.find(c => c.id === (cId || form.colorId));
        const storage = storages.find(s => s.id === (sId || form.storageId));
        const ram = rams.find(r => r.id === (rId || form.ramId));
        const region = regions.find(r => r.id === (regId || form.regionId));
        const condition = conditions.find(c => c.id === (condId || form.conditionId));

        // Helper to safely retrieve a code from the product's mapping or default to sanitized segment
        const getAttrCode = (val?: string, codes?: { [key: string]: string }) => {
            if (!val) return '';
            if (codes && codes[val]) return codes[val];
            return val.replace(/[^a-zA-Z0-9]/g, '').substring(0, 3).toUpperCase();
        };

        const segments = [
            product.shortModel || product.model?.replace(/\s/g, '').substring(0, 5) || product.name.replace(/\s/g, '').substring(0, 5),
            getAttrCode(processor?.name, product.processorCodes),
            getAttrCode(ram?.name, product.ramCodes),
            getAttrCode(storage?.name, product.storageCodes),
            getAttrCode(color?.name, product.colorCodes),
            getAttrCode(region?.name, product.regionCodes),
            getAttrCode(condition?.name, product.conditionCodes)
        ].filter(Boolean);

        return segments.join('-').toUpperCase();
    };

    const handleChange = (
        e:
            React.ChangeEvent<HTMLInputElement> |
            React.ChangeEvent<HTMLSelectElement>
    ) => {

        const {
            name,
            value,
        } = e.target;

        setForm(prev => {

            const updated = {
                ...prev,
                [name]: value,
            };

            if (
                [
                    'productId',
                    'processorId',
                    'ramId',
                    'colorId',
                    'storageId',
                    'regionId',
                    'conditionId',
                ].includes(name)
            ) {
                updated.sku = generateSku();
            }

            return updated;
        });
    };

    const handleToggleBulkSelection = (id: string, type: 'processor' | 'ram' | 'color' | 'region' | 'condition') => {
        let setter: React.Dispatch<React.SetStateAction<string[]>>;
        if (type === 'processor') setter = setSelectedProcessors;
        else if (type === 'ram') setter = setSelectedRams;
        else if (type === 'color') setter = setSelectedColors;
        else if (type === 'region') setter = setSelectedRegions;
        else setter = setSelectedConditions;

        setter(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const handleSubmit = async (
        e: React.FormEvent
    ) => {
        e.preventDefault();
        
        const hasAnyBulkSelection = 
            selectedProcessors.length > 0 || 
            selectedRams.length > 0 || 
            selectedColors.length > 0 ||
            selectedRegions.length > 0 ||
            selectedConditions.length > 0;

        if (isBulkMode && !hasAnyBulkSelection) {
            alert('Please select at least one attribute to generate variants in bulk.');
            return;
        }

        // Create a set of existing SKUs for quick lookup
        const existingSkus = new Set(variants.map(v => v.sku));

        setIsSaving(true);

        try {
            if (isBulkMode) {
                const procs = selectedProcessors.length > 0 ? selectedProcessors : [form.processorId || undefined];
                const rms = selectedRams.length > 0 ? selectedRams : [form.ramId || undefined];
                const clrs = selectedColors.length > 0 ? selectedColors : [form.colorId || undefined];
                const regs = selectedRegions.length > 0 ? selectedRegions : [form.regionId || undefined];
                const conds = selectedConditions.length > 0 ? selectedConditions : [form.conditionId || undefined];

                const payloads: any[] = [];

                procs.forEach(pId => {
                    // Ensure processorId is not undefined if it's the only option
                    if (pId === undefined && procs.length > 1) return; 
                    rms.forEach(rId => {
                        // Ensure ramId is not undefined if it's the only option
                        if (rId === undefined && rms.length > 1) return;
                        clrs.forEach(cId => {
                            // Ensure colorId is not undefined if it's the only option
                            if (cId === undefined && clrs.length > 1) return;
                            regs.forEach(regId => {
                                conds.forEach(condId => {
                                    payloads.push({
                                        productId: form.productId,
                                        processorId: pId,
                                        ramId: rId,
                                        storageId: form.storageId,
                                        colorId: cId,
                                        regionId: regId,
                                        conditionId: condId,
                                        sku: generateSku(pId, cId, form.storageId, rId, regId, condId),
                                        price: parseFloat(form.price),
                                        stockQuantity: parseInt(form.stock),
                                    });
                                });
                            });
                        });
                    });
                });
                
                // Check for duplicates among the generated payloads and existing variants
                for (const payload of payloads) {
                    if (existingSkus.has(payload.sku)) {
                        alert(`Duplicate SKU detected: ${payload.sku}. Please adjust your selections or check existing variants.`);
                        setIsSaving(false);
                        return;
                    }
                }

                if (confirm(`This will generate ${payloads.length} variants. Proceed?`)) {
                    await onBulkAdd(payloads);
                }
            } else {
                const payload = {
                    productId: form.productId,
                    processorId: form.processorId,
                    ramId: form.ramId,
                    storageId: form.storageId,
                    colorId: form.colorId,
                    regionId: form.regionId,
                    conditionId: form.conditionId,
                    sku: form.sku || generateSku(), // Use generated SKU if not provided
                    price: parseFloat(form.price),
                    stockQuantity: parseInt(form.stock),
                };
                
                // Check for duplicate SKU in single mode
                if (existingSkus.has(payload.sku)) {
                    alert(`Duplicate SKU detected: ${payload.sku}. Please change the SKU or adjust your selections.`);
                    setIsSaving(false);
                    return;
                }
                await onAdd(payload);
            }

            setForm({
                productId: '',
                processorId: '',
                ramId: '',
                storageId: '',
                colorId: '',
                regionId: '',
                conditionId: '',
                sku: '',
                price: '',
                stock: '',
            });
            setSelectedProcessors([]);
            setSelectedRams([]);
            setSelectedColors([]);
            setSelectedRegions([]);
            setSelectedConditions([]);
            setSelectedRegions([]);
            setSelectedConditions([]);
            // Clear SKU field if it was auto-generated
            if (isBulkMode) setForm(prev => ({ ...prev, sku: '' }));
        } finally {
            setIsSaving(false);
        }
    };

    const toggleStatus = async (
        variant: ProductVariantType
    ) => {
        await onUpdate({
            ...variant,
            isActive: !variant.isActive
        });
    };

    const handleDeleteClick = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this variant?')) {
            await onDelete(id);
        }
    };

    return (
        <div className="space-y-6">
            {/* SEARCH */}
            <div>
                <input
                    type="text"
                    placeholder="Search variants..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className={inputClasses}
                />
            </div>

            {/* FORM */}
            <form
                onSubmit={handleSubmit}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5"
            >
                <div className="flex items-center justify-between mb-5">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {isBulkMode ? 'Bulk Add Variants' : 'Add Product Variant'}
                    </h2>
                    <label className="flex items-center gap-2 cursor-pointer bg-sky-50 dark:bg-sky-900/20 px-3 py-1.5 rounded-full border border-sky-100 dark:border-sky-800">
                        <input 
                            type="checkbox" 
                            checked={isBulkMode} 
                            onChange={(e) => setIsBulkMode(e.target.checked)}
                            className="h-4 w-4 text-sky-600 rounded border-gray-300 focus:ring-sky-500"
                        />
                        <span className="text-xs font-bold text-sky-700 dark:text-sky-400 uppercase tracking-tight">Bulk Mode</span>
                    </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <FormSelect
                        label="Product"
                        name="productId"
                        value={form.productId}
                        onChange={handleChange}
                        options={products.map(p => ({
                            value: p.id,
                            label: p.name,
                        }))}
                        required
                    />
                    {isBulkMode ? (
                        <div className="md:col-span-2 lg:col-span-3 space-y-4 p-4 bg-gray-50 dark:bg-gray-800/40 rounded-lg border border-dashed border-gray-300 dark:border-gray-600">
                            <p className="text-[10px] font-bold text-sky-600 uppercase tracking-widest">Select multiple options to generate all combinations</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Processors</label>
                                    <div className="flex flex-wrap gap-2">
                                        {processors.map(p => (
                                            <button
                                                key={p.id}
                                                type="button"
                                                onClick={() => handleToggleBulkSelection(p.id, 'processor')}
                                                className={`px-2 py-1 text-xs rounded border transition-colors ${selectedProcessors.includes(p.id) ? 'bg-sky-100 border-sky-500 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300' : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600'}`}
                                            >
                                                {p.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">RAM</label>
                                    <div className="flex flex-wrap gap-2">
                                        {rams.map(r => (
                                            <button
                                                key={r.id}
                                                type="button"
                                                onClick={() => handleToggleBulkSelection(r.id, 'ram')}
                                                className={`px-2 py-1 text-xs rounded border transition-colors ${selectedRams.includes(r.id) ? 'bg-sky-100 border-sky-500 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300' : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600'}`}
                                            >
                                                {r.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Colors</label>
                                    <div className="flex flex-wrap gap-2">
                                        {colors.map(c => (
                                            <button
                                                key={c.id}
                                                type="button"
                                                onClick={() => handleToggleBulkSelection(c.id, 'color')}
                                                className={`px-2 py-1 text-xs rounded border transition-colors ${selectedColors.includes(c.id) ? 'bg-sky-100 border-sky-500 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300' : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600'}`}
                                            >
                                                {c.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Regions</label>
                                    <div className="flex flex-wrap gap-2">
                                        {regions.map(r => (
                                            <button
                                                key={r.id}
                                                type="button"
                                                onClick={() => handleToggleBulkSelection(r.id, 'region')}
                                                className={`px-2 py-1 text-xs rounded border transition-colors ${selectedRegions.includes(r.id) ? 'bg-sky-100 border-sky-500 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300' : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600'}`}
                                            >
                                                {r.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Conditions</label>
                                    <div className="flex flex-wrap gap-2">
                                        {conditions.map(c => (
                                            <button
                                                key={c.id}
                                                type="button"
                                                onClick={() => handleToggleBulkSelection(c.id, 'condition')}
                                                className={`px-2 py-1 text-xs rounded border transition-colors ${selectedConditions.includes(c.id) ? 'bg-sky-100 border-sky-500 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300' : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600'}`}
                                            >
                                                {c.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <>
                            <FormSelect
                                label="Processor"
                                name="processorId"
                                value={form.processorId}
                                onChange={handleChange}
                                options={processors.map(p => ({ value: p.id, label: p.name }))}
                            />
                            <FormSelect
                                label="RAM"
                                name="ramId"
                                value={form.ramId}
                                onChange={handleChange}
                                options={rams.map(r => ({ value: r.id, label: r.name }))}
                            />
                            <FormSelect
                                label="Color"
                                name="colorId"
                                value={form.colorId}
                                onChange={handleChange}
                                options={colors.map(c => ({ value: c.id, label: c.name }))}
                                required
                            />
                        </>
                    )}
                    <FormSelect
                        label="Storage"
                        name="storageId"
                        value={form.storageId}
                        onChange={handleChange}
                        options={storages.map(s => ({ value: s.id, label: s.name }))}
                        required
                    />
                    <FormSelect
                        label="Region"
                        name="regionId"
                        value={form.regionId}
                        onChange={handleChange}
                        options={regions.map(r => ({ value: r.id, label: r.name }))}
                    />
                    <FormSelect
                        label="Condition"
                        name="conditionId"
                        value={form.conditionId}
                        onChange={handleChange}
                        options={conditions.map(c => ({ value: c.id, label: c.name }))}
                    />
                    <FormInput
                        label="SKU"
                        name="sku"
                        value={form.sku}
                        onChange={handleChange}
                        required={!isBulkMode}
                        disabled={isBulkMode}
                        placeholder={isBulkMode ? "Auto-generated" : "Enter SKU"}
                    />
                    <FormInput
                        label="Price"
                        name="price"
                        type="number"
                        value={form.price}
                        onChange={handleChange}
                        required
                    />
                    <FormInput
                        label="Stock"
                        name="stock"
                        type="number"
                        value={form.stock}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="mt-5 flex justify-end">
                    <button
                        type="submit"
                        disabled={isSaving}
                        className="bg-sky-600 hover:bg-sky-700 text-white px-5 py-2 rounded-md disabled:opacity-50"
                    >
                        {isSaving ? 'Adding...' : 'Add Variant'}
                    </button>
                </div>
            </form>

            {/* TABLE */}
            <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
                <table className="min-w-full bg-white dark:bg-gray-800">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-300">SKU</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-300">Product</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-300">Color</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-300">Storage</th>
                            <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-gray-500 dark:text-gray-300">Price</th>
                            <th className="px-4 py-3 text-center text-xs font-semibold uppercase text-gray-500 dark:text-gray-300">Stock</th>
                            <th className="px-4 py-3 text-center text-xs font-semibold uppercase text-gray-500 dark:text-gray-300">Status</th>
                            <th className="px-4 py-3 text-center text-xs font-semibold uppercase text-gray-500 dark:text-gray-300">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {filteredVariants.length > 0 ? (
                            filteredVariants.map(item => (
                                <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                    <td className="px-4 py-3 text-sm font-medium text-sky-600 dark:text-sky-400">{item.sku}</td>
                                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{getProductName(item.productId)}</td>
                                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{getNameById(colors, item.colorId)}</td>
                                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{getNameById(storages, item.storageId)}</td>
                                    <td className="px-4 py-3 text-right text-sm font-medium text-gray-900 dark:text-white">${(item.price || 0).toFixed(2)}</td>
                                    <td className="px-4 py-3 text-center text-sm text-gray-700 dark:text-gray-300">{item.stockQuantity}</td>
                                    <td className="px-4 py-3 text-center">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.isActive ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                                            {item.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <div className="flex justify-center gap-2">
                                            <button onClick={() => toggleStatus(item)} className="px-3 py-1 text-sm bg-sky-600 hover:bg-sky-700 text-white rounded">Toggle</button>
                                            <button onClick={() => handleDeleteClick(item.id)} className="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded">Delete</button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan={8} className="text-center py-8 text-gray-500 dark:text-gray-400">No variants found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ProductVariant;