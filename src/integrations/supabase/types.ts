export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      clients: {
        Row: {
          age_group: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          occupation: string | null
          phone: string | null
          pipeline_stage: Database["public"]["Enums"]["deal_stage"]
          updated_at: string
          user_id: string
        }
        Insert: {
          age_group?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          occupation?: string | null
          phone?: string | null
          pipeline_stage?: Database["public"]["Enums"]["deal_stage"]
          updated_at?: string
          user_id: string
        }
        Update: {
          age_group?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          occupation?: string | null
          phone?: string | null
          pipeline_stage?: Database["public"]["Enums"]["deal_stage"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      deals: {
        Row: {
          client_id: string
          created_at: string
          expected_close_date: string | null
          id: string
          notes: string | null
          probability: number | null
          stage: string
          title: string
          updated_at: string
          user_id: string
          value: number | null
        }
        Insert: {
          client_id: string
          created_at?: string
          expected_close_date?: string | null
          id?: string
          notes?: string | null
          probability?: number | null
          stage: string
          title: string
          updated_at?: string
          user_id: string
          value?: number | null
        }
        Update: {
          client_id?: string
          created_at?: string
          expected_close_date?: string | null
          id?: string
          notes?: string | null
          probability?: number | null
          stage?: string
          title?: string
          updated_at?: string
          user_id?: string
          value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "deals_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      global_policies: {
        Row: {
          commission_rate: number | null
          created_at: string
          end_date: string | null
          id: string
          payment_structure_type: string
          policy_duration: number | null
          policy_name: string
          policy_type: string
          premium: number | null
          provider: string | null
          start_date: string | null
          status: string | null
          updated_at: string
          user_id: string
          value: number | null
        }
        Insert: {
          commission_rate?: number | null
          created_at?: string
          end_date?: string | null
          id?: string
          payment_structure_type: string
          policy_duration?: number | null
          policy_name: string
          policy_type: string
          premium?: number | null
          provider?: string | null
          start_date?: string | null
          status?: string | null
          updated_at?: string
          user_id: string
          value?: number | null
        }
        Update: {
          commission_rate?: number | null
          created_at?: string
          end_date?: string | null
          id?: string
          payment_structure_type?: string
          policy_duration?: number | null
          policy_name?: string
          policy_type?: string
          premium?: number | null
          provider?: string | null
          start_date?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string
          value?: number | null
        }
        Relationships: []
      }
      policies: {
        Row: {
          annual_ongoing_commission: number | null
          client_id: string
          commission_rate: number | null
          created_at: string
          end_date: string | null
          first_year_commission: number | null
          global_policy_id: string | null
          id: string
          payment_structure_type: string
          policy_duration: number | null
          policy_name: string
          policy_number: string | null
          policy_type: string
          premium: number | null
          provider: string | null
          start_date: string | null
          status: string | null
          updated_at: string
          user_id: string
          value: number | null
        }
        Insert: {
          annual_ongoing_commission?: number | null
          client_id: string
          commission_rate?: number | null
          created_at?: string
          end_date?: string | null
          first_year_commission?: number | null
          global_policy_id?: string | null
          id?: string
          payment_structure_type: string
          policy_duration?: number | null
          policy_name: string
          policy_number?: string | null
          policy_type: string
          premium?: number | null
          provider?: string | null
          start_date?: string | null
          status?: string | null
          updated_at?: string
          user_id: string
          value?: number | null
        }
        Update: {
          annual_ongoing_commission?: number | null
          client_id?: string
          commission_rate?: number | null
          created_at?: string
          end_date?: string | null
          first_year_commission?: number | null
          global_policy_id?: string | null
          id?: string
          payment_structure_type?: string
          policy_duration?: number | null
          policy_name?: string
          policy_number?: string | null
          policy_type?: string
          premium?: number | null
          provider?: string | null
          start_date?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string
          value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_global_policy"
            columns: ["global_policy_id"]
            isOneToOne: false
            referencedRelation: "global_policies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "policies_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string
          id: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name: string
          id: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string
          id?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          client_id: string | null
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          priority: string | null
          status: string | null
          task_type: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          client_id?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string | null
          status?: string | null
          task_type?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          client_id?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string | null
          status?: string | null
          task_type?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
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
      deal_stage:
        | "Lead"
        | "Contacted"
        | "Proposal Sent"
        | "Negotiation"
        | "Closed Won"
        | "Closed Lost"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      deal_stage: [
        "Lead",
        "Contacted",
        "Proposal Sent",
        "Negotiation",
        "Closed Won",
        "Closed Lost",
      ],
    },
  },
} as const
