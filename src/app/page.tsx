import Link from "next/link";
import { Heart, MapPin, Briefcase } from "lucide-react";
import ThemeToggle from "@/components/ui/ThemeToggle";

const sampleProfiles = [
  {
    name: "Priya Deshmukh",
    age: 27,
    location: "Pune, Maharashtra",
    occupation: "Software Engineer",
    bio: "Love traveling, reading Marathi literature, and cooking traditional recipes. Looking for a kind and ambitious partner.",
    emoji: "👩",
    tag: "Verified",
  },
  {
    name: "Rahul Kulkarni",
    age: 29,
    location: "Nashik, Maharashtra",
    occupation: "Doctor",
    bio: "Family-oriented, enjoy cricket and Marathi theatre. Seeking a caring, like-minded life partner to build a happy home.",
    emoji: "👨",
    tag: "New",
  },
  {
    name: "Sneha Patil",
    age: 25,
    location: "Aurangabad, Maharashtra",
    occupation: "Teacher",
    bio: "Passionate about education and social work. I value honesty, simplicity, and a strong family bond above everything.",
    emoji: "👩",
    tag: "Verified",
  },
];

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-rose-50 via-white to-pink-50 px-4 py-16">
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      <div className="text-center max-w-2xl w-full">
        <div className="flex items-center justify-center gap-2 mb-6">
          <Heart className="w-10 h-10 text-rose-500 fill-rose-500" />
          <span className="text-3xl font-bold text-rose-600">Marathi Bandhan</span>
        </div>
        <h1 className="text-5xl font-extrabold text-gray-900 mb-4 leading-tight">
          Find Your{" "}
          <span className="text-rose-500">Life Partner</span>
        </h1>
        <p className="text-lg text-gray-500 mb-10">
          A modern matrimony platform built on trust, privacy, and meaningful
          connections. Every profile is verified. Every match is intentional.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link
            href="/register"
            className="px-8 py-3 bg-rose-500 text-white rounded-full font-semibold shadow-lg hover:bg-rose-600 transition-colors"
          >
            Get Started
          </Link>
          <Link
            href="/login"
            className="px-8 py-3 border-2 border-rose-200 text-rose-600 rounded-full font-semibold hover:bg-rose-50 transition-colors"
          >
            Sign In
          </Link>
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-3 gap-6 text-center">
          {[
            { label: "Profiles", value: "10K+" },
            { label: "Matches Made", value: "2.4K+" },
            { label: "Marriages", value: "800+" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-2xl p-6 shadow-sm border border-rose-100">
              <div className="text-2xl font-bold text-rose-500">{stat.value}</div>
              <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Sample Profiles */}
        <div className="mt-16">
          <h2 className="text-xl font-bold text-gray-800 mb-2">Meet Some of Our Members</h2>
          <p className="text-sm text-gray-400 mb-8">Sign up to connect with thousands of verified profiles</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {sampleProfiles.map((profile) => (
              <div
                key={profile.name}
                className="bg-white rounded-2xl shadow-sm border border-rose-100 p-5 text-left hover:shadow-md transition-shadow"
              >
                {/* Avatar + tag */}
                <div className="flex items-start justify-between mb-3">
                  <div className="w-14 h-14 rounded-full bg-rose-100 flex items-center justify-center text-3xl">
                    {profile.emoji}
                  </div>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-rose-50 text-rose-500 border border-rose-100">
                    {profile.tag}
                  </span>
                </div>

                {/* Name & age */}
                <h3 className="font-bold text-gray-900 text-base">{profile.name}, {profile.age}</h3>

                {/* Location */}
                <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                  <MapPin className="w-3 h-3" />
                  {profile.location}
                </div>

                {/* Occupation */}
                <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                  <Briefcase className="w-3 h-3" />
                  {profile.occupation}
                </div>

                {/* Bio */}
                <p className="text-xs text-gray-500 mt-3 line-clamp-3">{profile.bio}</p>
              </div>
            ))}
          </div>

          <p className="mt-6 text-sm text-gray-400">
            <Link href="/register" className="text-rose-500 font-medium hover:underline">
              Create your profile
            </Link>{" "}
            to start connecting
          </p>
        </div>
      </div>
    </main>
  );
}
