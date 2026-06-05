import { useCallback } from 'react';
import { Product, StockAction, ProductStatus } from '../types';
import { supabase } from '../supabase/client';

export const useProductHistory = (
    products: Product[],
    setProducts: React.Dispatch<React.SetStateAction<Product[]>>
) => {
    const getStockStatus = (total: number): ProductStatus => {
        if (total > 10) return 'In Stock';
        if (total > 0) return 'Low Stock';
        return 'Out of Stock';
    };

    const recordStockChange = useCallback(async (
        product_id: string,
        branch_id: string,
        branch_name: string,
        change: number,
        action: StockAction,
        reason?: string
    ) => {
        const product = products.find(p => p.id === product_id);
        if (!product) return;

        const currentBranchStock = product.stock_by_location[branch_id] || 0;
        const newBranchStock = currentBranchStock + change;
 
        const updatedStockByLocation = {
            ...product.stock_by_location,
            [branch_id]: newBranchStock,
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
            branch: branch_name,
            reason,
        };

        const updatedHistory = [...(product.history || []), historyEntry];

        const updates = {
    name: product.name,
    price: product.price,
    stock: product.stock,
};

const { error } = await supabase
    .from('products')
    .update(updates)
    .eq('id', product_id);


        // 2. Update Local State
        setProducts(prev =>
            prev.map(p => p.id === product_id ? {
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