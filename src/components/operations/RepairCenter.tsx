import React, {
    useMemo,
    useState,
    useEffect,
} from 'react';
import Placeholder from '../ui/Placeholder';
import SettingsForm from '../ui/SettingsForm';
import FormInput from '../ui/FormInput';
import FormSelect from '../ui/FormSelect';
import InlineFormInput from '../ui/InlineFormInput';
import InlineFormSelect from '../ui/InlineFormSelect';
import { useFormValidation } from '../../hooks/useFormValidation';
import { Product, Branch, StockTransfer, Page, RepairStatus, Repair as RepairType, LineItem } from '../../types';
import { checkStockAvailability } from '../../utils/stockUtils';
interface RepairCenterProps {
    repairs: RepairType[];
    products: Product[];
    setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
    branches: Branch[];
    onNavigate: (page: Page) => void;
    onRefreshCount?: () => void;
    onAddRepair?: (data: Omit<RepairType, 'id'>) => Promise<void>;
    onUpdateRepair?: (data: RepairType) => Promise<void>;
    onDeleteRepair?: (id: string) => Promise<void>;
    stockTransfers: StockTransfer[];
    setStockTransfers: React.Dispatch<React.SetStateAction<StockTransfer[]>>;
}

const RepairCenter: React.FC<RepairCenterProps> =
    ({ repairs, products, branches, onAddRepair, onUpdateRepair, onDeleteRepair }) => {

        const [
            search,
            setSearch,
        ] = useState('');

        const [
            filterStatus,
            setFilterStatus,
        ] = useState<
            | 'All'
            | RepairStatus
        >('All');

        const [
            editing_id,
            setEditingId,
        ] = useState<
            string | null
        >(null);

        const [
            selectedRepair,
            setSelectedRepair
        ] = useState<RepairType | null>(null);

        const [repairItems, setRepairItems] = useState<LineItem[]>([]);

        const [form, setForm] =
            useState({
                customer: '',
                phone: '',
                device: '',
                serial_number: '',
                issue: '',
                technician: '',
                branch_id: branches[0]?.id || '',
                entry_date: '',
                labor_rate: '',
                hours_worked: '',
                commission_type: 'Percentage' as 'Percentage' | 'Fixed',
                commission_rate: '',
                is_manual_cost: false,
                estimated_cost: '',
                status:
                    'Pending' as RepairStatus,
            });

        const { isInvalid, errors: fieldErrors } = useFormValidation(form, {
            required: ['customer', 'phone', 'device', 'branch_id', 'entry_date', 'estimated_cost', 'issue'],
            phone: ['phone'],
            minMax: { estimated_cost: { min: 0 } },
            labels: {
                customer: 'Customer Name',
                phone: 'Phone Number',
                device: 'Device',
                branch_id: 'Branch',
                entry_date: 'Entry Date',
                estimated_cost: 'Estimated Cost',
                issue: 'Issue Description',
                labor_rate: 'Labor Rate',
                hours_worked: 'Hours Worked',
                commission_type: 'Commission Type',
                commission_rate: 'Commission Rate'
            }
        });

        const partsSubtotal = useMemo(() => 
            repairItems.reduce((sum, i) => sum + (i.quantity * i.price), 0), 
        [repairItems]);

        const liveTotal = useMemo(() => 
            (parseFloat(form.estimated_cost) || 0) + partsSubtotal,
        [form.estimated_cost, partsSubtotal]);

        const liveCommission = useMemo(() => {
            const val = parseFloat(form.commission_rate || '0') || 0;
            return form.commission_type === 'Percentage'
                ? (liveTotal * (val / 100)).toFixed(2)
                : val.toFixed(2);
        }, [liveTotal, form.commission_rate, form.commission_type]);

        // Automatically calculate estimated labor cost
        useEffect(() => {
            if (!form.is_manual_cost) {
                const rate = parseFloat(form.labor_rate) || 0;
                const hours = parseFloat(form.hours_worked) || 0;
                const calculatedLabor = (rate * hours).toFixed(2);
                setForm(prev => ({ ...prev, estimatedCost: calculatedLabor })); // estimatedCost is still camelCase in form state
            }
        }, [form.labor_rate, form.hours_worked, form.is_manual_cost]);

        const filteredRepairs =
            useMemo(() => {
                let filtered =
                    repairs;

                if (
                    filterStatus !==
                    'All'
                ) {
                    filtered =
                        filtered.filter(
                            item =>
                                item.status === filterStatus // Correctly filter by status
                        );
                }

                if (search) {
                    const term =
                        search.toLowerCase();

                    filtered =
                        filtered.filter(
                            item =>
                                item.id
                                    .toLowerCase()
                                    .includes(
                                        term
                                    ) ||
                                item.customer
                                    .toLowerCase()
                                    .includes(
                                        term
                                    ) ||
                                (item.device || '').toLowerCase()
                                    .includes(
                                        term
                                    ) ||
                                (item.technician || '').toLowerCase()
                                    .includes(
                                        term
                                    ) ||
                                (item.phone || '').toLowerCase()
                                    .includes(
                                        term
                                    ) ||
                                (item.issue || '').toLowerCase()
                                    .includes(
                                        term
                                    ) ||
                                (item.status || '').toLowerCase()
                                    .includes(
                                        term
                                    ) ||
                                (item.entry_date || '').toLowerCase()
                                    .includes(
                                        term
                                    )
                        );
                }

                return filtered;
            }, [
                repairs,
                search,
                filterStatus,
            ]);

        const totalRepairs =
            repairs.length;

        const pendingRepairs =
            repairs.filter(
                r =>
                    r.status ===
                    'Pending'
            ).length;

        const completedRepairs =
            repairs.filter(
                r =>
                    r.status ===
                    'Completed'
            ).length;

        const handleChange = (
            e: React.ChangeEvent<
                | HTMLInputElement
                | HTMLTextAreaElement
                | HTMLSelectElement
            >
        ) => {
            setForm(prev => ({
                ...prev,
                [e.target.name]:
                    e.target.value,
            }));
        };
const handleAddPart = () => {
    const firstProduct = products[0];
    if (!firstProduct) return;
    setRepairItems(prev => [
        ...prev,
        {
            product_id: firstProduct.id,
            product_name: firstProduct.name,
            sku: firstProduct.sku,
            quantity: 1,
            price: firstProduct.sale_price || 0,
        } as LineItem,
    ]);
};

const handlePartChange = (
    index: number,
    field: keyof LineItem,
    value: string | number
) => {
    setRepairItems(prev =>
        prev.map((item, i) => {
            if (i !== index) return item;

            const updated = { ...item, [field]: value };

            if (field === 'product_id') {
                const product = products.find(p => p.id === value);
                if (product) {
                    updated.product_name = product.name;
                    updated.sku = product.sku;
                    updated.price = product.sale_price || 0;
                }
            }
            return updated;
        })
    );
};

const handleRemovePart = (index: number) => {
    setRepairItems(prev =>
        prev.filter((_, i) => i !== index)
    );
};
        const resetForm =
            () => {
                setEditingId(
                    null
                );

                setForm({
                    customer: '',
                    phone: '',
                    device: '',
                serial_number:
                        '',
                    issue: '',
                    technician: '',
                    branch_id: '',
                    entry_date:
                        '',
                    labor_rate: '',
                    hours_worked: '',
                    commission_type: 'Percentage' as 'Percentage' | 'Fixed',
                    commission_rate: '',
                    is_manual_cost: false,
                    estimated_cost:
                        '',
                    status: 'Pending' as RepairStatus,
                });
            };

        const handleSubmit = async (
            e: React.FormEvent
        ) => {
            e.preventDefault();
            if (isInvalid) return;

            // Validation: Check stock if marking as Completed
            if (form.status === 'Completed') {
                const stockCheck = checkStockAvailability(
    repairItems || [],
    products,
    form.branch_id
);
                if (!stockCheck.valid) {
                    alert(stockCheck.error);
                    return;
                }
            }

            const repair_data = {
                    customer:
                        form.customer,
                    phone: form.phone,
                    device: form.device,
                    serial_number: form.serial_number,
                    issue: form.issue,
                    technician: form.technician,
                    branch_id: form.branch_id,
                    entry_date: form.entry_date,
                    labor_rate: Number(form.labor_rate),
                    hours_worked: Number(form.hours_worked),
                    commission_type: form.commission_type,
                    commission_rate: Number(form.commission_rate),
                    commission_amount: Number(liveCommission),
                    estimated_cost: Number(form.estimated_cost),
                    items: repairItems,
                    status: form.status,
                    // Total = Labor (Estimated Cost) + Sum of Parts
                    total: liveTotal
            };

            if (editing_id) {
                await onUpdateRepair?.({ id: editing_id, ...repair_data } as RepairType);
            } else {
                await onAddRepair?.(repair_data);
            }

            resetForm();
        };

        const handleEdit = (item: RepairType) => {
            setEditingId(item.id);
            setForm({
                customer: item.customer,
                phone: item.phone || '',
                device: item.device || '',
                serial_number: item.serial_number || '',
                issue: item.issue,
                technician: item.technician || '',
                branch_id: item.branch_id,
                entry_date: item.entry_date,
                labor_rate: item.labor_rate?.toString() || '',
                hours_worked: item.hours_worked?.toString() || '',
                commission_type: item.commission_type || 'Percentage',
                commission_rate: item.commission_rate?.toString() || '',
                is_manual_cost: false, // Default to auto-calc mode on edit
                estimated_cost: item.estimated_cost?.toString() || '0',
                status: item.status,
            });
            setRepairItems(item.items || []);
        };

        const handleDelete = async (id: string) => {
            if (window.confirm('Delete this repair record?')) {
                await onDeleteRepair?.(id);
            }
        };

        const updateStatus = async (id: string, status: RepairStatus) => {
            const repair = repairs.find(r => r.id === id);
            if (repair) {
                if (status === 'Completed' && repair.items) {
                    const stockCheck = checkStockAvailability(
    repair.items || [],
    products,
    repair.branch_id
);
                    if (!stockCheck.valid) {
                        alert(stockCheck.error);
                        return;
                    }
                }
                await onUpdateRepair?.({ ...repair, status });
                
                // If the item being updated is the one in the detail view, update that state too
                if (selectedRepair?.id === id) {
                    setSelectedRepair({ ...repair, status });
                }
            }
        };


        return (
            <Placeholder title="Repair Center">

                {/* Summary */}
                <div className="@container grid grid-cols-1 @[400px]:grid-cols-2 @[700px]:grid-cols-3 gap-4 mb-6">

                    <div className="card">
                        <p className="text-sm text-brand-secondary dark:text-gray-400">
                            Total Repairs
                        </p>

                        <h2 className="text-2xl font-bold text-sky-600 mt-2">
                            {
                                totalRepairs
                            }
                        </h2>
                    </div>

                    <div className="card">
                        <p className="text-sm text-brand-secondary dark:text-gray-400">
                            Pending Repairs
                        </p>

                        <h2 className="text-2xl font-bold text-amber-500 mt-2">
                            {
                                pendingRepairs
                            }
                        </h2>
                    </div>

                    <div className="card">
                        <p className="text-sm text-brand-secondary dark:text-gray-400">
                            Completed Repairs
                        </p>

                        <h2 className="text-2xl font-bold text-green-600 mt-2">
                            {
                                completedRepairs
                            }
                        </h2>
                    </div>
                </div>

                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">

                    <input
                        type="text"
                        placeholder="Search repair..."
                        value={
                            search
                        }
                        onChange={e =>
                            setSearch(
                                e.target
                                    .value
                            )
                        }
                        className="input-field"
                    />

                    <select
                        value={
                            filterStatus
                        }
                        onChange={e =>
                            setFilterStatus(
                                e.target
                                    .value as
                                    | 'All'
                                    | RepairStatus
                            )
                        }
                        className="input-field"
                    >
                        <option value="All">
                            All Status
                        </option>

                        <option value="Pending">
                            Pending
                        </option>

                        <option value="In Progress">
                            In Progress
                        </option>

                        <option value="Completed">
                            Completed
                        </option>

                        <option value="Cancelled">
                            Cancelled
                        </option>
                    </select>
                </div>

                {/* Form */}
            <SettingsForm
                title={editing_id ? 'Edit Repair' : 'Add New Repair'}
                isEditing={!!editing_id}
                onCancel={resetForm}
                onSubmit={handleSubmit}
                isDisabled={isInvalid}
                submitLabel={editing_id ? 'Update Repair' : 'Add Repair'}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <FormInput
                        label="Customer Name"
                            name="customer"
                        placeholder="Enter customer name"
                            value={
                                form.customer
                            }
                            onChange={
                                handleChange
                            }
                        error={fieldErrors.customer}
                        required
                    />

                    <FormInput
                        label="Phone"
                        type="tel"
                            name="phone"
                        placeholder="e.g. 012 345 678"
                            value={
                                form.phone
                            }
                            onChange={
                                handleChange
                            }
                        error={fieldErrors.phone}
                        required
                    />

                    <FormInput
                        label="Device"
                            name="device"
                        placeholder="e.g. iPhone 14 Pro"
                            value={
                                form.device
                            }
                            onChange={
                                handleChange
                            }
                        error={fieldErrors.device}
                        required
                    />

                    <FormInput
                        label="Serial Number"
                            name="serial_number"
                        placeholder="Device serial or IMEI"
                            value={
                                form.serial_number
                            }
                            onChange={
                                handleChange
                            }
                    />

                    <FormInput
                        label="Technician"
                            name="technician"
                        placeholder="Assign technician"
                            value={
                                form.technician
                            }
                            onChange={
                                handleChange
                            }
                    />

                    <FormSelect
                        label="Branch"
                            name="branch_id"
                        value={form.branch_id}
                        onChange={handleChange}
                        placeholder="Select Branch"
                        options={branches.map(b => ({ value: b.id, label: b.name }))}
                        error={fieldErrors.branch_id}
                        required
                    />

                    <FormInput
                        label="Entry Date"
                        type="date"
                            name="entry_date"
                            value={
                                form.entry_date
                            }
                            onChange={
                                handleChange
                            }
                        error={fieldErrors.entry_date}
                        required
                    />

                    <FormInput
                        label="Labor Rate ($/hr)"
                        type="number"
                        name="labor_rate"
                        placeholder="0.00" // This is already snake_case
                        value={form.labor_rate}
                        onChange={handleChange}
                        error={fieldErrors.labor_rate}
                        min="0"
                        required
                    />

                    <FormInput
                        label="Hours Worked"
                        type="number"
                        name="hours_worked"
                        placeholder="0.0"
                        value={form.hours_worked}
                        onChange={handleChange}
                        error={fieldErrors.hoursWorked}
                        min="0"
                        step="0.1"
                        required
                    />

                    <div className="relative">
                        <div className="absolute right-0 top-0 z-10">
                            <label className="flex items-center gap-1 cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="isManualCost"
                                    checked={form.is_manual_cost}
                                    onChange={(e) => setForm(prev => ({ ...prev, isManualCost: e.target.checked }))}
                                    className="h-3 w-3 text-sky-600 rounded border-gray-300 focus:ring-sky-500"
                                />
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Manual</span>
                            </label>
                        </div>
                        <FormInput
                            label="Estimated Cost"
                            type="number"
                            name="estimated_cost"
                            placeholder="0.00"
                            value={
                                form.estimated_cost
                            }
                            onChange={
                                handleChange
                            }
                            error={fieldErrors.estimated_cost}
                            tooltip={form.is_manual_cost ? "Manual entry enabled" : "Calculated automatically: Rate × Hours"} // This is still camelCase in form state
                            disabled={!form.is_manual_cost} // This is still camelCase in form state
                            min="0"
                            required
                        />
                    </div>

                    <div className="relative">
                        <div className="absolute right-0 top-0 z-10 flex gap-2">
                            <button
                                type="button"
                                onClick={() => setForm(prev => ({ ...prev, commissionType: prev.commission_type === 'Percentage' ? 'Fixed' : 'Percentage' }))}
                                className="text-[10px] font-bold text-sky-600 hover:text-sky-700 uppercase tracking-tighter bg-sky-50 dark:bg-sky-900/30 px-1.5 py-0.5 rounded border border-sky-100 dark:border-sky-800"
                            >
                                {form.commission_type === 'Percentage' ? '% Percent' : '$ Fixed'}
                            </button>
                        </div>
                         <FormInput
                            label={form.commission_type === 'Percentage' ? 'Commission (%)' : 'Fixed Commission ($)'}
                            type="number"
                            name="commissionRate"
                            placeholder="0"
                            value={form.commission_rate}
                            onChange={handleChange}
                            error={fieldErrors.commissionRate}
                            min="0"
                            max={form.commission_type === 'Percentage' ? "100" : undefined} // This is still camelCase in form state
                        />
                        {parseFloat(form.commission_rate) > 0 && form.commission_type === 'Percentage' && (
                            <div className="absolute right-0 top-0 pt-1">
                                <span className="text-[10px] font-bold text-green-600 uppercase tabular-nums">Payout: ${liveCommission}</span>
                            </div>
                        )}
                    </div>

                    <FormSelect
                        label="Status"
                            name="status"
                            value={
                                form.status
                            }
                            onChange={
                                handleChange
                            }
                        options={[
                            { value: 'Pending', label: 'Pending' },
                            { value: 'In Progress', label: 'In Progress' },
                            { value: 'Completed', label: 'Completed' },
                            { value: 'Cancelled', label: 'Cancelled' },
                        ]}
                        required
                    />
                </div>

                <div className="mt-4">
                    <FormInput
                        label="Issue Description"
                        isTextArea
                            name="issue"
                        placeholder="Detailed issue description..."
                            value={
                                form.issue
                            }
                            onChange={
                                handleChange
                            }
                        error={fieldErrors.issue}
                        className="h-24"
                        required
                    />
                </div>

                {/* Parts & Components Section */}
                <div className="mt-6 border-t pt-4 dark:border-gray-700">
                    <div className="flex justify-between items-center mb-3">
                        <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Parts & Components Used</h4>
                        <button 
                            type="button" 
                            onClick={handleAddPart}
                            className="text-xs font-bold text-sky-600 hover:text-sky-700 uppercase"
                        >
                            + Add Part
                        </button>
                    </div>
                    
                    {repairItems.length > 0 ? (
                        <div className="space-y-3">
                            {repairItems.map((item, index) => (
                                <div key={index} className="grid grid-cols-12 gap-2 items-center bg-gray-50 dark:bg-gray-800/50 p-2 rounded-md border border-gray-100 dark:border-gray-700 shadow-sm">
                                    <div className="col-span-6">
                                        <InlineFormSelect 
                                            value={item.product_id}
                                            onChange={(e) => handlePartChange(index, 'product_id', e.target.value)}
                                            options={products.map(p => ({ value: p.id, label: p.name }))}
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <InlineFormInput 
                                            type="number"
                                            placeholder="Qty"
                                            value={item.quantity}
                                            onChange={(e: any) => handlePartChange(index, 'quantity', Number(e.target.value))}
                                            min={1}
                                        />
                                    </div>
                                    <div className="col-span-3">
                                        <InlineFormInput 
                                            type="number"
                                            placeholder="Price"
                                            value={item.price}
                                            onChange={(e: any) => handlePartChange(index, 'price', Number(e.target.value))}
                                            min={0}
                                        />
                                    </div>
                                    <div className="col-span-1 text-center">
                                        <button 
                                            type="button" 
                                            onClick={() => handleRemovePart(index)}
                                            className="text-red-500 hover:text-red-700 font-bold"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                </div>
                            ))}
                            <div className="text-right text-xs font-bold text-gray-500 dark:text-gray-400 pr-2">
                                Parts Subtotal: ${repairItems.reduce((sum, i) => sum + (i.quantity * i.price), 0).toFixed(2)}
                            </div>
                        </div>
                    ) : (
                        <p className="text-xs text-gray-500 italic">No parts added to this repair yet.</p>
                    )}
                </div>
            </SettingsForm>

                {/* Table */}
                <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
                    <table className="min-w-full bg-white dark:bg-gray-800">

                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-300">
                                    Repair ID
                                </th>

                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-300">
                                    Customer
                                </th>

                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-300">
                                    Device
                                </th>

                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-300">
                                    Technician
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

                            {filteredRepairs.length >
                            0 ? (
                                filteredRepairs.map(
                                    item => (
                                        <tr
                                            key={
                                                item.id
                                            }
                                            className="hover:bg-gray-50 dark:hover:bg-gray-700"
                                        >
                                            <td className="px-4 py-3">
                                                <div className="text-sm font-medium text-sky-600 dark:text-sky-400">
                                                    {
                                                        item.id
                                                    }
                                                </div>

                                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                                    {
                                                        item.entry_date
                                                    }
                                                </div>
                                            </td>

                                            <td className="px-4 py-3">
                                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                    {
                                                        item.customer
                                                    }
                                                </div>

                                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                                    {
                                                        item.phone
                                                    }
                                                </div>
                                            </td>

                                            <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                                                {
                                                    item.device
                                                }
                                            </td>

                                            <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                                                {
                                                    item.technician || '-'
                                                }
                                            </td>

                                            <td className="px-4 py-3 text-center">
                                                <select
                                                    value={
                                                        item.status
                                                    }
                                                    onChange={e =>
                                                        updateStatus(
                                                            item.id,
                                                            e
                                                                .target
                                                                .value as RepairStatus
                                                        )
                                                    }
                                                    className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 text-xs"
                                                >
                                                    <option value="Pending">
                                                        Pending
                                                    </option>

                                                    <option value="In Progress">
                                                        In
                                                        Progress
                                                    </option>

                                                    <option value="Completed">
                                                        Completed
                                                    </option>

                                                    <option value="Cancelled">
                                                        Cancelled
                                                    </option>
                                                </select>
                                            </td>

                                            <td className="px-4 py-3">
                                                <div className="flex justify-center gap-2">

                                                    <button
                                                        onClick={() =>
                                                            setSelectedRepair(
                                                                item
                                                            )
                                                        }
                                                        className="px-3 py-1 text-sm bg-sky-500 hover:bg-sky-600 text-white rounded"
                                                    >
                                                        View
                                                    </button>

                                                    <button
                                                        onClick={() =>
                                                            handleEdit(
                                                                item
                                                            )
                                                        }
                                                        className="px-3 py-1 text-sm bg-brand-accent hover:bg-amber-600 text-white rounded"
                                                    >
                                                        Edit
                                                    </button>

                                                    <button
                                                        onClick={() =>
                                                            handleDelete(
                                                                item.id
                                                            )
                                                        }
                                                        className="px-3 py-1 text-sm bg-red-500 hover:bg-red-600 text-white rounded"
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
                                        colSpan={
                                            6
                                        }
                                        className="text-center py-8 text-gray-500 dark:text-gray-400"
                                    >
                                        No repair
                                        records
                                        found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Detail Modal */}
                {selectedRepair && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-2xl p-6">

                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                    Repair
                                    Detail
                                </h2>

                                <button
                                    onClick={() =>
                                        setSelectedRepair(
                                            null
                                        )
                                    }
                                    className="text-gray-500 hover:text-red-500 text-xl"
                                >
                                    ×
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                <div>
                                    <p className="text-xs text-gray-500 uppercase mb-1">
                                        Repair ID
                                    </p>

                                    <p className="font-medium text-gray-900 dark:text-white">
                                        {
                                            selectedRepair.id
                                        }
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs text-gray-500 uppercase mb-1">
                                        Status
                                    </p>

                                    <select
                                        value={
                                            selectedRepair.status
                                        }
                                        onChange={e =>
                                            updateStatus(
                                                selectedRepair.id,
                                                e
                                                    .target
                                                    .value as RepairStatus
                                            )
                                        }
                                        className="input-field"
                                    >
                                        <option value="Pending">
                                            Pending
                                        </option>

                                        <option value="In Progress">
                                            In
                                            Progress
                                        </option>

                                        <option value="Completed">
                                            Completed
                                        </option>

                                        <option value="Cancelled">
                                            Cancelled
                                        </option>
                                    </select>
                                </div>

                                <div>
                                    <p className="text-xs text-gray-500 uppercase mb-1">
                                        Customer
                                    </p>

                                    <p className="font-medium text-gray-900 dark:text-white">
                                        {
                                            selectedRepair.customer
                                        }
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs text-gray-500 uppercase mb-1">
                                        Phone
                                    </p>

                                    <p className="font-medium text-gray-900 dark:text-white">
                                        {
                                            selectedRepair.phone
                                        }
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs text-gray-500 uppercase mb-1">
                                        Device
                                    </p>

                                    <p className="font-medium text-gray-900 dark:text-white">
                                        {
                                            selectedRepair.device
                                        }
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs text-gray-500 uppercase mb-1">
                                        Serial Number
                                    </p>

                                    <p className="font-medium text-gray-900 dark:text-white">
                                        {
                                            selectedRepair.serial_number
                                        }
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs text-gray-500 uppercase mb-1">
                                        Technician
                                    </p>

                                    <p className="font-medium text-gray-900 dark:text-white">
                                        {
                                            selectedRepair.technician
                                        }
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs text-gray-500 uppercase mb-1">
                                        Branch
                                    </p>

                                    <p className="font-medium text-gray-900 dark:text-white">
                                        {
                                            branches.find(b => b.id === selectedRepair.branch_id)?.name || '-'
                                        }
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs text-gray-500 uppercase mb-1">
                                        Labor Rate
                                    </p>
                                    <p className="font-medium text-gray-900 dark:text-white">
                                        ${selectedRepair.labor_rate?.toFixed(2) || '0.00'}/hr
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs text-gray-500 uppercase mb-1">
                                        Hours Worked
                                    </p>
                                    <p className="font-medium text-gray-900 dark:text-white">
                                        {selectedRepair.hours_worked || '0'} hrs
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs text-gray-500 uppercase mb-1">
                                        Estimated
                                        Cost
                                    </p>

                                    <p className="font-semibold text-green-600">
                                        $
                                        {Number(selectedRepair.estimated_cost || 0).toFixed(2)
                                        }
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs text-gray-500 uppercase mb-1">
                                        Technician Commission
                                    </p>
                                    <p className="font-bold text-green-600">
                                        ${selectedRepair.commission_amount?.toFixed(2) || '0.00'} 
                                        <span className="text-[10px] font-normal text-gray-400 ml-1">
                                            ({selectedRepair.commission_type === 'Fixed' ? 'Fixed Fee' : `${selectedRepair.commission_rate || 0}%`})
                                        </span>
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs text-gray-500 uppercase mb-1">
                                        Entry Date
                                    </p>

                                    <p className="font-medium text-gray-900 dark:text-white">
                                        {
                                            selectedRepair.entry_date
                                        }
                                    </p>
                                </div>
                            </div>

                            <div className="mt-5">
                                <p className="text-xs text-gray-500 uppercase mb-2">
                                    Issue
                                    Description
                                </p>

                                <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 text-sm text-gray-700 dark:text-gray-300">
                                    {
                                        selectedRepair.issue
                                    }
                                </div>
                            </div>

                            <div className="flex justify-end mt-6">
                                <button
                                    onClick={() =>
                                        setSelectedRepair(
                                            null
                                        )
                                    }
                                    className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white px-4 py-2 rounded-md"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </Placeholder>
        );
    };

export default RepairCenter;