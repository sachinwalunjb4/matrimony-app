import Link from "next/link";
import { Heart } from "lucide-react";

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-rose-50 via-white to-pink-50 px-4">
      <div className="text-center max-w-2xl">
        <div className="flex items-center justify-center gap-2 mb-6">
          <Heart className="w-10 h-10 text-rose-500 fill-rose-500" />
          <span className="text-3xl font-bold text-rose-600">Bandhan</span>
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
      </div>
    </main>
  );
}
