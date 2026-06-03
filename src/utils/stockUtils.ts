// utils/stockUtils.ts

import { DataProduct, LineItem } from '../types';

export const checkStockAvailability = (
    items: LineItem[],
    products: DataProduct[],
    branchId?: string
) => {
    for (const item of items) {
        const product = products.find(
            p => p.id === item.productId
        );

        if (!product) {
            return {
                valid: false,
                error: 'Product not found',
            };
        }

        const stock = product.stock ?? 0;

        if (stock < item.quantity) {
            return {
                valid: false,
                error: `${product.name} only has ${stock} in stock`,
            };
        }
    }

    return {
        valid: true,
        error: '',
    };
};