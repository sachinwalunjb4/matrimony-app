import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import ChatWindow from "@/components/messaging/ChatWindow";
import type { MatchWithProfiles, Message } from "@/types/database";

interface PageProps {
  params: Promise<{ matchId: string }>;
}

export default async function ChatPage({ params }: PageProps) {
  const { matchId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: matchRaw } = await supabase
    .from("matches")
    .select(`
      id,
      user_a_id,
      user_b_id,
      profile_a:profiles!matches_user_a_id_fkey(id, full_name, profile_picture_url, gender),
      profile_b:profiles!matches_user_b_id_fkey(id, full_name, profile_picture_url, gender)
    `)
    .eq("id", matchId)
    .single();

  const match = matchRaw as unknown as MatchWithProfiles | null;

  if (!match || (match.user_a_id !== user.id && match.user_b_id !== user.id)) {
    notFound();
  }

  const otherProfile =
    match.user_a_id === user.id ? match.profile_b : match.profile_a;

  const { data: messagesRaw } = await supabase
    .from("messages")
    .select("*")
    .eq("match_id", matchId)
    .order("created_at", { ascending: true });

  const messages = messagesRaw as unknown as Message[] | null;

  return (
    <div className="pb-20 md:pl-52 md:pb-0 h-[calc(100vh-56px)] flex flex-col">
      <ChatWindow
        matchId={matchId}
        currentUserId={user.id}
        otherProfile={otherProfile!}
        initialMessages={messages ?? []}
      />
    </div>
  );
}
