import { useCallback } from 'react';
import { DataProduct, StockAction, ProductStatus } from '../../types';
import { supabase } from '../../utils/supabase';

export const useProductHistory = (
    products: DataProduct[],
    setProducts: React.Dispatch<React.SetStateAction<DataProduct[]>>
) => {
    const getStockStatus = (total: number): ProductStatus => {
        if (total > 10) return 'In Stock';
        if (total > 0) return 'Low Stock';
        return 'Out of Stock';
    };

    const recordStockChange = useCallback(async (
        productId: string,
        branchId: string,
        branchName: string,
        change: number,
        action: StockAction,
        reason?: string
    ) => {
        const product = products.find(p => p.id === productId);
        if (!product) return;

        const currentBranchStock = product.stockByLocation[branchId] || 0;
        const newBranchStock = currentBranchStock + change;

        const updatedStockByLocation = {
            ...product.stockByLocation,
            [branchId]: newBranchStock,
        };

        // Recalculate total stock across all branches for status update
        const newTotalStock = Object.values(updatedStockByLocation).reduce(
            (sum, qty) => sum + qty,
            0
        );

        const newStatus = getStockStatus(newTotalStock);

        const historyEntry = {
            date: new Date().toISOString().split('T')[0],
            action,
            change,
            newStock: newBranchStock,
            branch: branchName,
            reason,
        };

        const updatedHistory = [...(product.history || []), historyEntry];

        // 1. Persist change to Supabase
        const { error } = await supabase
            .from('products')
            .update({
                stockByLocation: updatedStockByLocation,
                status: newStatus,
                history: updatedHistory
            })
            .eq('id', productId);

        if (error) {
            console.error('Failed to update product in database:', error.message);
            return;
        }

        // 2. Update Local State
        setProducts(prev =>
            prev.map(p => p.id === productId ? {
                ...p,
                stockByLocation: updatedStockByLocation,
                status: newStatus,
                history: updatedHistory,
            } : p)
        );
    }, [products, setProducts]);

    return {
        recordStockChange,
        getStockStatus // Reusable helper
    };
};