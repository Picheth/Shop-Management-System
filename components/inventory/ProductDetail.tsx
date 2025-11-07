import React from 'react';
import { DataProduct } from '../../types';
// FIX: Corrected the import path for StatusBadge to point to its actual location in the ui directory.
import { StatusBadge } from '../ui/StatusBadge';

interface ProductDetailProps {
    product: DataProduct;
    onBack: () => void;
}

const ProductDetail: React.FC<ProductDetailProps> = ({ product, onBack }) => {

    const DetailItem: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
        <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</p>
            <p className="mt-1 text-md text-gray-900 dark:text-white">{value}</p>
        </div>
    );

    return (
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6">
            <div className="flex items-center mb-6">
                <button onClick={onBack} className="mr-4 text-sky-600 dark:text-sky-400 hover:underline flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Products
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-1 flex flex-col items-center">
                    <div className="w-48 h-48 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center mb-4">
                        {product.imageUrl ? (
                             <img src={product.imageUrl} alt={product.name} className="object-cover w-full h-full rounded-lg" />
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        )}
                    </div>
                     <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center">{product.name}</h2>
                </div>

                <div className="md:col-span-2 space-y-6">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        <DetailItem label="SKU" value={product.sku} />
                        <DetailItem label="Category" value={product.category} />
                        <DetailItem label="Price" value={`$${product.price.toFixed(2)}`} />
                        <DetailItem label="Current Stock" value={product.stock} />
                        <DetailItem label="Status" value={<StatusBadge status={product.status} />} />
                    </div>
                </div>
            </div>

            <div className="mt-10">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Stock History</h3>
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Action</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Change</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">New Stock</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                            {product.history.map((item, index) => (
                                <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{item.date}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{item.action}</td>
                                    <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-medium ${item.change > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                        {item.change > 0 ? `+${item.change}` : item.change}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500 dark:text-gray-300">{item.newStock}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    );
};

export default ProductDetail;