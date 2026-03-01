import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import Image from "next/image";
import { MessageCircle } from "lucide-react";
import type { MatchWithProfiles, OtherProfile, Message } from "@/types/database";

type MatchWithMessages = MatchWithProfiles & {
  messages: Pick<Message, "content" | "created_at" | "sender_id">[] | null;
};

export default async function MessagesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: matchesRaw } = await supabase
    .from("matches")
    .select(`
      id,
      created_at,
      user_a_id,
      user_b_id,
      profile_a:profiles!matches_user_a_id_fkey(id, full_name, profile_picture_url, gender),
      profile_b:profiles!matches_user_b_id_fkey(id, full_name, profile_picture_url, gender),
      messages(content, created_at, sender_id)
    `)
    .or(`user_a_id.eq.${user.id},user_b_id.eq.${user.id}`)
    .order("created_at", { ascending: false });

  const matches = matchesRaw as unknown as MatchWithMessages[] | null;

  return (
    <div className="pb-20 md:pl-52 md:pb-6">
      <h1 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <MessageCircle className="w-5 h-5 text-rose-500" />
        Messages
      </h1>

      {!matches || matches.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-center gap-3">
          <span className="text-5xl">💬</span>
          <p className="text-gray-500 font-medium">No conversations yet</p>
          <p className="text-sm text-gray-400">Match with someone to start chatting!</p>
        </div>
      ) : (
        <div className="space-y-2 bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          {matches.map((match) => {
            const other: OtherProfile | null =
              match.user_a_id === user.id ? match.profile_b : match.profile_a;

            if (!other) return null;

            const msgs = match.messages ?? [];
            const lastMsg =
              msgs.length > 0
                ? [...msgs].sort(
                    (a, b) =>
                      new Date(b.created_at).getTime() -
                      new Date(a.created_at).getTime()
                  )[0]
                : null;

            return (
              <Link
                key={match.id}
                href={`/messages/${match.id}`}
                className="flex items-center gap-4 px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0"
              >
                <div className="relative w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {other.profile_picture_url ? (
                    <Image
                      src={other.profile_picture_url}
                      alt={other.full_name}
                      fill
                      className="object-cover"
                      sizes="48px"
                    />
                  ) : (
                    <span className="text-2xl">
                      {other.gender === "female" ? "👩" : other.gender === "male" ? "👨" : "🧑"}
                    </span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm">{other.full_name}</p>
                  {lastMsg ? (
                    <p className="text-xs text-gray-400 truncate">
                      {lastMsg.sender_id === user.id ? "You: " : ""}
                      {lastMsg.content}
                    </p>
                  ) : (
                    <p className="text-xs text-gray-300 italic">Say hello!</p>
                  )}
                </div>

                {lastMsg && (
                  <span className="text-xs text-gray-300 flex-shrink-0">
                    {new Date(lastMsg.created_at).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
