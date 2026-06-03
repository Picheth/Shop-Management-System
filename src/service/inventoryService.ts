import { supabase } from '../supabase/client';
import { DataProduct, ProductVariant } from '../types';

/**
 * Service to handle all database operations related to Inventory and Products.
 */
export const inventoryService = {
    /**
     * Fetches all product variants with their associated specification data.
     */
    async getVariants() {
        const { data, error } = await supabase
            .from('product_variants')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        return data as ProductVariant[];
    },

    /**
     * Adds a new product using the atomic RPC function to ensure 
     * both specification and initial variant are created together.
     */
    async createProduct(formData: any) {
        const { data, error } = await supabase.rpc('create_product_with_variant', {
            p_name: formData.name,
            p_brand_id: formData.brandId,
            p_type_id: formData.typeId,
            p_category_id: formData.categoryId,
            p_sub_category_id: formData.subCategoryId || null,
            p_model: formData.model || null,
            p_display_size: formData.displaySize || null,
            p_sku: formData.sku,
            p_stock: Number(formData.initialStock), // This is for the initial variant's stock
            p_cost_price: Number(formData.costPrice),
            p_sale_price: Number(formData.salePrice),
            p_storage_id: formData.storageId || null,
            p_ram_id: formData.ramId || null,
            p_color_id: formData.colorId || null,
            p_condition_id: formData.conditionId || null,
            p_description: formData.description || null,
            p_has_serial_number: !!formData.hasSerialNumber,
            p_has_imei: !!formData.hasIMEI,
            p_image_url: formData.imageUrl || null,
            p_attributes: formData.attributes || [],
            p_is_active: formData.isActive ?? true
        });

        if (error) throw error;
        return data;
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