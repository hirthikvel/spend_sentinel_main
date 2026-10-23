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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      analysis_runs: {
        Row: {
          anomalies_found: number
          error_code: string | null
          finished_at: string | null
          id: string
          idle_found: number
          org_id: string
          progress: number
          stage: string
          started_at: string
          status: string
          step_index: number
          triggered_by: string | null
        }
        Insert: {
          anomalies_found?: number
          error_code?: string | null
          finished_at?: string | null
          id?: string
          idle_found?: number
          org_id: string
          progress?: number
          stage?: string
          started_at?: string
          status?: string
          step_index?: number
          triggered_by?: string | null
        }
        Update: {
          anomalies_found?: number
          error_code?: string | null
          finished_at?: string | null
          id?: string
          idle_found?: number
          org_id?: string
          progress?: number
          stage?: string
          started_at?: string
          status?: string
          step_index?: number
          triggered_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "analysis_runs_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      anomalies: {
        Row: {
          anomaly_date: string
          consecutive_days: number
          created_at: string
          delta_cost: number
          expected_cost: number
          id: string
          observed_cost: number
          org_id: string
          region: string
          robust_score: number
          run_id: string | null
          service: string
          severity: string
          status: string
          updated_at: string
        }
        Insert: {
          anomaly_date: string
          consecutive_days?: number
          created_at?: string
          delta_cost: number
          expected_cost: number
          id?: string
          observed_cost: number
          org_id: string
          region: string
          robust_score: number
          run_id?: string | null
          service: string
          severity: string
          status?: string
          updated_at?: string
        }
        Update: {
          anomaly_date?: string
          consecutive_days?: number
          created_at?: string
          delta_cost?: number
          expected_cost?: number
          id?: string
          observed_cost?: number
          org_id?: string
          region?: string
          robust_score?: number
          run_id?: string | null
          service?: string
          severity?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "anomalies_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "anomalies_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "analysis_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      anomaly_attributions: {
        Row: {
          anomaly_id: string
          baseline_cost: number
          contribution_pct: number | null
          delta_cost: number
          dimension: string
          dimension_value: string
          id: number
          observed_cost: number
          org_id: string
          rnk: number
        }
        Insert: {
          anomaly_id: string
          baseline_cost: number
          contribution_pct?: number | null
          delta_cost: number
          dimension: string
          dimension_value: string
          id?: never
          observed_cost: number
          org_id: string
          rnk: number
        }
        Update: {
          anomaly_id?: string
          baseline_cost?: number
          contribution_pct?: number | null
          delta_cost?: number
          dimension?: string
          dimension_value?: string
          id?: never
          observed_cost?: number
          org_id?: string
          rnk?: number
        }
        Relationships: [
          {
            foreignKeyName: "anomaly_attributions_anomaly_id_fkey"
            columns: ["anomaly_id"]
            isOneToOne: false
            referencedRelation: "anomalies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "anomaly_attributions_anomaly_id_fkey"
            columns: ["anomaly_id"]
            isOneToOne: false
            referencedRelation: "anomaly_feed"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "anomaly_attributions_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_log: {
        Row: {
          action: string
          actor: string | null
          created_at: string
          entity: string | null
          entity_id: string | null
          id: number
          meta: Json
          org_id: string | null
        }
        Insert: {
          action: string
          actor?: string | null
          created_at?: string
          entity?: string | null
          entity_id?: string | null
          id?: never
          meta?: Json
          org_id?: string | null
        }
        Update: {
          action?: string
          actor?: string | null
          created_at?: string
          entity?: string | null
          entity_id?: string | null
          id?: never
          meta?: Json
          org_id?: string | null
        }
        Relationships: []
      }
      billing_line_items: {
        Row: {
          account_id: string | null
          cost: number
          created_at: string
          currency: string
          environment: string | null
          id: number
          is_demo: boolean
          org_id: string
          provider: string
          region: string
          resource_id: string | null
          service: string
          tags: Json
          upload_id: string | null
          usage_date: string
          usage_quantity: number | null
          usage_type: string | null
        }
        Insert: {
          account_id?: string | null
          cost: number
          created_at?: string
          currency?: string
          environment?: string | null
          id?: never
          is_demo?: boolean
          org_id: string
          provider?: string
          region?: string
          resource_id?: string | null
          service: string
          tags?: Json
          upload_id?: string | null
          usage_date: string
          usage_quantity?: number | null
          usage_type?: string | null
        }
        Update: {
          account_id?: string | null
          cost?: number
          created_at?: string
          currency?: string
          environment?: string | null
          id?: never
          is_demo?: boolean
          org_id?: string
          provider?: string
          region?: string
          resource_id?: string | null
          service?: string
          tags?: Json
          upload_id?: string | null
          usage_date?: string
          usage_quantity?: number | null
          usage_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "billing_line_items_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "billing_line_items_upload_id_fkey"
            columns: ["upload_id"]
            isOneToOne: false
            referencedRelation: "billing_uploads"
            referencedColumns: ["id"]
          },
        ]
      }
      billing_uploads: {
        Row: {
          completed_at: string | null
          created_at: string
          error_code: string | null
          id: string
          kind: string
          org_id: string
          original_name: string | null
          row_count: number
          size_bytes: number | null
          source_format: string
          status: string
          storage_path: string | null
          uploaded_by: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          error_code?: string | null
          id?: string
          kind?: string
          org_id: string
          original_name?: string | null
          row_count?: number
          size_bytes?: number | null
          source_format?: string
          status?: string
          storage_path?: string | null
          uploaded_by?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          error_code?: string | null
          id?: string
          kind?: string
          org_id?: string
          original_name?: string | null
          row_count?: number
          size_bytes?: number | null
          source_format?: string
          status?: string
          storage_path?: string | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "billing_uploads_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      detectors: {
        Row: {
          description: string | null
          enabled: boolean
          function_name: string
          id: number
          kind: string
          name: string
          params: Json
          priority: number
        }
        Insert: {
          description?: string | null
          enabled?: boolean
          function_name: string
          id?: never
          kind: string
          name: string
          params?: Json
          priority?: number
        }
        Update: {
          description?: string | null
          enabled?: boolean
          function_name?: string
          id?: never
          kind?: string
          name?: string
          params?: Json
          priority?: number
        }
        Relationships: []
      }
      evidence_ledger: {
        Row: {
          created_at: string
          finding_id: string
          finding_type: string
          id: number
          kind: string
          label: string
          org_id: string
          ref: string
          source: Json
          unit: string | null
          value_numeric: number | null
          value_text: string | null
        }
        Insert: {
          created_at?: string
          finding_id: string
          finding_type: string
          id?: never
          kind: string
          label: string
          org_id: string
          ref: string
          source?: Json
          unit?: string | null
          value_numeric?: number | null
          value_text?: string | null
        }
        Update: {
          created_at?: string
          finding_id?: string
          finding_type?: string
          id?: never
          kind?: string
          label?: string
          org_id?: string
          ref?: string
          source?: Json
          unit?: string | null
          value_numeric?: number | null
          value_text?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "evidence_ledger_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      idle_resources: {
        Row: {
          action: string
          avg_cpu_pct: number | null
          basis: string
          confidence: number
          created_at: string
          environment: string | null
          estimated_monthly_saving: number
          id: string
          instance_size: string | null
          monthly_cost: number
          org_id: string
          reason: string | null
          region: string | null
          resource_id: string
          run_id: string | null
          service: string | null
          status: string
          updated_at: string
        }
        Insert: {
          action: string
          avg_cpu_pct?: number | null
          basis: string
          confidence: number
          created_at?: string
          environment?: string | null
          estimated_monthly_saving: number
          id?: string
          instance_size?: string | null
          monthly_cost: number
          org_id: string
          reason?: string | null
          region?: string | null
          resource_id: string
          run_id?: string | null
          service?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          action?: string
          avg_cpu_pct?: number | null
          basis?: string
          confidence?: number
          created_at?: string
          environment?: string | null
          estimated_monthly_saving?: number
          id?: string
          instance_size?: string | null
          monthly_cost?: number
          org_id?: string
          reason?: string | null
          region?: string | null
          resource_id?: string
          run_id?: string | null
          service?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "idle_resources_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "idle_resources_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "analysis_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      narratives: {
        Row: {
          created_at: string
          finding_id: string
          finding_type: string
          id: string
          model: string | null
          org_id: string
          rejected_count: number
          sentences: Json
          source: string
          validated: boolean
        }
        Insert: {
          created_at?: string
          finding_id: string
          finding_type: string
          id?: string
          model?: string | null
          org_id: string
          rejected_count?: number
          sentences?: Json
          source: string
          validated?: boolean
        }
        Update: {
          created_at?: string
          finding_id?: string
          finding_type?: string
          id?: string
          model?: string | null
          org_id?: string
          rejected_count?: number
          sentences?: Json
          source?: string
          validated?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "narratives_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      org_members: {
        Row: {
          created_at: string
          org_id: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          org_id: string
          role: string
          user_id: string
        }
        Update: {
          created_at?: string
          org_id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "org_members_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string
          created_by: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      rate_limits: {
        Row: {
          hits: number
          key: string
          window_start: string
        }
        Insert: {
          hits?: number
          key: string
          window_start: string
        }
        Update: {
          hits?: number
          key?: string
          window_start?: string
        }
        Relationships: []
      }
      resource_utilization: {
        Row: {
          avg_cpu_pct: number | null
          id: number
          instance_size: string | null
          is_demo: boolean
          max_cpu_pct: number | null
          org_id: string
          period_end: string
          period_start: string | null
          region: string | null
          resource_id: string
          resource_type: string | null
          service: string | null
          upload_id: string | null
        }
        Insert: {
          avg_cpu_pct?: number | null
          id?: never
          instance_size?: string | null
          is_demo?: boolean
          max_cpu_pct?: number | null
          org_id: string
          period_end: string
          period_start?: string | null
          region?: string | null
          resource_id: string
          resource_type?: string | null
          service?: string | null
          upload_id?: string | null
        }
        Update: {
          avg_cpu_pct?: number | null
          id?: never
          instance_size?: string | null
          is_demo?: boolean
          max_cpu_pct?: number | null
          org_id?: string
          period_end?: string
          period_start?: string | null
          region?: string | null
          resource_id?: string
          resource_type?: string | null
          service?: string | null
          upload_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "resource_utilization_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resource_utilization_upload_id_fkey"
            columns: ["upload_id"]
            isOneToOne: false
            referencedRelation: "billing_uploads"
            referencedColumns: ["id"]
          },
        ]
      }
      verdicts: {
        Row: {
          anomaly_id: string
          confidence: number
          created_at: string
          id: string
          label: string
          org_id: string
          reasons: Json
          scores: Json
        }
        Insert: {
          anomaly_id: string
          confidence: number
          created_at?: string
          id?: string
          label: string
          org_id: string
          reasons?: Json
          scores?: Json
        }
        Update: {
          anomaly_id?: string
          confidence?: number
          created_at?: string
          id?: string
          label?: string
          org_id?: string
          reasons?: Json
          scores?: Json
        }
        Relationships: [
          {
            foreignKeyName: "verdicts_anomaly_id_fkey"
            columns: ["anomaly_id"]
            isOneToOne: true
            referencedRelation: "anomalies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "verdicts_anomaly_id_fkey"
            columns: ["anomaly_id"]
            isOneToOne: true
            referencedRelation: "anomaly_feed"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "verdicts_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      anomaly_feed: {
        Row: {
          anomaly_date: string | null
          consecutive_days: number | null
          created_at: string | null
          delta_cost: number | null
          expected_cost: number | null
          id: string | null
          observed_cost: number | null
          org_id: string | null
          region: string | null
          robust_score: number | null
          run_id: string | null
          service: string | null
          severity: string | null
          status: string | null
          updated_at: string | null
          verdict_confidence: number | null
          verdict_label: string | null
        }
        Relationships: [
          {
            foreignKeyName: "anomalies_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "anomalies_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "analysis_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_spend_by_region: {
        Row: {
          cost: number | null
          org_id: string | null
          region: string | null
          usage_date: string | null
        }
        Relationships: [
          {
            foreignKeyName: "billing_line_items_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_spend_by_service: {
        Row: {
          cost: number | null
          org_id: string | null
          service: string | null
          usage_date: string | null
        }
        Relationships: [
          {
            foreignKeyName: "billing_line_items_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_spend_total: {
        Row: {
          cost: number | null
          org_id: string | null
          usage_date: string | null
        }
        Relationships: [
          {
            foreignKeyName: "billing_line_items_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      savings_summary: {
        Row: {
          monthly_saving: number | null
          org_id: string | null
          resources: number | null
        }
        Relationships: [
          {
            foreignKeyName: "idle_resources_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      add_evidence: {
        Args: {
          p_id: string
          p_kind: string
          p_label: string
          p_num: number
          p_org: string
          p_source?: Json
          p_text: string
          p_type: string
          p_unit: string
        }
        Returns: string
      }
      build_template_narrative: {
        Args: { p_id: string; p_type: string }
        Returns: Json
      }
      can_ingest: {
        Args: { p_incoming: number; p_org: string }
        Returns: boolean
      }
      check_rate_limit: {
        Args: { p_key: string; p_limit: number; p_window_seconds: number }
        Returns: boolean
      }
      create_organization: { Args: { p_name: string }; Returns: string }
      decompose_finding: {
        Args: { p_org: string; p_params: Json; p_run: string }
        Returns: number
      }
      demo_reset: { Args: { p_org: string }; Returns: number }
      detect_cost_anomalies: {
        Args: { p_org: string; p_params: Json; p_run: string }
        Returns: number
      }
      ev_ref: {
        Args: { p_id: string; p_kind: string; p_type: string }
        Returns: string
      }
      has_org_role: {
        Args: { p_org: string; p_roles: string[] }
        Returns: boolean
      }
      is_org_member: { Args: { p_org: string }; Returns: boolean }
      org_from_path: { Args: { p_name: string }; Returns: string }
      reason: { Args: { p_ref: string; p_text: string }; Returns: Json }
      run_analysis: { Args: { p_org: string }; Returns: string }
      run_analysis_step: { Args: { p_run: string }; Returns: string }
      seed_demo_data: { Args: { p_org: string }; Returns: number }
      start_analysis: { Args: { p_org: string }; Returns: string }
    }
    Enums: {
      [_ in never]: never
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
