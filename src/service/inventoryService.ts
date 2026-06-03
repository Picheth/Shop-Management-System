import { supabase } from '../supabase/client';
import { DataProduct, ProductVariant } from '../types';
import { Database } from '../supabase/database.types'; // Import the generated Database type

/**
 * Service to handle all database operations related to Inventory and Products.
 */
export const inventoryService = {
    /**
     * Fetches all product variants with their associated specification data.
     */
    async getVariants() {
        const { data, error } = await supabase
            .from('product_variants') // TypeScript will now validate 'product_variants' as a valid table name
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        // The 'data' variable is now automatically typed by Supabase client
        // based on your database.types.ts. You can cast it to your custom ProductVariant[]
        // if your custom type extends or matches the generated type.
        return data as Database['public']['Tables']['product_variants']['Row'][];
    },

    /**
     * Fetches all products.
     */
    async getProducts() {
        const { data, error } = await supabase
            .from('products') // Type-checked table name
            .select('*') // Type-checked columns based on 'products' table
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data as Database['public']['Tables']['products']['Row'][];
    },

    /**
     * Adds a new product using the atomic RPC function to ensure 
     * both specification and initial variant are created together.
     */
    async createProduct(formData: DataProduct) {
        const payload: Database['public']['Functions']['create_product_with_variant']['Args'] = {
            p_name: formData.name,
            p_brand_id: formData.brandId,
            p_type_id: formData.typeId,
            p_category_id: formData.categoryId,
            p_sub_category_id: formData.subCategoryId || null,
            p_model: formData.model || null,
            p_display_size: formData.displaySize || null,
            p_sku: formData.sku,
            p_stock: Number(formData.initialStock || 0),
            p_cost_price: Number(formData.costPrice),
            p_sale_price: Number(formData.salePrice),
            p_processor_id: formData.processorId || null,
            p_ram_id: formData.ramId || null,
            p_storage_id: formData.storageId || null,
            p_color_id: formData.colorId || null,
            p_region_id: formData.regionId || null,
            p_condition_id: formData.conditionId || null,
            p_description: formData.description || null,
            p_has_serial_number: !!formData.hasSerialNumber,
            p_has_imei: !!formData.hasIMEI,
            p_image_url: formData.imageUrl || null,
            p_attributes: formData.attributes || [],
            p_is_active: formData.isActive ?? true
        };

        const { data, error } = await supabase.rpc('create_product_with_variant', payload);

        if (error) throw error;
        return data as Database['public']['Tables']['products']['Row'];
    },

    /**
     * Updates an existing product specification and its associated variant.
     */
    async updateProduct(updatedProduct: DataProduct) {
        const payload: Database['public']['Functions']['update_product_spec_and_variant']['Args'] = {
            p_variant_id: updatedProduct.id,
            p_spec_id: updatedProduct.productSpecId || updatedProduct.id,
            p_name: updatedProduct.name,
            p_brand_id: updatedProduct.brandId,
            p_type_id: updatedProduct.typeId,
            p_category_id: updatedProduct.categoryId,
            p_sub_category_id: updatedProduct.subCategoryId || null,
            p_model: updatedProduct.model || null,
            p_display_size: updatedProduct.displaySize || null,
            p_sku: updatedProduct.sku,
            p_stock_quantity: Number(updatedProduct.stockQuantity || 0),
            p_cost_price: Number(updatedProduct.costPrice),
            p_sale_price: Number(updatedProduct.salePrice),
            p_processor_id: updatedProduct.processorId || null,
            p_ram_id: updatedProduct.ramId || null,
            p_storage_id: updatedProduct.storageId || null,
            p_color_id: updatedProduct.colorId || null,
            p_region_id: updatedProduct.regionId || null,
            p_condition_id: updatedProduct.conditionId || null,
            p_is_active: updatedProduct.isActive ?? true,
            p_description: updatedProduct.description || null,
            p_has_serial_number: !!updatedProduct.hasSerialNumber,
            p_has_imei: !!updatedProduct.hasIMEI,
            p_image_url: updatedProduct.imageUrl || null,
            p_attributes: updatedProduct.attributes || []
        };

        const { data, error } = await supabase.rpc('update_product_spec_and_variant', payload);

        if (error) throw error;
        return data as Database['public']['Tables']['products']['Row'];
    },

    /**
     * Deletes a product specification and all its related variants (cascade).
     */
    async deleteProductSpec(specId: string) {
        const { error } = await supabase.rpc('delete_product_spec_cascade', {
            p_spec_id: specId
        });
        if (error) throw error;
    },

    /**
     * Fetches all sales that included a specific product.
     */
    async getProductSales(productId: string) {
        const { data, error } = await supabase
            .from('sales')
            .select('*')
            .contains('items', [{ productId }])
            .order('sale_date', { ascending: false });

        if (error) throw error;
        return data as Database['public']['Tables']['sales']['Row'][];
    },

    /**
     * Deletes a variant from the database.
     */
    async deleteVariant(variantId: string) {
        const { error } = await supabase.rpc('delete_specific_variant', {
            p_variant_id: variantId
        });
        if (error) throw error;
    }
};