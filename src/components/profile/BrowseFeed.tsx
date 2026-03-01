"use client";

import { useState } from "react";
import { X, Heart, MapPin, Calendar } from "lucide-react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/types/database";

function calculateAge(birthDate: string): number {
  const today = new Date();
  const dob = new Date(birthDate);
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
  return age;
}

function ProfileCard({
  profile,
  onLike,
  onPass,
}: {
  profile: Profile;
  onLike: () => void;
  onPass: () => void;
}) {
  const age = calculateAge(profile.birth_date);

  return (
    <div className="card-enter bg-white rounded-3xl shadow-md overflow-hidden max-w-sm mx-auto border border-gray-100">
      {/* Avatar */}
      <div className="relative h-80 bg-gradient-to-br from-rose-100 to-pink-100 flex items-center justify-center">
        {profile.profile_picture_url ? (
          <Image
            src={profile.profile_picture_url}
            alt={profile.full_name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 384px"
          />
        ) : (
          <span className="text-7xl select-none">
            {profile.gender === "female" ? "👩" : profile.gender === "male" ? "👨" : "🧑"}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-5">
        <div className="flex items-baseline justify-between mb-1">
          <h2 className="text-xl font-bold text-gray-900">{profile.full_name}</h2>
          <span className="text-lg font-semibold text-rose-500">{age}</span>
        </div>

        <div className="flex items-center gap-1 text-gray-400 text-sm mb-3">
          <MapPin className="w-3.5 h-3.5" />
          <span>{profile.location}</span>
          <Calendar className="w-3.5 h-3.5 ml-2" />
          <span>{new Date(profile.birth_date).getFullYear()}</span>
        </div>

        {profile.bio && (
          <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">{profile.bio}</p>
        )}

        {/* Action buttons */}
        <div className="flex gap-4 mt-5 justify-center">
          <button
            onClick={onPass}
            className="flex-1 flex items-center justify-center gap-2 py-3 border-2 border-gray-200 text-gray-500 rounded-2xl font-semibold hover:border-gray-300 hover:bg-gray-50 transition-all"
          >
            <X className="w-5 h-5" />
            Pass
          </button>
          <button
            onClick={onLike}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-rose-500 text-white rounded-2xl font-semibold hover:bg-rose-600 transition-all shadow-md shadow-rose-200"
          >
            <Heart className="w-5 h-5 fill-white" />
            Like
          </button>
        </div>
      </div>
    </div>
  );
}

export default function BrowseFeed({
  profiles,
  currentUserId,
}: {
  profiles: Profile[];
  currentUserId: string;
}) {
  const supabase = createClient();
  const [queue, setQueue] = useState(profiles);
  const [toast, setToast] = useState<string | null>(null);

  const current = queue[0];

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }

  async function handleAction(action: "like" | "pass") {
    if (!current) return;

    await supabase.from("interests").upsert({
      from_user_id: currentUserId,
      to_user_id: current.id,
      action,
    });

    if (action === "like") {
      // Check if it created a match
      const { data: match } = await supabase
        .from("matches")
        .select("id")
        .or(`user_a_id.eq.${currentUserId},user_b_id.eq.${currentUserId}`)
        .or(`user_a_id.eq.${current.id},user_b_id.eq.${current.id}`)
        .single();

      if (match) {
        showToast(`🎉 It's a match with ${current.full_name}!`);
      } else {
        showToast(`Liked ${current.full_name}`);
      }
    }

    setQueue((prev) => prev.slice(1));
  }

  return (
    <div className="relative">
      {/* Match toast */}
      {toast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-rose-500 text-white px-6 py-3 rounded-full shadow-lg text-sm font-medium animate-bounce">
          {toast}
        </div>
      )}

      {current ? (
        <ProfileCard
          key={current.id}
          profile={current}
          onLike={() => handleAction("like")}
          onPass={() => handleAction("pass")}
        />
      ) : (
        <div className="flex flex-col items-center justify-center h-64 text-center gap-3">
          <span className="text-5xl">✨</span>
          <p className="text-gray-500 font-medium">You&apos;ve seen everyone for now.</p>
          <p className="text-sm text-gray-400">Check back later for new profiles!</p>
        </div>
      )}

      {/* Upcoming cards preview */}
      {queue.length > 1 && (
        <div className="mt-4 text-center text-xs text-gray-400">
          {queue.length - 1} more profile{queue.length - 1 > 1 ? "s" : ""} to browse
        </div>
      )}
    </div>
  );
}
