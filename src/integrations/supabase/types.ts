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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      anonymous_post_replies: {
        Row: {
          content: string
          created_at: string
          emoji: string | null
          id: string
          is_flagged: boolean
          moderation_reason: string | null
          post_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          emoji?: string | null
          id?: string
          is_flagged?: boolean
          moderation_reason?: string | null
          post_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          emoji?: string | null
          id?: string
          is_flagged?: boolean
          moderation_reason?: string | null
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "anonymous_post_replies_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "anonymous_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      anonymous_post_supports: {
        Row: {
          created_at: string | null
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "anonymous_post_supports_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "anonymous_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      anonymous_posts: {
        Row: {
          category: string
          content: string
          created_at: string | null
          emoji: string | null
          id: string
          is_flagged: boolean
          moderation_reason: string | null
          support_count: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          category?: string
          content: string
          created_at?: string | null
          emoji?: string | null
          id?: string
          is_flagged?: boolean
          moderation_reason?: string | null
          support_count?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          category?: string
          content?: string
          created_at?: string | null
          emoji?: string | null
          id?: string
          is_flagged?: boolean
          moderation_reason?: string | null
          support_count?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      communities: {
        Row: {
          category: string
          created_at: string
          description: string | null
          emoji: string | null
          id: string
          is_approved: boolean
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          emoji?: string | null
          id?: string
          is_approved?: boolean
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          emoji?: string | null
          id?: string
          is_approved?: boolean
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      community_chat_messages: {
        Row: {
          community_id: string
          content: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          community_id: string
          content: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          community_id?: string
          content?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_chat_messages_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string
          id: string
          participant_one: string
          participant_two: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          participant_one: string
          participant_two: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          participant_one?: string
          participant_two?: string
          updated_at?: string
        }
        Relationships: []
      }
      courses: {
        Row: {
          category: string
          created_at: string
          description: string | null
          duration: string
          icon: string | null
          id: string
          provider: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          duration: string
          icon?: string | null
          id?: string
          provider: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          duration?: string
          icon?: string | null
          id?: string
          provider?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          capacity: number
          created_at: string
          description: string | null
          emoji: string | null
          end_time: string | null
          event_date: string
          id: string
          is_approved: boolean
          location: string
          organizer: string
          start_time: string | null
          title: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          capacity?: number
          created_at?: string
          description?: string | null
          emoji?: string | null
          end_time?: string | null
          event_date: string
          id?: string
          is_approved?: boolean
          location: string
          organizer: string
          start_time?: string | null
          title: string
          type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          capacity?: number
          created_at?: string
          description?: string | null
          emoji?: string | null
          end_time?: string | null
          event_date?: string
          id?: string
          is_approved?: boolean
          location?: string
          organizer?: string
          start_time?: string | null
          title?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      jobs: {
        Row: {
          category: string
          company: string
          created_at: string
          description: string | null
          id: string
          is_approved: boolean
          location: string
          title: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string
          company: string
          created_at?: string
          description?: string | null
          id?: string
          is_approved?: boolean
          location: string
          title: string
          type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          company?: string
          created_at?: string
          description?: string | null
          id?: string
          is_approved?: boolean
          location?: string
          title?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      map_locations: {
        Row: {
          address: string
          category: string
          created_at: string
          description: string | null
          id: string
          latitude: number
          longitude: number
          name: string
          phone: string | null
          updated_at: string
          user_id: string
          website: string | null
        }
        Insert: {
          address: string
          category: string
          created_at?: string
          description?: string | null
          id?: string
          latitude: number
          longitude: number
          name: string
          phone?: string | null
          updated_at?: string
          user_id: string
          website?: string | null
        }
        Update: {
          address?: string
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          latitude?: number
          longitude?: number
          name?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
          website?: string | null
        }
        Relationships: []
      }
      marketplace_products: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_verified: boolean
          name: string
          price: number
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_verified?: boolean
          name: string
          price?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_verified?: boolean
          name?: string
          price?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      mentors: {
        Row: {
          availability: string | null
          bio: string | null
          category: string
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          experience_years: number | null
          expertise: string
          id: string
          is_verified: boolean
          location: string | null
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          availability?: string | null
          bio?: string | null
          category?: string
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          experience_years?: number | null
          expertise: string
          id?: string
          is_verified?: boolean
          location?: string | null
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          availability?: string | null
          bio?: string | null
          category?: string
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          experience_years?: number | null
          expertise?: string
          id?: string
          is_verified?: boolean
          location?: string | null
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          is_read: boolean
          sender_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          is_read?: boolean
          sender_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          is_read?: boolean
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
      mood_entries: {
        Row: {
          created_at: string
          id: string
          mood: string
          note: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          mood: string
          note?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          mood?: string
          note?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          allow_messages: boolean
          avatar_url: string | null
          created_at: string
          education: string | null
          hide_location: boolean
          hide_personal_story: boolean
          id: string
          is_public: boolean
          is_verified: boolean
          location: string | null
          name: string | null
          onboarding_completed: boolean
          personal_story: string | null
          preferred_pronouns: string | null
          skills: string[] | null
          updated_at: string
          user_id: string
          work_interests: string[] | null
        }
        Insert: {
          allow_messages?: boolean
          avatar_url?: string | null
          created_at?: string
          education?: string | null
          hide_location?: boolean
          hide_personal_story?: boolean
          id?: string
          is_public?: boolean
          is_verified?: boolean
          location?: string | null
          name?: string | null
          onboarding_completed?: boolean
          personal_story?: string | null
          preferred_pronouns?: string | null
          skills?: string[] | null
          updated_at?: string
          user_id: string
          work_interests?: string[] | null
        }
        Update: {
          allow_messages?: boolean
          avatar_url?: string | null
          created_at?: string
          education?: string | null
          hide_location?: boolean
          hide_personal_story?: boolean
          id?: string
          is_public?: boolean
          is_verified?: boolean
          location?: string | null
          name?: string | null
          onboarding_completed?: boolean
          personal_story?: string | null
          preferred_pronouns?: string | null
          skills?: string[] | null
          updated_at?: string
          user_id?: string
          work_interests?: string[] | null
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
      app_role: "admin" | "moderator" | "user"
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
    },
  },
} as const
