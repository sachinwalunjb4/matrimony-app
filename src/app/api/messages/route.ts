import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type { Match, Message, Database } from "@/types/database";

type MessageInsert = Database["public"]["Tables"]["messages"]["Insert"];

// GET /api/messages?matchId=xxx — fetches messages for a match
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const matchId = searchParams.get("matchId");

  if (!matchId) {
    return NextResponse.json({ error: "matchId is required" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Verify user is a participant of this match
  const { data: matchRaw } = await supabase
    .from("matches")
    .select("user_a_id, user_b_id")
    .eq("id", matchId)
    .single();

  const match = matchRaw as unknown as Pick<Match, "user_a_id" | "user_b_id"> | null;

  if (!match || (match.user_a_id !== user.id && match.user_b_id !== user.id)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data: messagesRaw, error } = await supabase
    .from("messages")
    .select("*")
    .eq("match_id", matchId)
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(messagesRaw as unknown as Message[] | null);
}

// POST /api/messages — send a message to a match
export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { matchId, content } = body as { matchId?: string; content?: string };

  if (!matchId || !content?.trim()) {
    return NextResponse.json({ error: "matchId and content are required" }, { status: 400 });
  }

  // Verify the user is part of this match (defence-in-depth; RLS also enforces this)
  const { data: matchRaw } = await supabase
    .from("matches")
    .select("user_a_id, user_b_id")
    .eq("id", matchId)
    .single();

  const match = matchRaw as unknown as Pick<Match, "user_a_id" | "user_b_id"> | null;

  if (!match || (match.user_a_id !== user.id && match.user_b_id !== user.id)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const insertPayload: MessageInsert = {
    match_id: matchId,
    sender_id: user.id,
    content: content.trim(),
  };

  const { data: msgRaw, error } = await supabase
    .from("messages")
    .insert(insertPayload as unknown as never)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(msgRaw as unknown as Message, { status: 201 });
}
