import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import Image from "next/image";
import { Heart, MessageCircle, MapPin } from "lucide-react";
import type { MatchWithProfiles, OtherProfile } from "@/types/database";

export default async function MatchesPage() {
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
      profile_a:profiles!matches_user_a_id_fkey(id, full_name, profile_picture_url, location, gender),
      profile_b:profiles!matches_user_b_id_fkey(id, full_name, profile_picture_url, location, gender)
    `)
    .or(`user_a_id.eq.${user.id},user_b_id.eq.${user.id}`)
    .order("created_at", { ascending: false });

  const matches = matchesRaw as unknown as MatchWithProfiles[] | null;

  return (
    <div className="pb-20 md:pl-52 md:pb-6">
      <h1 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
        Your Matches
      </h1>

      {!matches || matches.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-center gap-3">
          <span className="text-5xl">💝</span>
          <p className="text-gray-500 font-medium">No matches yet</p>
          <p className="text-sm text-gray-400">Start browsing profiles to make connections!</p>
          <Link
            href="/browse"
            className="mt-2 px-5 py-2 bg-rose-500 text-white rounded-full text-sm font-medium hover:bg-rose-600 transition-colors"
          >
            Browse Profiles
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {matches.map((match) => {
            const other: OtherProfile | null =
              match.user_a_id === user.id ? match.profile_b : match.profile_a;

            if (!other) return null;

            return (
              <div
                key={match.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="relative h-48 bg-gradient-to-br from-rose-100 to-pink-100 flex items-center justify-center">
                  {other.profile_picture_url ? (
                    <Image
                      src={other.profile_picture_url}
                      alt={other.full_name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, 300px"
                    />
                  ) : (
                    <span className="text-5xl">
                      {other.gender === "female" ? "👩" : other.gender === "male" ? "👨" : "🧑"}
                    </span>
                  )}
                  <div className="absolute top-3 right-3 bg-rose-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">
                    Matched!
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="font-semibold text-gray-900">{other.full_name}</h3>
                  <div className="flex items-center gap-1 text-gray-400 text-xs mt-0.5">
                    <MapPin className="w-3 h-3" />
                    {other.location}
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    Matched {new Date(match.created_at).toLocaleDateString()}
                  </p>

                  <Link
                    href={`/messages/${match.id}`}
                    className="mt-3 w-full flex items-center justify-center gap-2 py-2 bg-rose-50 text-rose-600 rounded-xl text-sm font-medium hover:bg-rose-100 transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Send Message
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
