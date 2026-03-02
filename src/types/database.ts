// ──────────────────────────────────────────────────────────────
// Database types — kept in sync with supabase/migrations/001_initial_schema.sql
// ──────────────────────────────────────────────────────────────

export type Gender = "male" | "female" | "other";
export type Preference = "male" | "female" | "any";
export type InterestAction = "like" | "pass";

// ── Plain DB row types (only real columns — no join fields) ───

export interface Profile {
  id: string;
  full_name: string;
  bio: string | null;
  gender: Gender;
  preference: Preference;
  birth_date: string; // ISO date string
  location: string;
  address: string | null;
  profile_picture_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Interest {
  id: string;
  from_user_id: string;
  to_user_id: string;
  action: InterestAction;
  created_at: string;
}

// Match — only real DB columns. Join results use MatchWithProfiles below.
export interface Match {
  id: string;
  user_a_id: string;
  user_b_id: string;
  created_at: string;
}

export interface Message {
  id: string;
  match_id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

// ── Joined query result types (not DB rows — used only in component props) ──

export type OtherProfile = Pick<
  Profile,
  "id" | "full_name" | "profile_picture_url" | "gender" | "location"
>;

export interface MatchWithProfiles extends Match {
  profile_a: OtherProfile | null;
  profile_b: OtherProfile | null;
}

// ──────────────────────────────────────────────────────────────
// Supabase Database type (used with createClient<Database>)
// All five keys on the schema object are required by @supabase/supabase-js v2
// to satisfy GenericSchema — omitting any causes Insert/Update to collapse to `never`.
// Row types must contain ONLY real database columns.
// ──────────────────────────────────────────────────────────────
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: {
          id: string;
          full_name: string;
          gender: Gender;
          preference: Preference;
          birth_date: string;
          location: string;
          bio?: string | null;
          address?: string | null;
          profile_picture_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          full_name?: string;
          bio?: string | null;
          gender?: Gender;
          preference?: Preference;
          birth_date?: string;
          location?: string;
          address?: string | null;
          profile_picture_url?: string | null;
        };
      };
      interests: {
        Row: Interest;
        Insert: {
          from_user_id: string;
          to_user_id: string;
          action: InterestAction;
          id?: string;
          created_at?: string;
        };
        Update: {
          action?: InterestAction;
        };
      };
      matches: {
        Row: Match;
        Insert: {
          user_a_id: string;
          user_b_id: string;
          id?: string;
          created_at?: string;
        };
        Update: Record<string, never>;
      };
      messages: {
        Row: Message;
        Insert: {
          match_id: string;
          sender_id: string;
          content: string;
          id?: string;
          created_at?: string;
        };
        Update: Record<string, never>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
