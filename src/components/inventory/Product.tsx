import React, { useMemo, useState } from 'react';
import { DataProduct, Branch } from '../../types';
import { ProductType as ProductTypeInterface, Category as CategoryInterface, SubCategory as SubCategoryInterface, Brand as BrandInterface } from '../../types';
interface ProductProps {
    products: DataProduct[];
    branches: Branch[];
}

const Product: React.FC<ProductProps> = ({ products, branches }) => {
    const [search, setSearch] = useState('');

    const filtered = useMemo(() => {
        return products.filter(p => // Correctly filter products
            p.name.toLowerCase().includes(search.toLowerCase()) ||
            p.sku.toLowerCase().includes(search.toLowerCase()) ||
            (p.productNumber && p.productNumber.toLowerCase().includes(search.toLowerCase()))
        );
    }, [products, search]);

    const getTotalStock = (p: DataProduct) =>
        Object.values(p.stockByLocation || {}).reduce((a, b) => a + b, 0);

    return (
        <div className="p-4">
            <div className="flex justify-between mb-4">
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search products..."
                    className="border px-3 py-2 rounded w-64"
                />
            </div>

            <table className="w-full border">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>SKU</th>
                        <th>Total Stock</th>
                        <th>Status</th>
                    </tr>
                </thead>

                <tbody>
                    {filtered.map(p => (
                        <tr key={p.id}>
                            <td>{p.name}</td>
                            <td>{p.sku}</td>
                            <td>{getTotalStock(p)}</td>
                            <td>{p.status}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Product;