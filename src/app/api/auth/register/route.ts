import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import type { Database, Gender, Preference } from "@/types/database";

type ProfileInsert = Database["public"]["Tables"]["profiles"]["Insert"];

// Service-role client — bypasses RLS, server-only, never sent to the browser
function createAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export async function POST(request: Request) {
  const body = await request.json();
  const { email, password, full_name, gender, preference, birth_date, location, bio } =
    body as {
      email: string;
      password: string;
      full_name: string;
      gender: Gender;
      preference: Preference;
      birth_date: string;
      location: string;
      bio?: string;
    };

  // Basic validation
  if (!email || !password || !full_name || !gender || !preference || !birth_date || !location) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const admin = createAdminClient();

  // 1. Create the auth user
  const { data: authData, error: authError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // auto-confirm so the user can log in immediately
  });

  if (authError || !authData.user) {
    return NextResponse.json(
      { error: authError?.message ?? "Failed to create user" },
      { status: 400 }
    );
  }

  // 2. Insert the profile — payload is typed via ProfileInsert for safety,
  //    then cast to unknown to bypass the Supabase client's broken inference.
  const profilePayload: ProfileInsert = {
    id: authData.user.id,
    full_name,
    gender,
    preference,
    birth_date,
    location,
    bio: bio || null,
    profile_picture_url: null,
  };

  const { error: profileError } = await admin
    .from("profiles")
    .insert(profilePayload as unknown as never);

  if (profileError) {
    // Roll back: delete the auth user so we don't leave orphaned accounts
    await admin.auth.admin.deleteUser(authData.user.id);
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  return NextResponse.json({ userId: authData.user.id }, { status: 201 });
}
