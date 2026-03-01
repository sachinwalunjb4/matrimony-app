// ──────────────────────────────────────────────────────────────
// Database types — kept in sync with supabase/migrations/001_initial_schema.sql
// ──────────────────────────────────────────────────────────────

export type Gender = "male" | "female" | "other";
export type Preference = "male" | "female" | "any";
export type InterestAction = "like" | "pass";

export interface Profile {
  id: string;
  full_name: string;
  bio: string | null;
  gender: Gender;
  preference: Preference;
  birth_date: string; // ISO date string
  location: string;
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

export interface Match {
  id: string;
  user_a_id: string;
  user_b_id: string;
  created_at: string;
  // Joined field — populated in queries
  other_profile?: Profile;
}

export interface Message {
  id: string;
  match_id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

// ──────────────────────────────────────────────────────────────
// Supabase Database type (used with createClient<Database>)
// ──────────────────────────────────────────────────────────────
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, "created_at" | "updated_at">;
        Update: Partial<Omit<Profile, "id" | "created_at" | "updated_at">>;
      };
      interests: {
        Row: Interest;
        Insert: Omit<Interest, "id" | "created_at">;
        Update: Partial<Pick<Interest, "action">>;
      };
      matches: {
        Row: Match;
        Insert: Omit<Match, "id" | "created_at">;
        Update: never;
      };
      messages: {
        Row: Message;
        Insert: Omit<Message, "id" | "created_at">;
        Update: never;
      };
    };
  };
};
