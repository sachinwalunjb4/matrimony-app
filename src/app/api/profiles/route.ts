import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type { Profile, Database } from "@/types/database";

type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];

// GET /api/profiles — returns the current user's profile
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data as unknown as Profile);
}

// PATCH /api/profiles — update the current user's profile
export async function PATCH(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  // Whitelist updatable fields — never let the client touch id/created_at
  const allowed: (keyof ProfileUpdate)[] = [
    "full_name", "bio", "gender", "preference", "birth_date", "location", "profile_picture_url",
  ];
  const update = Object.fromEntries(
    Object.entries(body).filter(([key]) => allowed.includes(key as keyof ProfileUpdate))
  ) as ProfileUpdate;

  const { data, error } = await supabase
    .from("profiles")
    .update(update as unknown as never)
    .eq("id", user.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data as unknown as Profile);
}
