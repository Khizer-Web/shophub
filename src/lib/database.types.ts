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
      users: {
        Row: {
          id: string
          email: string
          name: string
          raw_user_meta_data: Json | null
          created_at: string | null
        }
        Insert: {
          id: string
          email: string
          name: string
          raw_user_meta_data?: Json | null
          created_at?: string | null
        }
        Update: {
          id?: string
          email?: string
          name?: string
          raw_user_meta_data?: Json | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "users_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      products: {
        Row: {
          id: string
          title: string
          description: string | null
          price: number
          image: string | null
          stock: number
          category: string
          created_at: string | null
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          price: number
          image?: string | null
          stock?: number
          category: string
          created_at?: string | null
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          price?: number
          image?: string | null
          stock?: number
          category?: string
          created_at?: string | null
        }
        Relationships: []
      }
      cart_items: {
        Row: {
          id: string
          user_id: string
          product_id: string
          quantity: number
        }
        Insert: {
          id?: string
          user_id: string
          product_id: string
          quantity?: number
        }
        Update: {
          id?: string
          user_id?: string
          product_id?: string
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_product_id_fkey"
            columns: ["product_id"]
            referencedRelation: "products"
            referencedColumns: ["id"]
          }
        ]
      }
      orders: {
        Row: {
          id: string
          user_id: string
          total_price: number
          status: string
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          total_price: number
          status?: string
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          total_price?: number
          status?: string
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string
          quantity: number
          price: number
        }
        Insert: {
          id?: string
          order_id: string
          product_id: string
          quantity: number
          price: number
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: string
          quantity?: number
          price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            referencedRelation: "products"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}