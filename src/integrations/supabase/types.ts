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
      cities: {
        Row: {
          country: string
          created_at: string
          id: string
          is_active: boolean
          latitude: number | null
          longitude: number | null
          member_count: number
          name: string
          province: string
          slug: string
        }
        Insert: {
          country?: string
          created_at?: string
          id?: string
          is_active?: boolean
          latitude?: number | null
          longitude?: number | null
          member_count?: number
          name: string
          province: string
          slug: string
        }
        Update: {
          country?: string
          created_at?: string
          id?: string
          is_active?: boolean
          latitude?: number | null
          longitude?: number | null
          member_count?: number
          name?: string
          province?: string
          slug?: string
        }
        Relationships: []
      }
      city_memberships: {
        Row: {
          city_id: string
          id: string
          joined_at: string
          role: Database["public"]["Enums"]["city_role"]
          user_id: string
        }
        Insert: {
          city_id: string
          id?: string
          joined_at?: string
          role?: Database["public"]["Enums"]["city_role"]
          user_id: string
        }
        Update: {
          city_id?: string
          id?: string
          joined_at?: string
          role?: Database["public"]["Enums"]["city_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "city_memberships_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
        ]
      }
      city_message_reactions: {
        Row: {
          created_at: string
          emoji: string
          id: string
          message_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          emoji: string
          id?: string
          message_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          emoji?: string
          id?: string
          message_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "city_message_reactions_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "city_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      city_messages: {
        Row: {
          city_id: string
          created_at: string
          hidden_by: string | null
          hidden_reason: string | null
          id: string
          message: string
          sender_id: string
          status: Database["public"]["Enums"]["city_message_status"]
        }
        Insert: {
          city_id: string
          created_at?: string
          hidden_by?: string | null
          hidden_reason?: string | null
          id?: string
          message: string
          sender_id: string
          status?: Database["public"]["Enums"]["city_message_status"]
        }
        Update: {
          city_id?: string
          created_at?: string
          hidden_by?: string | null
          hidden_reason?: string | null
          id?: string
          message?: string
          sender_id?: string
          status?: Database["public"]["Enums"]["city_message_status"]
        }
        Relationships: [
          {
            foreignKeyName: "city_messages_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
        ]
      }
      city_stats: {
        Row: {
          active_members: number
          city_id: string
          swaps_completed: number
          trending_skills: string[]
          updated_at: string
        }
        Insert: {
          active_members?: number
          city_id: string
          swaps_completed?: number
          trending_skills?: string[]
          updated_at?: string
        }
        Update: {
          active_members?: number
          city_id?: string
          swaps_completed?: number
          trending_skills?: string[]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "city_stats_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: true
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
        ]
      }
      city_waitlist: {
        Row: {
          city_id: string
          created_at: string
          email: string
          id: string
          name: string
          phone: string | null
          referral_code: string
          referred_by_code: string | null
          skill_needed: string
          skill_offered: string
          status: string
          user_id: string | null
        }
        Insert: {
          city_id: string
          created_at?: string
          email: string
          id?: string
          name: string
          phone?: string | null
          referral_code?: string
          referred_by_code?: string | null
          skill_needed: string
          skill_offered: string
          status?: string
          user_id?: string | null
        }
        Update: {
          city_id?: string
          created_at?: string
          email?: string
          id?: string
          name?: string
          phone?: string | null
          referral_code?: string
          referred_by_code?: string | null
          skill_needed?: string
          skill_offered?: string
          status?: string
          user_id?: string | null
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
      point_transactions: {
        Row: {
          amount: number
          created_at: string
          id: string
          note: string | null
          reference_order_id: string | null
          type: Database["public"]["Enums"]["point_tx_type"]
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          note?: string | null
          reference_order_id?: string | null
          type: Database["public"]["Enums"]["point_tx_type"]
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          note?: string | null
          reference_order_id?: string | null
          type?: Database["public"]["Enums"]["point_tx_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "point_transactions_reference_order_id_fkey"
            columns: ["reference_order_id"]
            isOneToOne: false
            referencedRelation: "swaps"
            referencedColumns: ["id"]
          },
        ]
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
      reviews: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          rating: number
          reviewee_id: string
          reviewer_id: string
          swap_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          rating: number
          reviewee_id: string
          reviewer_id: string
          swap_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          rating?: number
          reviewee_id?: string
          reviewer_id?: string
          swap_id?: string
        }
        Relationships: []
      }
      services: {
        Row: {
          category: string
          city_id: string | null
          created_at: string
          delivery_type: Database["public"]["Enums"]["delivery_type"]
          description: string | null
          estimated_duration_minutes: number
          id: string
          is_active: boolean
          point_price: number
          service_radius_km: number
          tags: string[]
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category: string
          city_id?: string | null
          created_at?: string
          delivery_type?: Database["public"]["Enums"]["delivery_type"]
          description?: string | null
          estimated_duration_minutes?: number
          id?: string
          is_active?: boolean
          point_price?: number
          service_radius_km?: number
          tags?: string[]
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          city_id?: string | null
          created_at?: string
          delivery_type?: Database["public"]["Enums"]["delivery_type"]
          description?: string | null
          estimated_duration_minutes?: number
          id?: string
          is_active?: boolean
          point_price?: number
          service_radius_km?: number
          tags?: string[]
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
          buyer_id: string | null
          created_at: string
          duration_minutes: number
          id: string
          is_point_order: boolean
          notes: string | null
          points_spent: number
          provider_id: string
          provider_offer_title: string
          provider_skill: string | null
          requester_id: string
          requester_offer_title: string
          requester_skill: string | null
          scheduled_at: string | null
          seller_id: string | null
          service_id: string | null
          status: Database["public"]["Enums"]["swap_status"]
          timezone: string
          updated_at: string
        }
        Insert: {
          buyer_id?: string | null
          created_at?: string
          duration_minutes?: number
          id?: string
          is_point_order?: boolean
          notes?: string | null
          points_spent?: number
          provider_id: string
          provider_offer_title: string
          provider_skill?: string | null
          requester_id: string
          requester_offer_title: string
          requester_skill?: string | null
          scheduled_at?: string | null
          seller_id?: string | null
          service_id?: string | null
          status?: Database["public"]["Enums"]["swap_status"]
          timezone?: string
          updated_at?: string
        }
        Update: {
          buyer_id?: string | null
          created_at?: string
          duration_minutes?: number
          id?: string
          is_point_order?: boolean
          notes?: string | null
          points_spent?: number
          provider_id?: string
          provider_offer_title?: string
          provider_skill?: string | null
          requester_id?: string
          requester_offer_title?: string
          requester_skill?: string | null
          scheduled_at?: string | null
          seller_id?: string | null
          service_id?: string | null
          status?: Database["public"]["Enums"]["swap_status"]
          timezone?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "swaps_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
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
      wallets: {
        Row: {
          balance_points: number
          created_at: string
          lifetime_earned: number
          lifetime_spent: number
          updated_at: string
          user_id: string
        }
        Insert: {
          balance_points?: number
          created_at?: string
          lifetime_earned?: number
          lifetime_spent?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          balance_points?: number
          created_at?: string
          lifetime_earned?: number
          lifetime_spent?: number
          updated_at?: string
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
      browse_services: {
        Args: { _limit?: number; _user_city_id?: string }
        Returns: {
          avatar_url: string
          category: string
          city_id: string
          city_name: string
          created_at: string
          delivery_type: Database["public"]["Enums"]["delivery_type"]
          description: string
          display_name: string
          distance_km: number
          id: string
          point_price: number
          province: string
          rank_bucket: number
          service_radius_km: number
          title: string
          trust_score: number
          user_id: string
        }[]
      }
      cancel_point_order: {
        Args: { _order_id: string; _reason?: string }
        Returns: {
          buyer_id: string | null
          created_at: string
          duration_minutes: number
          id: string
          is_point_order: boolean
          notes: string | null
          points_spent: number
          provider_id: string
          provider_offer_title: string
          provider_skill: string | null
          requester_id: string
          requester_offer_title: string
          requester_skill: string | null
          scheduled_at: string | null
          seller_id: string | null
          service_id: string | null
          status: Database["public"]["Enums"]["swap_status"]
          timezone: string
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "swaps"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      city_marketplace_overview: { Args: { _city_id: string }; Returns: Json }
      city_waitlist_count: { Args: { _city_id: string }; Returns: number }
      complete_point_order: {
        Args: { _order_id: string }
        Returns: {
          buyer_id: string | null
          created_at: string
          duration_minutes: number
          id: string
          is_point_order: boolean
          notes: string | null
          points_spent: number
          provider_id: string
          provider_offer_title: string
          provider_skill: string | null
          requester_id: string
          requester_offer_title: string
          requester_skill: string | null
          scheduled_at: string | null
          seller_id: string | null
          service_id: string | null
          status: Database["public"]["Enums"]["swap_status"]
          timezone: string
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "swaps"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      ensure_wallet: {
        Args: { _user_id: string }
        Returns: {
          balance_points: number
          created_at: string
          lifetime_earned: number
          lifetime_spent: number
          updated_at: string
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "wallets"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      flag_category_weight: {
        Args: { _flag: Database["public"]["Enums"]["flag_type"] }
        Returns: number
      }
      grant_signup_bonus: {
        Args: { _amount?: number; _user_id: string }
        Returns: undefined
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
      is_city_member: {
        Args: { _city_id: string; _user_id: string }
        Returns: boolean
      }
      is_city_moderator: {
        Args: { _city_id: string; _user_id: string }
        Returns: boolean
      }
      is_conversation_participant: {
        Args: { _conversation_id: string; _user_id: string }
        Returns: boolean
      }
      is_swap_participant: {
        Args: { _swap_id: string; _user_id: string }
        Returns: boolean
      }
      moderation_overview: {
        Args: never
        Returns: {
          actioned_last_7d: number
          avg_resolution_hours: number
          banned_users: number
          dismissed_last_7d: number
          flagged_users_7d: number
          open_reports: number
          restricted_users: number
          reviewing_reports: number
        }[]
      }
      place_point_order: {
        Args: { _note?: string; _service_id: string }
        Returns: {
          buyer_id: string | null
          created_at: string
          duration_minutes: number
          id: string
          is_point_order: boolean
          notes: string | null
          points_spent: number
          provider_id: string
          provider_offer_title: string
          provider_skill: string | null
          requester_id: string
          requester_offer_title: string
          requester_skill: string | null
          scheduled_at: string | null
          seller_id: string | null
          service_id: string | null
          status: Database["public"]["Enums"]["swap_status"]
          timezone: string
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "swaps"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      recompute_trust_score: { Args: { _user_id: string }; Returns: undefined }
      referral_progress: { Args: { _code: string }; Returns: number }
      repeat_offenders: {
        Args: { _limit?: number }
        Returns: {
          avatar_url: string
          display_name: string
          flag_count: number
          report_count: number
          total: number
          trust_score: number
          trust_status: string
          user_id: string
        }[]
      }
      report_category_weight: {
        Args: { _reason: Database["public"]["Enums"]["report_reason"] }
        Returns: number
      }
      reporter_credibility: { Args: { _reporter_id: string }; Returns: number }
      suggest_point_price: {
        Args: {
          _category: string
          _duration_minutes?: number
          _seller_id?: string
        }
        Returns: {
          max_price: number
          min_price: number
          suggested: number
        }[]
      }
      trust_distribution: {
        Args: never
        Returns: {
          bucket: string
          count: number
        }[]
      }
      user_review_summary: {
        Args: { _user_id: string }
        Returns: {
          avg_rating: number
          review_count: number
        }[]
      }
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
      city_message_status: "active" | "hidden" | "deleted"
      city_role: "member" | "moderator" | "ambassador"
      delivery_type: "online" | "in_person" | "both"
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
      point_tx_type:
        | "earn"
        | "spend"
        | "refund"
        | "bonus"
        | "penalty"
        | "signup_bonus"
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
      city_message_status: ["active", "hidden", "deleted"],
      city_role: ["member", "moderator", "ambassador"],
      delivery_type: ["online", "in_person", "both"],
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
      point_tx_type: [
        "earn",
        "spend",
        "refund",
        "bonus",
        "penalty",
        "signup_bonus",
      ],
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
