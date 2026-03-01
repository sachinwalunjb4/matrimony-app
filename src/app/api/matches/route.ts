import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// GET /api/matches — returns all matches for the current user
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("matches")
    .select(`
      id,
      created_at,
      user_a_id,
      user_b_id,
      profile_a:profiles!matches_user_a_id_fkey(id, full_name, profile_picture_url, location, gender),
      profile_b:profiles!matches_user_b_id_fkey(id, full_name, profile_picture_url, location, gender)
    `)
    .or(`user_a_id.eq.${user.id},user_b_id.eq.${user.id}`)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
