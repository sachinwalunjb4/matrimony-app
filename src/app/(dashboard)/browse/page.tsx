import { createClient } from "@/lib/supabase/server";
import BrowseFeed from "@/components/profile/BrowseFeed";
import type { Interest } from "@/types/database";

export default async function BrowsePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // Fetch the current user's profile to know their preference
  const { data: myProfile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!myProfile) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        Please complete your profile first.
      </div>
    );
  }

  // Fetch all users I have already interacted with (to exclude from feed)
  const { data: seen } = await supabase
    .from("interests")
    .select("*")
    .eq("from_user_id", user.id);

  const seenIds = [user.id, ...((seen as Interest[] | null)?.map((r) => r.to_user_id) ?? [])];

  // Build the gender filter based on preference
  const genderFilter =
    myProfile.preference === "any"
      ? ["male", "female", "other"]
      : [myProfile.preference];

  const { data: candidates } = await supabase
    .from("profiles")
    .select("*")
    .in("gender", genderFilter)
    .not("id", "in", `(${seenIds.join(",")})`)
    .limit(20);

  return (
    <div className="pb-20 md:pl-52 md:pb-6">
      <h1 className="text-xl font-bold text-gray-900 mb-4">Discover</h1>
      <BrowseFeed profiles={candidates ?? []} currentUserId={user.id} />
    </div>
  );
}
