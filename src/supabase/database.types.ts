export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      brands: {
        Row: { id: string; name: string; code: string | null; created_at: string; updated_at: string | null }
        Insert: { id?: string; name: string; code?: string | null; created_at?: string; updated_at?: string | null }
        Update: { id?: string; name?: string; code?: string | null; created_at?: string; updated_at?: string | null }
      }
      products: {
        Row: {
          id: string; name: string; sku: string; brand_id: string | null; category_id: string | null;
          type_id: string | null; sub_category_id: string | null; model: string | null;
          attributes: Json | null; stock_by_location: Json; status: string;
          has_serial_number: boolean; has_imei: boolean; image_url: string | null;
          description: string | null; created_at: string; updated_at: string | null;
        }
        Insert: { /* ... mapping same as Row ... */ }
        Update: { /* ... mapping same as Row ... */ }
      }
      product_variants: {
        Row: {
          id: string; product_id: string; sku: string; price: number | null; cost: number | null;
          stock_quantity: number; is_active: boolean; processor_id: string | null;
          ram_id: string | null; storage_id: string | null; color_id: string | null;
          region_id: string | null; condition_id: string | null; created_at: string;
        }
        Insert: { /* ... mapping same as Row ... */ }
        Update: { /* ... mapping same as Row ... */ }
      }
      sales: {
        Row: { id: string; customer: string; branch_id: string; sale_date: string; total: number; status: string; items: Json; created_at: string }
        Insert: { id?: string; customer: string; branch_id: string; sale_date?: string; total: number; status?: string; items: Json; created_at?: string }
        Update: { id?: string; customer?: string; branch_id?: string; sale_date?: string; total?: number; status?: string; items?: Json; created_at?: string }
      }
      repairs: {
        Row: {
          id: string; customer: string; phone: string | null; device: string | null; 
          issue: string; status: string; branch_id: string; technician: string | null;
          estimated_cost: number | null; commission_amount: number | null;
          items: Json | null; entry_date: string; created_at: string;
        }
        Insert: { /* ... mapping same as Row ... */ }
        Update: { /* ... mapping same as Row ... */ }
      }
      error_logs: {
        Row: { id: string; created_at: string; message: string; stack: string | null; component_name: string | null; url: string | null; severity: string; user_id: string | null }
        Insert: { id?: string; created_at?: string; message: string; stack?: string | null; component_name?: string | null; url?: string | null; severity: string; user_id?: string | null }
        Update: { id?: string; created_at?: string; message?: string; stack?: string | null; component_name?: string | null; url?: string | null; severity?: string; user_id?: string | null }
      }
      product_types: { Row: { id: string; name: string; code: string | null; active: boolean }; Insert: { id?: string; name: string; code?: string | null; active?: boolean }; Update: { id?: string; name?: string; code?: string | null; active?: boolean } }
      categories: { Row: { id: string; name: string; code: string | null; type_id: string }; Insert: { id?: string; name: string; code?: string | null; type_id: string }; Update: { id?: string; name?: string; code?: string | null; type_id?: string } }
      sub_categories: { Row: { id: string; name: string; code: string | null; category_id: string }; Insert: { id?: string; name: string; code?: string | null; category_id: string }; Update: { id?: string; name?: string; code?: string | null; category_id?: string } }
      processors: { Row: { id: string; name: string }; Insert: { id?: string; name: string }; Update: { id?: string; name?: string } }
      rams: { Row: { id: string; name: string }; Insert: { id?: string; name: string }; Update: { id?: string; name?: string } }
      storages: { Row: { id: string; name: string }; Insert: { id?: string; name: string }; Update: { id?: string; name?: string } }
      colors: { Row: { id: string; name: string }; Insert: { id?: string; name: string }; Update: { id?: string; name?: string } }
      regions: { Row: { id: string; name: string }; Insert: { id?: string; name: string }; Update: { id?: string; name?: string } }
      conditions: { Row: { id: string; name: string }; Insert: { id?: string; name: string }; Update: { id?: string; name?: string } }
      settings: { Row: { id: number; company_name: string | null; address: string | null; company_logo_url: string | null; signature_url: string | null }; Insert: { id?: number; company_name?: string | null; address?: string | null; company_logo_url?: string | null; signature_url?: string | null }; Update: { id?: number; company_name?: string | null; address?: string | null; company_logo_url?: string | null; signature_url?: string | null } }
      stock_transfers: { Row: { id: string; short_code: string | null; from_branch_id: string; to_branch_id: string; status: string; items: Json; created_at: string }; Insert: { id?: string; short_code?: string | null; from_branch_id: string; to_branch_id: string; status?: string; items: Json; created_at?: string }; Update: { id?: string; short_code?: string | null; from_branch_id?: string; to_branch_id?: string; status?: string; items?: Json; created_at?: string } }
    }
    Functions: {
      create_product_with_variant: {
        Args: {
          p_name: string;
          p_brand_id: string;
          p_type_id: string;
          p_category_id: string;
          p_sub_category_id?: string | null;
          p_model?: string | null;
          p_display_size?: string | null;
          p_sku: string;
          p_stock: number;
          p_cost_price: number;
          p_sale_price: number;
          p_processor_id?: string | null;
          p_ram_id?: string | null;
          p_storage_id?: string | null;
          p_color_id?: string | null;
          p_region_id?: string | null;
          p_condition_id?: string | null;
          p_description?: string | null;
          p_has_serial_number?: boolean;
          p_has_imei?: boolean;
          p_image_url?: string | null;
          p_attributes: Json;
          p_is_active: boolean;
        }
        Returns: Json
      }
      process_sale_stock: { Args: { p_branch_id: string; p_items: Json }; Returns: void }
      update_product_spec_and_variant: {
        Args: {
          p_variant_id: string;
          p_spec_id: string;
          p_name: string;
          p_brand_id: string;
          p_type_id: string;
          p_category_id: string;
          p_sub_category_id?: string | null;
          p_model?: string | null;
          p_display_size?: string | null;
          p_sku: string;
          p_stock_quantity: number;
          p_cost_price: number;
          p_sale_price: number;
          p_processor_id?: string | null;
          p_ram_id?: string | null;
          p_storage_id?: string | null;
          p_color_id?: string | null;
          p_region_id?: string | null;
          p_condition_id?: string | null;
          p_is_active: boolean;
          p_description?: string | null;
          p_has_serial_number?: boolean;
          p_has_imei?: boolean;
          p_image_url?: string | null;
          p_attributes: Json;
        };
        Returns: Json
      };
    }
  }
}