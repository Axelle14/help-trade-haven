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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      appeal_notes: {
        Row: {
          appeal_id: string
          author_id: string
          body: string
          created_at: string
          id: string
          is_internal: boolean
        }
        Insert: {
          appeal_id: string
          author_id: string
          body: string
          created_at?: string
          id?: string
          is_internal?: boolean
        }
        Update: {
          appeal_id?: string
          author_id?: string
          body?: string
          created_at?: string
          id?: string
          is_internal?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "appeal_notes_appeal_id_fkey"
            columns: ["appeal_id"]
            isOneToOne: false
            referencedRelation: "appeals"
            referencedColumns: ["id"]
          },
        ]
      }
      appeals: {
        Row: {
          action_type: Database["public"]["Enums"]["appeal_action_type"]
          cooldown_until: string | null
          created_at: string
          decided_at: string | null
          decision: string | null
          decision_reason: string | null
          evidence: string | null
          id: string
          reason: string
          related_flag_id: string | null
          related_report_id: string | null
          reviewer_id: string | null
          status: Database["public"]["Enums"]["appeal_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          action_type: Database["public"]["Enums"]["appeal_action_type"]
          cooldown_until?: string | null
          created_at?: string
          decided_at?: string | null
          decision?: string | null
          decision_reason?: string | null
          evidence?: string | null
          id?: string
          reason: string
          related_flag_id?: string | null
          related_report_id?: string | null
          reviewer_id?: string | null
          status?: Database["public"]["Enums"]["appeal_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          action_type?: Database["public"]["Enums"]["appeal_action_type"]
          cooldown_until?: string | null
          created_at?: string
          decided_at?: string | null
          decision?: string | null
          decision_reason?: string | null
          evidence?: string | null
          id?: string
          reason?: string
          related_flag_id?: string | null
          related_report_id?: string | null
          reviewer_id?: string | null
          status?: Database["public"]["Enums"]["appeal_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      availability: {
        Row: {
          created_at: string
          day_of_week: number
          end_time: string
          id: string
          start_time: string
          timezone: string
          user_id: string
        }
        Insert: {
          created_at?: string
          day_of_week: number
          end_time: string
          id?: string
          start_time: string
          timezone?: string
          user_id: string
        }
        Update: {
          created_at?: string
          day_of_week?: number
          end_time?: string
          id?: string
          start_time?: string
          timezone?: string
          user_id?: string
        }
        Relationships: []
      }
      blocked_users: {
        Row: {
          blocked_user_id: string
          created_at: string
          id: string
          reason: string | null
          user_id: string
        }
        Insert: {
          blocked_user_id: string
          created_at?: string
          id?: string
          reason?: string | null
          user_id: string
        }
        Update: {
          blocked_user_id?: string
          created_at?: string
          id?: string
          reason?: string | null
          user_id?: string
        }
        Relationships: []
      }
      conversations: {
        Row: {
          created_at: string
          id: string
          last_message_at: string
          participant_a: string
          participant_b: string
          swap_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_message_at?: string
          participant_a: string
          participant_b: string
          swap_id: string
        }
        Update: {
          created_at?: string
          id?: string
          last_message_at?: string
          participant_a?: string
          participant_b?: string
          swap_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_swap_id_fkey"
            columns: ["swap_id"]
            isOneToOne: true
            referencedRelation: "swaps"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          read_at: string | null
          sender_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          read_at?: string | null
          sender_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          read_at?: string | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      moderation_flags: {
        Row: {
          created_at: string
          flag_type: Database["public"]["Enums"]["flag_type"]
          id: string
          notes: string | null
          severity: number
          source_report_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          flag_type: Database["public"]["Enums"]["flag_type"]
          id?: string
          notes?: string | null
          severity?: number
          source_report_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          flag_type?: Database["public"]["Enums"]["flag_type"]
          id?: string
          notes?: string | null
          severity?: number
          source_report_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "moderation_flags_source_report_id_fkey"
            columns: ["source_report_id"]
            isOneToOne: false
            referencedRelation: "reports"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string | null
          category: Database["public"]["Enums"]["notification_category"]
          created_at: string
          data: Json
          group_key: string | null
          id: string
          is_push_sent: boolean
          link: string | null
          priority: Database["public"]["Enums"]["notification_priority"]
          read_at: string | null
          title: string
          user_id: string
        }
        Insert: {
          body?: string | null
          category: Database["public"]["Enums"]["notification_category"]
          created_at?: string
          data?: Json
          group_key?: string | null
          id?: string
          is_push_sent?: boolean
          link?: string | null
          priority?: Database["public"]["Enums"]["notification_priority"]
          read_at?: string | null
          title: string
          user_id: string
        }
        Update: {
          body?: string | null
          category?: Database["public"]["Enums"]["notification_category"]
          created_at?: string
          data?: Json
          group_key?: string | null
          id?: string
          is_push_sent?: boolean
          link?: string | null
          priority?: Database["public"]["Enums"]["notification_priority"]
          read_at?: string | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          display_name: string
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name: string
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      reports: {
        Row: {
          created_at: string
          details: string | null
          id: string
          message_id: string | null
          reason: Database["public"]["Enums"]["report_reason"]
          reported_user_id: string
          reporter_id: string
          reviewer_id: string | null
          reviewer_notes: string | null
          severity: number
          status: Database["public"]["Enums"]["report_status"]
          swap_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          details?: string | null
          id?: string
          message_id?: string | null
          reason: Database["public"]["Enums"]["report_reason"]
          reported_user_id: string
          reporter_id: string
          reviewer_id?: string | null
          reviewer_notes?: string | null
          severity?: number
          status?: Database["public"]["Enums"]["report_status"]
          swap_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          details?: string | null
          id?: string
          message_id?: string | null
          reason?: Database["public"]["Enums"]["report_reason"]
          reported_user_id?: string
          reporter_id?: string
          reviewer_id?: string | null
          reviewer_notes?: string | null
          severity?: number
          status?: Database["public"]["Enums"]["report_status"]
          swap_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reports_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_swap_id_fkey"
            columns: ["swap_id"]
            isOneToOne: false
            referencedRelation: "swaps"
            referencedColumns: ["id"]
          },
        ]
      }
      swap_schedule_proposals: {
        Row: {
          created_at: string
          duration_minutes: number
          id: string
          note: string | null
          proposed_by: string
          proposed_for: string
          responded_at: string | null
          responded_by: string | null
          status: Database["public"]["Enums"]["proposal_status"]
          swap_id: string
        }
        Insert: {
          created_at?: string
          duration_minutes?: number
          id?: string
          note?: string | null
          proposed_by: string
          proposed_for: string
          responded_at?: string | null
          responded_by?: string | null
          status?: Database["public"]["Enums"]["proposal_status"]
          swap_id: string
        }
        Update: {
          created_at?: string
          duration_minutes?: number
          id?: string
          note?: string | null
          proposed_by?: string
          proposed_for?: string
          responded_at?: string | null
          responded_by?: string | null
          status?: Database["public"]["Enums"]["proposal_status"]
          swap_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "swap_schedule_proposals_swap_id_fkey"
            columns: ["swap_id"]
            isOneToOne: false
            referencedRelation: "swaps"
            referencedColumns: ["id"]
          },
        ]
      }
      swaps: {
        Row: {
          created_at: string
          duration_minutes: number
          id: string
          notes: string | null
          provider_id: string
          provider_offer_title: string
          provider_skill: string | null
          requester_id: string
          requester_offer_title: string
          requester_skill: string | null
          scheduled_at: string | null
          status: Database["public"]["Enums"]["swap_status"]
          timezone: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          duration_minutes?: number
          id?: string
          notes?: string | null
          provider_id: string
          provider_offer_title: string
          provider_skill?: string | null
          requester_id: string
          requester_offer_title: string
          requester_skill?: string | null
          scheduled_at?: string | null
          status?: Database["public"]["Enums"]["swap_status"]
          timezone?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          duration_minutes?: number
          id?: string
          notes?: string | null
          provider_id?: string
          provider_offer_title?: string
          provider_skill?: string | null
          requester_id?: string
          requester_offer_title?: string
          requester_skill?: string | null
          scheduled_at?: string | null
          status?: Database["public"]["Enums"]["swap_status"]
          timezone?: string
          updated_at?: string
        }
        Relationships: []
      }
      trust_scores: {
        Row: {
          score: number
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          score?: number
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          score?: number
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      accept_schedule_proposal: {
        Args: { _proposal_id: string }
        Returns: {
          created_at: string
          duration_minutes: number
          id: string
          note: string | null
          proposed_by: string
          proposed_for: string
          responded_at: string | null
          responded_by: string | null
          status: Database["public"]["Enums"]["proposal_status"]
          swap_id: string
        }
        SetofOptions: {
          from: "*"
          to: "swap_schedule_proposals"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      flag_category_weight: {
        Args: { _flag: Database["public"]["Enums"]["flag_type"] }
        Returns: number
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      has_schedule_conflict: {
        Args: { _duration_minutes: number; _start: string; _swap_id: string }
        Returns: boolean
      }
      is_admin_or_moderator: { Args: { _user_id: string }; Returns: boolean }
      is_blocked_between: { Args: { _a: string; _b: string }; Returns: boolean }
      is_conversation_participant: {
        Args: { _conversation_id: string; _user_id: string }
        Returns: boolean
      }
      is_swap_participant: {
        Args: { _swap_id: string; _user_id: string }
        Returns: boolean
      }
      recompute_trust_score: { Args: { _user_id: string }; Returns: undefined }
      report_category_weight: {
        Args: { _reason: Database["public"]["Enums"]["report_reason"] }
        Returns: number
      }
      reporter_credibility: { Args: { _reporter_id: string }; Returns: number }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      appeal_action_type:
        | "warning"
        | "restriction"
        | "ban"
        | "report_outcome"
        | "flag"
      appeal_status:
        | "submitted"
        | "under_review"
        | "need_more_info"
        | "approved"
        | "denied"
        | "withdrawn"
      flag_type:
        | "scam"
        | "inappropriate"
        | "no_show"
        | "harassment"
        | "spam"
        | "other"
      notification_category:
        | "message"
        | "swap_request"
        | "swap_update"
        | "match_suggestion"
        | "reward"
        | "system"
      notification_priority: "high" | "medium" | "low"
      proposal_status: "pending" | "accepted" | "declined" | "superseded"
      report_reason:
        | "scam"
        | "inappropriate"
        | "no_show"
        | "harassment"
        | "spam"
        | "other"
      report_status: "open" | "reviewing" | "actioned" | "dismissed"
      swap_status:
        | "pending"
        | "accepted"
        | "active"
        | "completed"
        | "cancelled"
        | "declined"
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
      app_role: ["admin", "moderator", "user"],
      appeal_action_type: [
        "warning",
        "restriction",
        "ban",
        "report_outcome",
        "flag",
      ],
      appeal_status: [
        "submitted",
        "under_review",
        "need_more_info",
        "approved",
        "denied",
        "withdrawn",
      ],
      flag_type: [
        "scam",
        "inappropriate",
        "no_show",
        "harassment",
        "spam",
        "other",
      ],
      notification_category: [
        "message",
        "swap_request",
        "swap_update",
        "match_suggestion",
        "reward",
        "system",
      ],
      notification_priority: ["high", "medium", "low"],
      proposal_status: ["pending", "accepted", "declined", "superseded"],
      report_reason: [
        "scam",
        "inappropriate",
        "no_show",
        "harassment",
        "spam",
        "other",
      ],
      report_status: ["open", "reviewing", "actioned", "dismissed"],
      swap_status: [
        "pending",
        "accepted",
        "active",
        "completed",
        "cancelled",
        "declined",
      ],
    },
  },
} as const
