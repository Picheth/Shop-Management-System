import React, { useState, useMemo } from 'react';
import { ProductVariant as ProductVariantType, MasterAttribute, DataProduct } from '../../types';
import { generateSku } from '../../Types/ProductSpecs';
import BulkGenerator from '../inventory/BulkGenerator';
import VariantTable from './VariantTable';
import FormInput from '../ui/FormInput';
import FormSelect from '../ui/FormSelect';

interface VariantManagerProps {
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

const VariantManager: React.FC<VariantManagerProps> = (props) => {
    const [isBulkMode, setIsBulkMode] = useState(false);
    const [search, setSearch] = useState('');
    const [form, setForm] = useState({
        productId: '', storageId: '', price: '', stock: '', sku: ''
    });

    const handleBulkGenerate = async (selections: any) => {
        const product = props.products.find(p => p.id === form.productId);
        if (!product || !form.storageId) {
            alert("Please select a Product and Base Storage first.");
            return;
        }

        const payloads: any[] = [];
        const procs = selections.processors.length > 0 ? selections.processors : [undefined];
        const rms = selections.rams.length > 0 ? selections.rams : [undefined];
        const clrs = selections.colors.length > 0 ? selections.colors : [undefined];
        const regs = selections.regions.length > 0 ? selections.regions : [undefined];
        const conds = selections.conditions.length > 0 ? selections.conditions : [undefined];

        procs.forEach((pId: any) => {
            rms.forEach((rId: any) => {
                clrs.forEach((cId: any) => {
                    regs.forEach((regId: any) => {
                        conds.forEach((condId: any) => {
                            const pName = props.processors.find(x => x.id === pId)?.name;
                            const rName = props.rams.find(x => x.id === rId)?.name;
                            const sName = props.storages.find(x => x.id === form.storageId)?.name;
                            const cName = props.colors.find(x => x.id === cId)?.name;
                            const regName = props.regions.find(x => x.id === regId)?.name;
                            const condName = props.conditions.find(x => x.id === condId)?.name;

                            payloads.push({
                                productId: form.productId,
                                processorId: pId, ramId: rId, storageId: form.storageId,
                                colorId: cId, regionId: regId, conditionId: condId,
                                price: parseFloat(form.price) || 0,
                                stockQuantity: parseInt(form.stock) || 0,
                                sku: generateSku(product as any, undefined, undefined, undefined, sName, cName, regName, condName, rName, pName)
                            });
                        });
                    });
                });
            });
        });

        if (confirm(`Generate ${payloads.length} variants?`)) {
            await props.onBulkAdd(payloads);
            setIsBulkMode(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <input 
                    type="text" placeholder="Search variants..." value={search} 
                    onChange={e => setSearch(e.target.value)}
                    className="w-full max-w-md bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm"
                />
                <label className="flex items-center gap-2 cursor-pointer bg-sky-50 dark:bg-sky-900/20 px-3 py-1.5 rounded-full border border-sky-100 dark:border-sky-800">
                    <input 
                        type="checkbox" checked={isBulkMode} onChange={(e) => setIsBulkMode(e.target.checked)}
                        className="h-4 w-4 text-sky-600 rounded border-gray-300 focus:ring-sky-500"
                    />
                    <span className="text-xs font-bold text-sky-700 dark:text-sky-400 uppercase tracking-tight">Bulk Matrix Mode</span>
                </label>
            </div>

            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <FormSelect
                        label="Base Product"
                        value={form.productId}
                        onChange={e => setForm(v => ({...v, productId: e.target.value}))}
                        options={props.products.map(p => ({ value: p.id, label: p.name }))}
                    />
                    <FormSelect
                        label="Common Storage"
                        value={form.storageId}
                        onChange={e => setForm(v => ({...v, storageId: e.target.value}))}
                        options={props.storages.map(s => ({ value: s.id, label: s.name }))}
                    />
                    <FormInput
                        label="Common Price"
                        type="number"
                        value={form.price}
                        onChange={e => setForm(v => ({...v, price: e.target.value}))}
                    />
                    <FormInput
                        label="Initial Stock"
                        type="number"
                        value={form.stock}
                        onChange={e => setForm(v => ({...v, stock: e.target.value}))}
                    />
                </div>

                {isBulkMode && (
                    <BulkGenerator 
                        processors={props.processors} 
                        rams={props.rams} 
                        colors={props.colors} 
                        regions={props.regions} 
                        conditions={props.conditions} 
                        onGenerate={handleBulkGenerate}
                    />
                )}
                
                {!isBulkMode && (
                    <div className="flex justify-end">
                        <button className="bg-sky-600 text-white px-6 py-2 rounded-md font-bold text-sm uppercase tracking-widest">
                            Add Single Variant
                        </button>
                    </div>
                )}
            </div>

            <VariantTable 
                variants={props.variants} 
                products={props.products}
                colors={props.colors}
                storages={props.storages}
                search={search}
                onDelete={props.onDelete}
                onUpdate={props.onUpdate}
            />
        </div>
    );
};

export default VariantManager;