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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      agent_action_executions: {
        Row: {
          action_type: string
          agent_id: string
          completed_at: string | null
          created_at: string
          error: string | null
          id: string
          parameters: Json | null
          result: Json | null
          status: string
          user_id: string
        }
        Insert: {
          action_type: string
          agent_id: string
          completed_at?: string | null
          created_at?: string
          error?: string | null
          id?: string
          parameters?: Json | null
          result?: Json | null
          status?: string
          user_id: string
        }
        Update: {
          action_type?: string
          agent_id?: string
          completed_at?: string | null
          created_at?: string
          error?: string | null
          id?: string
          parameters?: Json | null
          result?: Json | null
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      agent_analytics: {
        Row: {
          agent_id: string
          created_at: string
          event_type: string
          id: string
          metadata: Json | null
          session_id: string | null
          user_id: string
        }
        Insert: {
          agent_id: string
          created_at?: string
          event_type: string
          id?: string
          metadata?: Json | null
          session_id?: string | null
          user_id: string
        }
        Update: {
          agent_id?: string
          created_at?: string
          event_type?: string
          id?: string
          metadata?: Json | null
          session_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      agent_deployments: {
        Row: {
          agent_id: string
          api_key_encrypted: string
          config: Json
          created_at: string
          deployment_type: string
          id: string
          last_used_at: string | null
          status: string
          updated_at: string
          usage_count: number | null
          user_id: string
        }
        Insert: {
          agent_id: string
          api_key_encrypted: string
          config?: Json
          created_at?: string
          deployment_type: string
          id?: string
          last_used_at?: string | null
          status?: string
          updated_at?: string
          usage_count?: number | null
          user_id: string
        }
        Update: {
          agent_id?: string
          api_key_encrypted?: string
          config?: Json
          created_at?: string
          deployment_type?: string
          id?: string
          last_used_at?: string | null
          status?: string
          updated_at?: string
          usage_count?: number | null
          user_id?: string
        }
        Relationships: []
      }
      agent_integrations: {
        Row: {
          agent_id: string
          api_key_encrypted: string
          config: Json
          created_at: string
          id: string
          integration_type: string
          is_active: boolean | null
          last_used_at: string | null
          updated_at: string
          usage_count: number | null
          user_id: string
          webhook_url: string | null
        }
        Insert: {
          agent_id: string
          api_key_encrypted: string
          config?: Json
          created_at?: string
          id?: string
          integration_type: string
          is_active?: boolean | null
          last_used_at?: string | null
          updated_at?: string
          usage_count?: number | null
          user_id: string
          webhook_url?: string | null
        }
        Update: {
          agent_id?: string
          api_key_encrypted?: string
          config?: Json
          created_at?: string
          id?: string
          integration_type?: string
          is_active?: boolean | null
          last_used_at?: string | null
          updated_at?: string
          usage_count?: number | null
          user_id?: string
          webhook_url?: string | null
        }
        Relationships: []
      }
      agent_reviews: {
        Row: {
          agent_id: string
          created_at: string
          helpful_count: number | null
          id: string
          is_verified: boolean | null
          rating: number
          review_text: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          agent_id: string
          created_at?: string
          helpful_count?: number | null
          id?: string
          is_verified?: boolean | null
          rating: number
          review_text?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          agent_id?: string
          created_at?: string
          helpful_count?: number | null
          id?: string
          is_verified?: boolean | null
          rating?: number
          review_text?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      agents: {
        Row: {
          ai_provider_id: string | null
          avatar_url: string | null
          category: string | null
          created_at: string
          description: string | null
          id: string
          is_featured: boolean | null
          is_public: boolean | null
          name: string
          rating: number | null
          system_prompt: string | null
          tags: string[] | null
          template_id: string | null
          updated_at: string
          user_count: number | null
          user_id: string
        }
        Insert: {
          ai_provider_id?: string | null
          avatar_url?: string | null
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_featured?: boolean | null
          is_public?: boolean | null
          name: string
          rating?: number | null
          system_prompt?: string | null
          tags?: string[] | null
          template_id?: string | null
          updated_at?: string
          user_count?: number | null
          user_id: string
        }
        Update: {
          ai_provider_id?: string | null
          avatar_url?: string | null
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_featured?: boolean | null
          is_public?: boolean | null
          name?: string
          rating?: number | null
          system_prompt?: string | null
          tags?: string[] | null
          template_id?: string | null
          updated_at?: string
          user_count?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "agents_ai_provider_id_fkey"
            columns: ["ai_provider_id"]
            isOneToOne: false
            referencedRelation: "user_ai_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      api_key_access_logs: {
        Row: {
          access_type: string
          accessed_at: string
          id: string
          ip_address: unknown | null
          provider_id: string
          success: boolean
          user_agent: string | null
          user_id: string
        }
        Insert: {
          access_type: string
          accessed_at?: string
          id?: string
          ip_address?: unknown | null
          provider_id: string
          success?: boolean
          user_agent?: string | null
          user_id: string
        }
        Update: {
          access_type?: string
          accessed_at?: string
          id?: string
          ip_address?: unknown | null
          provider_id?: string
          success?: boolean
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      conversations: {
        Row: {
          agent_id: string
          created_at: string
          id: string
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          agent_id: string
          created_at?: string
          id?: string
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          agent_id?: string
          created_at?: string
          id?: string
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      detailed_analytics: {
        Row: {
          agent_id: string
          conversation_turns: number | null
          created_at: string
          event_type: string
          id: string
          integration_type: string | null
          metadata: Json | null
          revenue_generated: number | null
          satisfaction_score: number | null
          session_duration: number | null
          user_id: string
        }
        Insert: {
          agent_id: string
          conversation_turns?: number | null
          created_at?: string
          event_type: string
          id?: string
          integration_type?: string | null
          metadata?: Json | null
          revenue_generated?: number | null
          satisfaction_score?: number | null
          session_duration?: number | null
          user_id: string
        }
        Update: {
          agent_id?: string
          conversation_turns?: number | null
          created_at?: string
          event_type?: string
          id?: string
          integration_type?: string | null
          metadata?: Json | null
          revenue_generated?: number | null
          satisfaction_score?: number | null
          session_duration?: number | null
          user_id?: string
        }
        Relationships: []
      }
      integration_logs: {
        Row: {
          action: string
          created_at: string
          id: string
          integration_type: string
          metadata: Json | null
          success: boolean
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          integration_type: string
          metadata?: Json | null
          success?: boolean
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          integration_type?: string
          metadata?: Json | null
          success?: boolean
          user_id?: string
        }
        Relationships: []
      }
      invites: {
        Row: {
          created_at: string | null
          created_by: string | null
          email: string
          expires_at: string | null
          id: string
          invite_code: string
          updated_at: string | null
          used_at: string | null
          used_by: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          email: string
          expires_at?: string | null
          id?: string
          invite_code: string
          updated_at?: string | null
          used_at?: string | null
          used_by?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          email?: string
          expires_at?: string | null
          id?: string
          invite_code?: string
          updated_at?: string | null
          used_at?: string | null
          used_by?: string | null
        }
        Relationships: []
      }
      knowledge_bases: {
        Row: {
          agent_id: string
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          agent_id: string
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          agent_id?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      knowledge_chunks: {
        Row: {
          chunk_index: number
          content: string
          created_at: string
          id: string
          knowledge_base_id: string
          knowledge_file_id: string
          metadata: Json | null
          user_id: string
        }
        Insert: {
          chunk_index: number
          content: string
          created_at?: string
          id?: string
          knowledge_base_id: string
          knowledge_file_id: string
          metadata?: Json | null
          user_id: string
        }
        Update: {
          chunk_index?: number
          content?: string
          created_at?: string
          id?: string
          knowledge_base_id?: string
          knowledge_file_id?: string
          metadata?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_chunks_knowledge_base_id_fkey"
            columns: ["knowledge_base_id"]
            isOneToOne: false
            referencedRelation: "knowledge_bases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "knowledge_chunks_knowledge_file_id_fkey"
            columns: ["knowledge_file_id"]
            isOneToOne: false
            referencedRelation: "knowledge_files"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_files: {
        Row: {
          created_at: string
          file_name: string
          file_path: string
          file_size: number
          id: string
          knowledge_base_id: string
          mime_type: string
          processed_content: string | null
          processing_status: string
          source_type: string
          source_url: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          file_name: string
          file_path: string
          file_size: number
          id?: string
          knowledge_base_id: string
          mime_type: string
          processed_content?: string | null
          processing_status?: string
          source_type?: string
          source_url?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          file_name?: string
          file_path?: string
          file_size?: number
          id?: string
          knowledge_base_id?: string
          mime_type?: string
          processed_content?: string | null
          processing_status?: string
          source_type?: string
          source_url?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_files_knowledge_base_id_fkey"
            columns: ["knowledge_base_id"]
            isOneToOne: false
            referencedRelation: "knowledge_bases"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_agents_secure: {
        Row: {
          avatar_url: string | null
          category: string | null
          created_at: string | null
          description: string | null
          id: string
          is_featured: boolean | null
          name: string
          rating: number | null
          source_agent_id: string | null
          tags: string[] | null
          updated_at: string | null
          user_count: number | null
        }
        Insert: {
          avatar_url?: string | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          id: string
          is_featured?: boolean | null
          name: string
          rating?: number | null
          source_agent_id?: string | null
          tags?: string[] | null
          updated_at?: string | null
          user_count?: number | null
        }
        Update: {
          avatar_url?: string | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_featured?: boolean | null
          name?: string
          rating?: number | null
          source_agent_id?: string | null
          tags?: string[] | null
          updated_at?: string | null
          user_count?: number | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          role: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          role: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          role?: string
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
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      secure_api_keys: {
        Row: {
          created_at: string
          encrypted_key: string
          expires_at: string | null
          id: string
          key_hash: string
          last_rotation_at: string | null
          provider_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          encrypted_key: string
          expires_at?: string | null
          id?: string
          key_hash: string
          last_rotation_at?: string | null
          provider_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          encrypted_key?: string
          expires_at?: string | null
          id?: string
          key_hash?: string
          last_rotation_at?: string | null
          provider_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "secure_api_keys_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "user_ai_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      user_ai_providers: {
        Row: {
          access_count: number | null
          api_key_encrypted: string
          created_at: string
          created_from_ip: unknown | null
          display_name: string | null
          id: string
          is_active: boolean
          is_default: boolean
          last_accessed_at: string | null
          model_name: string
          provider_name: string
          rotation_due_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          access_count?: number | null
          api_key_encrypted: string
          created_at?: string
          created_from_ip?: unknown | null
          display_name?: string | null
          id?: string
          is_active?: boolean
          is_default?: boolean
          last_accessed_at?: string | null
          model_name: string
          provider_name: string
          rotation_due_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          access_count?: number | null
          api_key_encrypted?: string
          created_at?: string
          created_from_ip?: unknown | null
          display_name?: string | null
          id?: string
          is_active?: boolean
          is_default?: boolean
          last_accessed_at?: string | null
          model_name?: string
          provider_name?: string
          rotation_due_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      webhook_deliveries: {
        Row: {
          delivered_at: string
          error: string | null
          event: string
          id: string
          is_retry: boolean
          original_delivery_id: string | null
          payload: Json
          response_body: string | null
          status_code: number | null
          success: boolean
          webhook_id: string
        }
        Insert: {
          delivered_at?: string
          error?: string | null
          event: string
          id?: string
          is_retry?: boolean
          original_delivery_id?: string | null
          payload: Json
          response_body?: string | null
          status_code?: number | null
          success?: boolean
          webhook_id: string
        }
        Update: {
          delivered_at?: string
          error?: string | null
          event?: string
          id?: string
          is_retry?: boolean
          original_delivery_id?: string | null
          payload?: Json
          response_body?: string | null
          status_code?: number | null
          success?: boolean
          webhook_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "webhook_deliveries_original_delivery_id_fkey"
            columns: ["original_delivery_id"]
            isOneToOne: false
            referencedRelation: "webhook_deliveries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "webhook_deliveries_webhook_id_fkey"
            columns: ["webhook_id"]
            isOneToOne: false
            referencedRelation: "webhooks"
            referencedColumns: ["id"]
          },
        ]
      }
      webhooks: {
        Row: {
          agent_id: string
          created_at: string
          events: string[]
          headers: Json | null
          id: string
          is_active: boolean
          secret: string | null
          updated_at: string
          url: string
          user_id: string
        }
        Insert: {
          agent_id: string
          created_at?: string
          events: string[]
          headers?: Json | null
          id?: string
          is_active?: boolean
          secret?: string | null
          updated_at?: string
          url: string
          user_id: string
        }
        Update: {
          agent_id?: string
          created_at?: string
          events?: string[]
          headers?: Json | null
          id?: string
          is_active?: boolean
          secret?: string | null
          updated_at?: string
          url?: string
          user_id?: string
        }
        Relationships: []
      }
      workflow_executions: {
        Row: {
          completed_at: string | null
          context: Json
          created_at: string
          current_step: string | null
          id: string
          status: string
          user_id: string
          workflow_id: string
        }
        Insert: {
          completed_at?: string | null
          context?: Json
          created_at?: string
          current_step?: string | null
          id?: string
          status?: string
          user_id: string
          workflow_id: string
        }
        Update: {
          completed_at?: string | null
          context?: Json
          created_at?: string
          current_step?: string | null
          id?: string
          status?: string
          user_id?: string
          workflow_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_executions_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      workflows: {
        Row: {
          agent_id: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          steps: Json
          triggers: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          agent_id: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          steps?: Json
          triggers?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          agent_id?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          steps?: Json
          triggers?: Json
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
      access_encrypted_key_secure: {
        Args: { provider_uuid: string; purpose?: string }
        Returns: string
      }
      audit_vault_usage: {
        Args: Record<PropertyKey, never>
        Returns: {
          priority: string
          recommendation: string
          security_concern: string
        }[]
      }
      create_deployment_secure: {
        Args: {
          p_agent_id: string
          p_api_key?: string
          p_config?: Json
          p_deployment_type: string
        }
        Returns: string
      }
      create_deployment_secure_v2: {
        Args: { p_agent_id: string; p_config?: Json; p_deployment_type: string }
        Returns: string
      }
      create_invite_secure: {
        Args: { p_email: string }
        Returns: string
      }
      create_invite_with_email_secure: {
        Args: { p_email: string }
        Returns: Json
      }
      create_webhook_secure: {
        Args: {
          p_agent_id: string
          p_events: string[]
          p_headers?: Json
          p_secret?: string
          p_url: string
        }
        Returns: string
      }
      decrypt_api_key: {
        Args: { encrypted_key: string; user_id: string }
        Returns: string
      }
      decrypt_api_key_enhanced: {
        Args: { encrypted_key: string; provider_id: string; user_id: string }
        Returns: string
      }
      decrypt_api_key_secure: {
        Args: { encrypted_key: string; provider_id: string; user_id: string }
        Returns: string
      }
      encrypt_api_key: {
        Args: { api_key: string; user_id: string }
        Returns: string
      }
      encrypt_api_key_enhanced: {
        Args: { api_key: string; user_id: string }
        Returns: string
      }
      encrypt_api_key_secure: {
        Args: { api_key: string; user_id: string }
        Returns: string
      }
      encrypt_deployment_key: {
        Args: { api_key: string; deployment_id: string }
        Returns: string
      }
      encrypt_integration_key: {
        Args: { api_key: string; integration_id: string }
        Returns: string
      }
      generate_invite_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_secure_api_key: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_agent_safe: {
        Args: { agent_uuid: string }
        Returns: {
          avatar_url: string
          category: string
          created_at: string
          description: string
          id: string
          is_featured: boolean
          is_owner: boolean
          name: string
          rating: number
          system_prompt: string
          tags: string[]
          user_count: number
        }[]
      }
      get_ai_provider_key_secure: {
        Args: { provider_uuid: string }
        Returns: string
      }
      get_api_key_for_provider: {
        Args: { provider_uuid: string; requesting_user_id: string }
        Returns: string
      }
      get_deployment_key_safe: {
        Args: { deployment_id: string }
        Returns: string
      }
      get_deployment_key_secure: {
        Args: { deployment_uuid: string }
        Returns: string
      }
      get_deployment_safe_info: {
        Args: { deployment_uuid: string }
        Returns: {
          agent_id: string
          config: Json
          created_at: string
          deployment_type: string
          id: string
          last_used_at: string
          status: string
          updated_at: string
          usage_count: number
        }[]
      }
      get_integration_key_safe: {
        Args: { integration_id: string }
        Returns: string
      }
      get_integration_key_secure: {
        Args: { integration_uuid: string }
        Returns: string
      }
      get_marketplace_authenticated: {
        Args: Record<PropertyKey, never>
        Returns: {
          avatar_url: string
          category: string
          created_at: string
          description: string
          id: string
          is_featured: boolean
          name: string
          rating: number
          tags: string[]
          user_count: number
        }[]
      }
      get_marketplace_preview: {
        Args: Record<PropertyKey, never>
        Returns: {
          avatar_url: string
          category: string
          created_month: string
          description: string
          id: string
          is_featured: boolean
          name: string
          rating: number
          tags: string[]
          user_count_range: string
        }[]
      }
      get_marketplace_safe: {
        Args: Record<PropertyKey, never>
        Returns: {
          avatar_url: string
          category: string
          created_at: string
          description: string
          id: string
          is_featured: boolean
          name: string
          rating: number
          tags: string[]
          user_count: number
        }[]
      }
      get_masked_access_logs: {
        Args: { user_uuid: string }
        Returns: {
          access_type: string
          accessed_at: string
          id: string
          masked_ip: string
          provider_name: string
          success: boolean
        }[]
      }
      get_public_agent_info: {
        Args: { agent_uuid: string }
        Returns: {
          agent_type: string
          avatar_url: string
          category: string
          created_at: string
          description: string
          id: string
          is_featured: boolean
          name: string
          rating: number
          tags: string[]
          user_count: number
        }[]
      }
      get_safe_ai_providers: {
        Args: Record<PropertyKey, never>
        Returns: {
          access_count: number
          created_at: string
          display_name: string
          id: string
          is_active: boolean
          is_default: boolean
          last_accessed_at: string
          model_name: string
          provider_name: string
          updated_at: string
          user_id: string
        }[]
      }
      get_safe_deployments: {
        Args: Record<PropertyKey, never>
        Returns: {
          agent_id: string
          config: Json
          created_at: string
          deployment_type: string
          id: string
          last_used_at: string
          status: string
          updated_at: string
          usage_count: number
          user_id: string
        }[]
      }
      get_safe_webhooks: {
        Args: Record<PropertyKey, never>
        Returns: {
          agent_id: string
          created_at: string
          events: string[]
          headers: Json
          id: string
          is_active: boolean
          updated_at: string
          url: string
          user_id: string
        }[]
      }
      get_secret_safe: {
        Args: { secret_name: string }
        Returns: string
      }
      get_secrets_metadata_secure: {
        Args: Record<PropertyKey, never>
        Returns: {
          access_status: string
          created_at: string
          description: string
          id: string
          name: string
          updated_at: string
        }[]
      }
      get_user_ai_providers_safe: {
        Args: Record<PropertyKey, never>
        Returns: {
          access_count: number
          created_at: string
          display_name: string
          id: string
          is_active: boolean
          is_default: boolean
          last_accessed_at: string
          model_name: string
          provider_name: string
          updated_at: string
          user_id: string
        }[]
      }
      get_user_deployments_safe: {
        Args: Record<PropertyKey, never>
        Returns: {
          agent_id: string
          config: Json
          created_at: string
          deployment_type: string
          id: string
          last_used_at: string
          status: string
          updated_at: string
          usage_count: number
          user_id: string
        }[]
      }
      get_user_integrations_safe: {
        Args: Record<PropertyKey, never>
        Returns: {
          agent_id: string
          config: Json
          created_at: string
          id: string
          integration_type: string
          is_active: boolean
          last_used_at: string
          updated_at: string
          usage_count: number
          user_id: string
          webhook_url: string
        }[]
      }
      get_user_invites_safe: {
        Args: Record<PropertyKey, never>
        Returns: {
          created_at: string
          expires_at: string
          id: string
          invite_code: string
          status: string
          used_at: string
        }[]
      }
      get_user_invites_secure: {
        Args: Record<PropertyKey, never>
        Returns: {
          created_at: string
          expires_at: string
          id: string
          invite_code: string
          status: string
          used_at: string
        }[]
      }
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      get_user_webhooks_safe: {
        Args: Record<PropertyKey, never>
        Returns: {
          agent_id: string
          created_at: string
          events: string[]
          headers: Json
          id: string
          is_active: boolean
          updated_at: string
          url: string
          user_id: string
        }[]
      }
      get_webhook_safe_info: {
        Args: { webhook_uuid: string }
        Returns: {
          agent_id: string
          created_at: string
          events: string[]
          headers: Json
          id: string
          is_active: boolean
          updated_at: string
          url: string
        }[]
      }
      get_webhook_secret_secure: {
        Args: { webhook_uuid: string }
        Returns: string
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      log_api_key_access: {
        Args: {
          p_access_type: string
          p_ip_address?: unknown
          p_provider_id: string
          p_success?: boolean
          p_user_agent?: string
          p_user_id: string
        }
        Returns: undefined
      }
      log_security_event_enhanced: {
        Args: {
          p_event_type: string
          p_ip_address?: unknown
          p_metadata?: Json
          p_resource_id?: string
          p_user_agent?: string
          p_user_id: string
        }
        Returns: undefined
      }
      monitor_vault_security: {
        Args: Record<PropertyKey, never>
        Returns: {
          access_time: string
          access_type: string
          secret_name: string
          success: boolean
          user_id: string
        }[]
      }
      regenerate_deployment_key: {
        Args: { deployment_id: string }
        Returns: string
      }
      regenerate_webhook_secret: {
        Args: { webhook_id: string }
        Returns: string
      }
      sync_marketplace_agents: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      update_deployment_safe: {
        Args: {
          deployment_id: string
          new_config?: Json
          new_deployment_type?: string
          new_status?: string
        }
        Returns: boolean
      }
      update_webhook_safe: {
        Args: {
          new_events?: string[]
          new_headers?: Json
          new_is_active?: boolean
          new_url?: string
          webhook_id: string
        }
        Returns: boolean
      }
      use_invite: {
        Args: { p_email: string; p_user_id: string }
        Returns: undefined
      }
      validate_ai_provider_access: {
        Args: { provider_id: string }
        Returns: boolean
      }
      validate_invite: {
        Args: { p_email: string; p_invite_code?: string }
        Returns: boolean
      }
      validate_invite_code_secure: {
        Args: { p_invite_code: string }
        Returns: boolean
      }
      validate_sensitive_access: {
        Args: { access_type?: string; record_id: string; table_name: string }
        Returns: boolean
      }
      validate_vault_security: {
        Args: Record<PropertyKey, never>
        Returns: {
          check_name: string
          details: string
          status: string
        }[]
      }
    }
    Enums: {
      app_role: "god" | "gods_friends" | "user"
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
      app_role: ["god", "gods_friends", "user"],
    },
  },
} as const
