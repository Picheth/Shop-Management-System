import React, { useState, useMemo } from 'react';
import { Product, Branch } from '../../types';
import Placeholder from '../ui/Placeholder';
import Modal from '../ui/Modal';
import StockAdjustmentForm from './StockAdjustmentForm';
import { useProductHistory } from '../../hooks/useProductHistory';
import { supabase } from '../../supabase/supabase';


interface InventoryProps {
    products: Product[];
    setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
    branches: Branch[];
}

const handleLoadInventory = async () => {
    const { data: inventory, error } = await supabase
        .from('inventory')
        .select('*');

    if (error) {
        console.error(error.message);
        return; // ✅ Valid
    }

    console.log(inventory);
};

const Inventory: React.FC<InventoryProps> = ({ products, setProducts, branches }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [productToAdjust, setProductToAdjust] = useState<Product | null>(null);
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
    const [selectedBranchId, setSelectedBranchId] = useState<string>('all');

    const { recordStockChange } = useProductHistory(products, setProducts);

    const getTotalStock = (p: Product) =>
        Object.values(p.stock_by_location || {}).reduce((a, b) => a + b, 0);

    const getBranchStock = (p: Product) =>
        selectedBranchId === 'all'
            ? getTotalStock(p)
            : p.stock_by_location?.[selectedBranchId] || 0;

    const processedProducts = useMemo(() => {
        return products.map(p => ({
            ...p,
            displayStock: getBranchStock(p),
        }));
    }, [products, selectedBranchId]);

    const stockColumnHeader = useMemo(() => {
        if (selectedBranchId === 'all') return 'Total Stock'; // Correctly set stock column header
        const branch = branches.find(b => b.id === selectedBranchId);
        return branch ? `Stock at ${branch.name}` : 'Stock';
    }, [selectedBranchId, branches]);

    const handleStockAdjustment = async (
        productId: string,
        branchId: string,
        newQuantity: number,
        reason: string,
        note?: string
    ) => {
        const branchName = branches.find(b => b.id === branchId)?.name || 'Unknown';

        const currentStock = productToAdjust?.stock_by_location[branchId] || 0;
        const change = newQuantity - currentStock;

        const finalReason = note ? `${reason} (${note})` : reason;

        await recordStockChange(
            productId,
            branchId,
            branchName,
            change,
            'Adjustment',
            finalReason
        );

        setIsModalOpen(false);
        setProductToAdjust(null);
    };

    return (
        <Placeholder title="Inventory Management">
            <div className="mb-4">
                <select
                    value={selectedBranchId}
                    onChange={(e) => setSelectedBranchId(e.target.value)}
                    className="mt-1 w-full sm:w-64"
                >
                    <option value="all">All Branches</option>
                    {branches.map(b => (
                        <option key={b.id} value={b.id}>
                            {b.name}
                        </option>
                    ))}
                </select>
            </div>

            <table className="min-w-full">
                <thead>
                    <tr>
                        <th>Product</th>
                        <th>SKU</th>
                        <th>{stockColumnHeader}</th>
                        <th>Action</th>
                    </tr>
                </thead>

                <tbody>
                    {processedProducts.map(product => (
                        <tr key={product.id}>
                            <td>{product.name}</td>
                            <td>{product.sku}</td>
                            <td>{product.displayStock}</td>
                            <td>
                                <button onClick={() => {
                                    setProductToAdjust(product);
                                    setIsModalOpen(true);
                                }}>
                                    Adjust
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {isModalOpen && productToAdjust && (
                <Modal title="Stock Adjustment" onClose={() => setIsModalOpen(false)}>
                    <StockAdjustmentForm
                        product={productToAdjust}
                        branches={branches}
                        onAdjust={handleStockAdjustment}
                        onCancel={() => setIsModalOpen(false)}
                    />
                </Modal>
            )}
        </Placeholder>
    );
};

export default Inventory;