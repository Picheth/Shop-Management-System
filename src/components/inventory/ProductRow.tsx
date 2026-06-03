import React from 'react';
import { 
    DataProduct, 
    MasterAttribute, 
    Category, 
    ProductType, 
    Brand 
} from '../../types';
import { getAttrName, getProductConfiguration } from '../../utils/productHelpers';
import StatusBadge from '../ui/StatusBadge';
import { EditIcon, TrashIcon, MultiDeleteIcon } from '../ui/Icons';

interface ProductRowProps {
    product: DataProduct;
    allProductTypes: ProductType[];
    allCategories: Category[];
    allBrands: Brand[];
    processors: MasterAttribute[];
    rams: MasterAttribute[];
    storages: MasterAttribute[];
    colors: MasterAttribute[];
    regions: MasterAttribute[];
    onView: (product: DataProduct) => void;
    onEdit: (product: DataProduct) => void;
    onDeleteVariant: (id: string) => void;
    onDeleteProduct: (product: DataProduct) => void;
}

const ProductRow: React.FC<ProductRowProps> = React.memo(({
    product, allProductTypes, allCategories, allBrands,
    processors, rams, storages, colors, regions,
    onView, onEdit, onDeleteVariant, onDeleteProduct
}) => {
    const config = getProductConfiguration(product, processors, rams, storages, colors, regions);

    return (
        <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors border-t border-gray-100 dark:border-gray-700">
            <td className="px-6 py-4 whitespace-nowrap">
                <button
                    onClick={() => onView(product)}
                    className="text-sm font-bold text-sky-600 dark:text-sky-400 hover:underline text-left"
                >
                    {product.name}
                </button>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500 dark:text-gray-400">
                {product.sku}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                {getAttrName(allProductTypes, product.typeId)}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                {getAttrName(allBrands, product.brandId)}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                {getAttrName(allCategories, product.categoryId)}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm italic text-gray-400">
                {config}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-black tabular-nums">
                {product.stockByLocation
                    ? Object.values(product.stockByLocation).reduce(
                          (sum, qty) => sum + qty,
                          0
                      )
                    : 0}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-center">
                <StatusBadge status={product.status} />
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-right">
                <div className="flex justify-end gap-2">
                    <button
                        onClick={() => onEdit(product)}
                        className="p-1.5 text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-md transition-colors"
                        title="Edit Variant"
                    >
                        <EditIcon size={18} />
                    </button>
                    <button
                        onClick={() => onDeleteVariant(product.id)}
                        className="p-1.5 text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-md transition-colors"
                        title="Delete Variant"
                    >
                        <TrashIcon size={18} />
                    </button>
                    <button
                        onClick={() => onDeleteProduct(product)}
                        className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                        title="Delete Entire Product"
                    >
                        <MultiDeleteIcon size={18} />
                    </button>
                </div>
            </td>
        </tr>
    );
});

export default ProductRow;