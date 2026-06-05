import { supabase } from '../supabase/supabase';
import { Product, ProductVariant, Purchase } from '../types';
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
    async createProduct(formData: Product) {
        const payload: Database['public']['Functions']['create_product_with_variant']['Args'] = {
            p_name: formData.name,
            p_brand_id: formData.brand_id || '',
            p_type_id: formData.type_id || '',
            p_category_id: formData.category_id,
            p_sub_category_id: formData.sub_category_id || null,
            p_model: formData.model || null,
            p_display_size: formData.display_size || null,
            p_sku: formData.sku,
            p_stock: Number(formData.initial_stock || 0),
            p_cost_price: Number(formData.cost_price),
            p_sale_price: Number(formData.sale_price),
            p_processor_id: formData.processor_id || null,
            p_ram_id: formData.ram_id || null,
            p_storage_id: formData.storage_id || null,
            p_color_id: formData.color_id || null,
            p_region_id: formData.region_id || null,
            p_condition_id: formData.condition_id || null,
            p_description: formData.description || null,
            p_has_serial_number: !!formData.has_serial_number,
            p_has_imei: !!formData.has_imei,
            p_image_url: formData.image_url || null,
            p_attributes: (formData.attributes as any) || [], // This is already snake_case
            p_is_active: formData.is_active ?? true
        };

        const { data, error } = await supabase.rpc('create_product_with_variant', payload);

        if (error) throw error;
        return data as Database['public']['Tables']['products']['Row'];
    },

    /**
     * Updates an existing product specification and its associated variant.
     */
    async updateProduct(updatedProduct: Product) {
        const payload: Database['public']['Functions']['update_product_spec_and_variant']['Args'] = {
            p_variant_id: updatedProduct.id,
            p_spec_id: updatedProduct.product_spec_id || updatedProduct.id,
            p_name: updatedProduct.name,
            p_brand_id: updatedProduct.brand_id || '',
            p_type_id: updatedProduct.type_id || '',
            p_category_id: updatedProduct.category_id,
            p_sub_category_id: updatedProduct.sub_category_id || null,
            p_model: updatedProduct.model || null,
            p_display_size: updatedProduct.display_size || null,
            p_sku: updatedProduct.sku,
            p_stock_quantity: Number(updatedProduct.stock_quantity || 0),
            p_cost_price: Number(updatedProduct.cost_price),
            p_sale_price: Number(updatedProduct.sale_price),
            p_processor_id: updatedProduct.processor_id || null,
            p_ram_id: updatedProduct.ram_id || null,
            p_storage_id: updatedProduct.storage_id || null,
            p_color_id: updatedProduct.color_id || null,
            p_region_id: updatedProduct.region_id || null,
            p_condition_id: updatedProduct.condition_id || null,
            p_is_active: updatedProduct.is_active ?? true,
            p_description: updatedProduct.description || null,
            p_has_serial_number: !!updatedProduct.has_serial_number,
            p_has_imei: !!updatedProduct.has_imei,
            p_image_url: updatedProduct.image_url || null,
            p_attributes: (updatedProduct.attributes as any) || [] // This is already snake_case
        };

        const { data, error } = await supabase.rpc('update_product_spec_and_variant', payload);

        if (error) throw error;
        return data as Database['public']['Tables']['products']['Row'];
    },

    /**
     * Deletes a product specification and all its related variants (cascade).
     */
    async deleteProductSpec(spec_id: string) {
        const { error } = await supabase.rpc('delete_product_spec_cascade', {
            p_spec_id: spec_id
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
            .contains('items', [{ product_id: productId }])
            .order('sale_date', { ascending: false });

        if (error) throw error;
        return data as Database['public']['Tables']['sales']['Row'][];
    },

    /**
     * Deletes a variant from the database.
     */
    async deleteVariant(variant_id: string) {
        const { error } = await supabase.rpc('delete_variant', {
            p_variant_id: variant_id
        });
        if (error) throw error;
    },



    /**
     * Records a new purchase and updates stock atomically.
     */
    async recordPurchase(purchase: Purchase) {
        const payload: Database['public']['Functions']['record_purchase']['Args'] = {
                p_purchase_number: purchase.purchase_number,
                p_supplier_id: purchase.supplier_id,
                p_branch_id: purchase.branch_id,
                p_purchase_date: purchase.purchase_date,
                p_items: purchase.items,
                p_total: purchase.total,
                p_is_active: true
            };
        const { data, error } = await supabase.rpc('record_purchase', payload);
        if (error) throw error;
        return data;
    }
};