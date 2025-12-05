export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      friends: {
        Row: {
          created_at: string;
          friend_code: string;
          id: string;
          owner_id: string;
        };
        Insert: {
          created_at?: string;
          friend_code: string;
          id?: string;
          owner_id: string;
        };
        Update: {
          created_at?: string;
          friend_code?: string;
          id?: string;
          owner_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'friends_owner_id_fkey';
            columns: ['owner_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      matches: {
        Row: {
          code: string | null;
          created_at: string;
          difficulty: string;
          finished_at: string | null;
          guest_id: string | null;
          host_id: string | null;
          id: string;
          question_ids: string[];
          question_limit: number;
          questions: Json;
          started_at: string | null;
          state: Json;
          status: string;
          updated_at: string;
        };
        Insert: {
          code?: string | null;
          created_at?: string;
          difficulty?: string;
          finished_at?: string | null;
          guest_id?: string | null;
          host_id?: string | null;
          id?: string;
          question_ids?: string[];
          question_limit?: number;
          questions?: Json;
          started_at?: string | null;
          state?: Json;
          status?: string;
          updated_at?: string;
        };
        Update: {
          code?: string | null;
          created_at?: string;
          difficulty?: string;
          finished_at?: string | null;
          guest_id?: string | null;
          host_id?: string | null;
          id?: string;
          question_ids?: string[];
          question_limit?: number;
          questions?: Json;
          started_at?: string | null;
          state?: Json;
          status?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'matches_guest_id_fkey';
            columns: ['guest_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'matches_host_id_fkey';
            columns: ['host_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      questions: {
        Row: {
          category: string;
          correct_answer: string;
          created_at: string;
          difficulty: string;
          id: string;
          options: Json;
          question: string;
          slug: string | null;
          updated_at: string;
        };
        Insert: {
          category: string;
          correct_answer: string;
          created_at?: string;
          difficulty?: string;
          id?: string;
          options?: Json;
          question: string;
          slug?: string | null;
          updated_at?: string;
        };
        Update: {
          category?: string;
          correct_answer?: string;
          created_at?: string;
          difficulty?: string;
          id?: string;
          options?: Json;
          question?: string;
          slug?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      scores: {
        Row: {
          created_at: string;
          difficulty: string;
          duration_seconds: number | null;
          id: string;
          points: number;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          difficulty?: string;
          duration_seconds?: number | null;
          id?: string;
          points?: number;
          user_id: string;
        };
        Update: {
          created_at?: string;
          difficulty?: string;
          duration_seconds?: number | null;
          id?: string;
          points?: number;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'scores_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      users: {
        Row: {
          created_at: string;
          email: string;
          id: string;
          premium: boolean;
          updated_at: string;
          username: string;
        };
        Insert: {
          created_at?: string;
          email: string;
          id?: string;
          premium?: boolean;
          updated_at?: string;
          username: string;
        };
        Update: {
          created_at?: string;
          email?: string;
          id?: string;
          premium?: boolean;
          updated_at?: string;
          username?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'users_id_fkey';
            columns: ['id'];
            isOneToOne: true;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
    CompositeTypes: {};
  };
};

export type Tables<
  PublicTableNameOrOptions extends
    | keyof Database['public']['Tables']
    | { schema: keyof Database } = keyof Database['public']['Tables'],
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof Database['public']['Tables']
    ? Database['public']['Tables'][PublicTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof Database['public']['Tables']
    | { schema: keyof Database } = keyof Database['public']['Tables'],
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof Database['public']['Tables']
    ? Database['public']['Tables'][PublicTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof Database['public']['Tables']
    | { schema: keyof Database } = keyof Database['public']['Tables'],
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof Database['public']['Tables']
    ? Database['public']['Tables'][PublicTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof Database['public']['Enums']
    | { schema: keyof Database } = keyof Database['public']['Enums'],
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions['schema']]['Enums'][EnumName]
  : PublicEnumNameOrOptions extends keyof Database['public']['Enums']
    ? Database['public']['Enums'][PublicEnumNameOrOptions]
    : never;
