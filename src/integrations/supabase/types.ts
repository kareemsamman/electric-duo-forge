export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      certificates: {
        Row: {
          certificate_image: string
          certificate_image_en: string | null
          certificate_name: string
          certificate_name_en: string | null
          created_at: string
          id: string
          images: string[] | null
          pdf_file: string | null
          pdf_file_en: string | null
          short_description: string
          short_description_en: string | null
        }
        Insert: {
          certificate_image: string
          certificate_image_en?: string | null
          certificate_name: string
          certificate_name_en?: string | null
          created_at?: string
          id?: string
          images?: string[] | null
          pdf_file?: string | null
          pdf_file_en?: string | null
          short_description: string
          short_description_en?: string | null
        }
        Update: {
          certificate_image?: string
          certificate_image_en?: string | null
          certificate_name?: string
          certificate_name_en?: string | null
          created_at?: string
          id?: string
          images?: string[] | null
          pdf_file?: string | null
          pdf_file_en?: string | null
          short_description?: string
          short_description_en?: string | null
        }
        Relationships: []
      }
      client_logos: {
        Row: {
          company_name: string
          company_name_en: string | null
          created_at: string
          display_order: number | null
          id: string
          logo_image: string
        }
        Insert: {
          company_name: string
          company_name_en?: string | null
          created_at?: string
          display_order?: number | null
          id?: string
          logo_image: string
        }
        Update: {
          company_name?: string
          company_name_en?: string | null
          created_at?: string
          display_order?: number | null
          id?: string
          logo_image?: string
        }
        Relationships: []
      }
      gallery: {
        Row: {
          category: string
          created_at: string
          description: string | null
          description_en: string | null
          id: string
          image: string
          title: string
          title_en: string | null
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          description_en?: string | null
          id?: string
          image: string
          title: string
          title_en?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          description_en?: string | null
          id?: string
          image?: string
          title?: string
          title_en?: string | null
        }
        Relationships: []
      }
      orders: {
        Row: {
          cart_items: Json
          created_at: string | null
          customer_address: string
          customer_city: string
          customer_email: string
          customer_name: string
          customer_notes: string | null
          customer_phone: string
          delivery_fee: number | null
          email_last_error: string | null
          email_last_sent_at: string | null
          email_last_status: string | null
          email_last_type: string | null
          id: string
          payment_method: string | null
          payment_status: string | null
          status: string | null
          subtotal: number
          total: number
          total_items: number
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          cart_items: Json
          created_at?: string | null
          customer_address: string
          customer_city: string
          customer_email: string
          customer_name: string
          customer_notes?: string | null
          customer_phone: string
          delivery_fee?: number | null
          email_last_error?: string | null
          email_last_sent_at?: string | null
          email_last_status?: string | null
          email_last_type?: string | null
          id?: string
          payment_method?: string | null
          payment_status?: string | null
          status?: string | null
          subtotal: number
          total: number
          total_items: number
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          cart_items?: Json
          created_at?: string | null
          customer_address?: string
          customer_city?: string
          customer_email?: string
          customer_name?: string
          customer_notes?: string | null
          customer_phone?: string
          delivery_fee?: number | null
          email_last_error?: string | null
          email_last_sent_at?: string | null
          email_last_status?: string | null
          email_last_type?: string | null
          id?: string
          payment_method?: string | null
          payment_status?: string | null
          status?: string | null
          subtotal?: number
          total?: number
          total_items?: number
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      products: {
        Row: {
          category: string
          created_at: string
          display_order: number
          id: string
          images: string[] | null
          in_stock: boolean | null
          is_featured: boolean | null
          price: number
          product_description: string
          product_description_en: string | null
          product_image: string
          product_name: string
          product_name_en: string | null
          product_specs: string
          product_specs_en: string | null
          related_product_ids: string[] | null
          short_description_en: string | null
          short_description_he: string | null
          sku: string | null
          slug: string | null
          stock_qty: number | null
          thumbnail: string | null
        }
        Insert: {
          category: string
          created_at?: string
          display_order?: number
          id?: string
          images?: string[] | null
          in_stock?: boolean | null
          is_featured?: boolean | null
          price: number
          product_description: string
          product_description_en?: string | null
          product_image: string
          product_name: string
          product_name_en?: string | null
          product_specs: string
          product_specs_en?: string | null
          related_product_ids?: string[] | null
          short_description_en?: string | null
          short_description_he?: string | null
          sku?: string | null
          slug?: string | null
          stock_qty?: number | null
          thumbnail?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          display_order?: number
          id?: string
          images?: string[] | null
          in_stock?: boolean | null
          is_featured?: boolean | null
          price?: number
          product_description?: string
          product_description_en?: string | null
          product_image?: string
          product_name?: string
          product_name_en?: string | null
          product_specs?: string
          product_specs_en?: string | null
          related_product_ids?: string[] | null
          short_description_en?: string | null
          short_description_he?: string | null
          sku?: string | null
          slug?: string | null
          stock_qty?: number | null
          thumbnail?: string | null
        }
        Relationships: []
      }
      project_inquiries: {
        Row: {
          accountant_name: string | null
          accountant_phone: string | null
          city: string
          company_id: string
          company_name: string
          contact_name: string
          created_at: string
          email: string
          file_urls: string[] | null
          id: string
          mobile: string
          notes: string | null
          status: string | null
          street: string
          street_number: string
          updated_at: string
          zip_code: string | null
        }
        Insert: {
          accountant_name?: string | null
          accountant_phone?: string | null
          city: string
          company_id: string
          company_name: string
          contact_name: string
          created_at?: string
          email: string
          file_urls?: string[] | null
          id?: string
          mobile: string
          notes?: string | null
          status?: string | null
          street: string
          street_number: string
          updated_at?: string
          zip_code?: string | null
        }
        Update: {
          accountant_name?: string | null
          accountant_phone?: string | null
          city?: string
          company_id?: string
          company_name?: string
          contact_name?: string
          created_at?: string
          email?: string
          file_urls?: string[] | null
          id?: string
          mobile?: string
          notes?: string | null
          status?: string | null
          street?: string
          street_number?: string
          updated_at?: string
          zip_code?: string | null
        }
        Relationships: []
      }
      projects: {
        Row: {
          created_at: string
          description: string
          description_en: string | null
          display_order: number
          id: string
          image: string
          location: string
          location_en: string | null
          project_name: string
          project_name_en: string | null
          tags: string[]
          tags_en: string[] | null
        }
        Insert: {
          created_at?: string
          description: string
          description_en?: string | null
          display_order?: number
          id?: string
          image: string
          location: string
          location_en?: string | null
          project_name: string
          project_name_en?: string | null
          tags?: string[]
          tags_en?: string[] | null
        }
        Update: {
          created_at?: string
          description?: string
          description_en?: string | null
          display_order?: number
          id?: string
          image?: string
          location?: string
          location_en?: string | null
          project_name?: string
          project_name_en?: string | null
          tags?: string[]
          tags_en?: string[] | null
        }
        Relationships: []
      }
      shipping_methods: {
        Row: {
          created_at: string
          display_order: number
          id: string
          is_active: boolean
          name: string
          name_en: string | null
          price: number
          region: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          name: string
          name_en?: string | null
          price?: number
          region: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          name?: string
          name_en?: string | null
          price?: number
          region?: string
          updated_at?: string
        }
        Relationships: []
      }
      site_content: {
        Row: {
          created_at: string
          description: string | null
          id: string
          key: string
          section: string
          updated_at: string
          value_en: string | null
          value_he: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          key: string
          section: string
          updated_at?: string
          value_en?: string | null
          value_he: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          key?: string
          section?: string
          updated_at?: string
          value_en?: string | null
          value_he?: string
        }
        Relationships: []
      }
      team: {
        Row: {
          created_at: string
          description: string
          description_en: string | null
          display_order: number | null
          id: string
          name: string
          photo: string
          role: string
          role_en: string | null
        }
        Insert: {
          created_at?: string
          description: string
          description_en?: string | null
          display_order?: number | null
          id?: string
          name: string
          photo: string
          role: string
          role_en?: string | null
        }
        Update: {
          created_at?: string
          description?: string
          description_en?: string | null
          display_order?: number | null
          id?: string
          name?: string
          photo?: string
          role?: string
          role_en?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      video_sections: {
        Row: {
          created_at: string
          id: string
          video_description: string
          video_description_en: string | null
          video_title: string
          video_title_en: string | null
          video_url: string
        }
        Insert: {
          created_at?: string
          id?: string
          video_description: string
          video_description_en?: string | null
          video_title: string
          video_title_en?: string | null
          video_url: string
        }
        Update: {
          created_at?: string
          id?: string
          video_description?: string
          video_description_en?: string | null
          video_title?: string
          video_title_en?: string | null
          video_url?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
