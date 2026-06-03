import React from 'react';
import Product from '../components/product/Product';
import { useProducts } from '../hooks/useProducts';

/**
 * The ProductPage acts as the high-level route component, 
 * connecting the Product module to the global data hooks.
 */
const ProductPage: React.FC<any> = (props) => {
    const { totalCount } = useProducts({
        products: props.products,
        allCategories: props.allCategories,
        allProductTypes: props.allProductTypes,
        processors: props.processors,
        rams: props.rams,
        storages: props.storages,
        colors: props.colors,
        regions: props.regions
    });

    return (
        <div className="animate-fade-in">
            <Product {...props} totalItems={totalCount} />
        </div>
    );
};

export default ProductPage;
