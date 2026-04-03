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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      committee_meetings: {
        Row: {
          agenda: string
          attendees: string[] | null
          created_at: string
          decisions: string | null
          id: string
          meeting_date: string
          project_id: string
        }
        Insert: {
          agenda: string
          attendees?: string[] | null
          created_at?: string
          decisions?: string | null
          id?: string
          meeting_date?: string
          project_id: string
        }
        Update: {
          agenda?: string
          attendees?: string[] | null
          created_at?: string
          decisions?: string | null
          id?: string
          meeting_date?: string
          project_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "committee_meetings_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      committee_members: {
        Row: {
          created_at: string
          email: string | null
          full_name: string
          id: string
          phone: string | null
          photo_url: string | null
          project_id: string
          role: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name: string
          id?: string
          phone?: string | null
          photo_url?: string | null
          project_id: string
          role?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          phone?: string | null
          photo_url?: string | null
          project_id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "committee_members_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      committee_tasks: {
        Row: {
          assigned_to: string | null
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          project_id: string
          status: string
          title: string
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          project_id: string
          status?: string
          title: string
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          project_id?: string
          status?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "committee_tasks_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "committee_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "committee_tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      feedback_replies: {
        Row: {
          author_name: string
          created_at: string
          feedback_id: string
          id: string
          is_admin: boolean
          message: string
        }
        Insert: {
          author_name?: string
          created_at?: string
          feedback_id: string
          id?: string
          is_admin?: boolean
          message: string
        }
        Update: {
          author_name?: string
          created_at?: string
          feedback_id?: string
          id?: string
          is_admin?: boolean
          message?: string
        }
        Relationships: [
          {
            foreignKeyName: "feedback_replies_feedback_id_fkey"
            columns: ["feedback_id"]
            isOneToOne: false
            referencedRelation: "project_feedback"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          department: string
          email: string
          full_name: string
          id: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          department?: string
          email?: string
          full_name?: string
          id: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          department?: string
          email?: string
          full_name?: string
          id?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      project_feedback: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          assigned_to: string | null
          author_name: string
          comment: string
          created_at: string
          id: string
          internal_note: string | null
          project_id: string | null
          rating: number | null
          status: string
          tracking_number: string | null
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          assigned_to?: string | null
          author_name?: string
          comment: string
          created_at?: string
          id?: string
          internal_note?: string | null
          project_id?: string | null
          rating?: number | null
          status?: string
          tracking_number?: string | null
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
          assigned_to?: string | null
          author_name?: string
          comment?: string
          created_at?: string
          id?: string
          internal_note?: string | null
          project_id?: string | null
          rating?: number | null
          status?: string
          tracking_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_feedback_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          actual_spend: number
          budget: number
          created_at: string
          description: string | null
          fy: string
          id: string
          latitude: number | null
          longitude: number | null
          name: string
          progress: number
          projected_cost: number | null
          sector: string
          status: Database["public"]["Enums"]["project_status"]
          sub_county: string
          updated_at: string
          ward: string
        }
        Insert: {
          actual_spend?: number
          budget?: number
          created_at?: string
          description?: string | null
          fy: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          name: string
          progress?: number
          projected_cost?: number | null
          sector: string
          status?: Database["public"]["Enums"]["project_status"]
          sub_county: string
          updated_at?: string
          ward: string
        }
        Update: {
          actual_spend?: number
          budget?: number
          created_at?: string
          description?: string | null
          fy?: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          name?: string
          progress?: number
          projected_cost?: number | null
          sector?: string
          status?: Database["public"]["Enums"]["project_status"]
          sub_county?: string
          updated_at?: string
          ward?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      whistleblower_reports: {
        Row: {
          additional_witnesses: boolean | null
          admin_reply: string | null
          confidentiality_preference: boolean | null
          consent_statement: boolean | null
          consent_to_contact: boolean | null
          contact_email: string | null
          county: string | null
          created_at: string
          estimated_impact: string[] | null
          evidence: string | null
          evidence_description: string | null
          full_name: string | null
          id: string
          incident_date: string | null
          incident_date_end: string | null
          incident_description: string
          issue_ongoing: boolean | null
          misconduct_other: string | null
          misconduct_type: Database["public"]["Enums"]["misconduct_type"]
          persons_involved: Json | null
          phone_number: string | null
          policy_acknowledgment: boolean | null
          preferred_contact_method:
            | Database["public"]["Enums"]["contact_method"]
            | null
          project_name: string | null
          receive_updates: boolean | null
          relationship_other: string | null
          relationship_to_org:
            | Database["public"]["Enums"]["relationship_to_org"]
            | null
          report_title: string
          report_type: Database["public"]["Enums"]["report_type"]
          specific_location: string | null
          status: string | null
          sub_county: string | null
          tracking_code: string | null
          updated_at: string
          urgency_level: Database["public"]["Enums"]["urgency_level"] | null
          ward: string | null
          witness_details: string | null
        }
        Insert: {
          additional_witnesses?: boolean | null
          admin_reply?: string | null
          confidentiality_preference?: boolean | null
          consent_statement?: boolean | null
          consent_to_contact?: boolean | null
          contact_email?: string | null
          county?: string | null
          created_at?: string
          estimated_impact?: string[] | null
          evidence?: string | null
          evidence_description?: string | null
          full_name?: string | null
          id?: string
          incident_date?: string | null
          incident_date_end?: string | null
          incident_description: string
          issue_ongoing?: boolean | null
          misconduct_other?: string | null
          misconduct_type: Database["public"]["Enums"]["misconduct_type"]
          persons_involved?: Json | null
          phone_number?: string | null
          policy_acknowledgment?: boolean | null
          preferred_contact_method?:
            | Database["public"]["Enums"]["contact_method"]
            | null
          project_name?: string | null
          receive_updates?: boolean | null
          relationship_other?: string | null
          relationship_to_org?:
            | Database["public"]["Enums"]["relationship_to_org"]
            | null
          report_title: string
          report_type?: Database["public"]["Enums"]["report_type"]
          specific_location?: string | null
          status?: string | null
          sub_county?: string | null
          tracking_code?: string | null
          updated_at?: string
          urgency_level?: Database["public"]["Enums"]["urgency_level"] | null
          ward?: string | null
          witness_details?: string | null
        }
        Update: {
          additional_witnesses?: boolean | null
          admin_reply?: string | null
          confidentiality_preference?: boolean | null
          consent_statement?: boolean | null
          consent_to_contact?: boolean | null
          contact_email?: string | null
          county?: string | null
          created_at?: string
          estimated_impact?: string[] | null
          evidence?: string | null
          evidence_description?: string | null
          full_name?: string | null
          id?: string
          incident_date?: string | null
          incident_date_end?: string | null
          incident_description?: string
          issue_ongoing?: boolean | null
          misconduct_other?: string | null
          misconduct_type?: Database["public"]["Enums"]["misconduct_type"]
          persons_involved?: Json | null
          phone_number?: string | null
          policy_acknowledgment?: boolean | null
          preferred_contact_method?:
            | Database["public"]["Enums"]["contact_method"]
            | null
          project_name?: string | null
          receive_updates?: boolean | null
          relationship_other?: string | null
          relationship_to_org?:
            | Database["public"]["Enums"]["relationship_to_org"]
            | null
          report_title?: string
          report_type?: Database["public"]["Enums"]["report_type"]
          specific_location?: string | null
          status?: string | null
          sub_county?: string | null
          tracking_code?: string | null
          updated_at?: string
          urgency_level?: Database["public"]["Enums"]["urgency_level"] | null
          ward?: string | null
          witness_details?: string | null
        }
        Relationships: []
      }
      whistleblower_reports_backup: {
        Row: {
          created_at: string | null
          description: string | null
          evidence: string | null
          id: string | null
          project_name: string | null
          sub_county: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          evidence?: string | null
          id?: string | null
          project_name?: string | null
          sub_county?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          evidence?: string | null
          id?: string | null
          project_name?: string | null
          sub_county?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_tracking_code: { Args: never; Returns: string }
      get_whistleblower_report_by_tracking: {
        Args: { p_tracking_code: string }
        Returns: {
          admin_reply: string
          created_at: string
          id: string
          misconduct_type: Database["public"]["Enums"]["misconduct_type"]
          report_title: string
          status: string
          urgency_level: Database["public"]["Enums"]["urgency_level"]
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "staff" | "executive" | "viewer"
      contact_method: "Email" | "Phone" | "None"
      impact_level: "Low" | "Medium" | "High" | "Critical"
      incident_relationship: "Directly involved" | "Witness" | "Supervisor"
      misconduct_type:
        | "Fraud"
        | "Corruption"
        | "Abuse of Office"
        | "Harassment"
        | "Financial Mismanagement"
        | "Procurement Irregularities"
        | "Data Misuse"
        | "Other"
      project_status: "Completed" | "Ongoing" | "Stalled"
      relationship_to_org:
        | "Employee"
        | "Contractor"
        | "Citizen/Public"
        | "Vendor/Partner"
        | "Other"
      report_type: "Anonymous" | "Identified"
      urgency_level: "Low" | "Medium" | "High" | "Critical"
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
      app_role: ["admin", "staff", "executive", "viewer"],
      contact_method: ["Email", "Phone", "None"],
      impact_level: ["Low", "Medium", "High", "Critical"],
      incident_relationship: ["Directly involved", "Witness", "Supervisor"],
      misconduct_type: [
        "Fraud",
        "Corruption",
        "Abuse of Office",
        "Harassment",
        "Financial Mismanagement",
        "Procurement Irregularities",
        "Data Misuse",
        "Other",
      ],
      project_status: ["Completed", "Ongoing", "Stalled"],
      relationship_to_org: [
        "Employee",
        "Contractor",
        "Citizen/Public",
        "Vendor/Partner",
        "Other",
      ],
      report_type: ["Anonymous", "Identified"],
      urgency_level: ["Low", "Medium", "High", "Critical"],
    },
  },
} as const
