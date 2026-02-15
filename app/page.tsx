"use client";

import { GoogleSignInButton } from "@/components/GoogleSignInButton";
import { BookmarkIcon, Plus, Lock, Zap, Sparkles, AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function LandingPage() {
  const router = useRouter();
  const [year, setYear] = useState<number>(0);

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        // Redirect to bookmarks if already logged in
        router.push("/bookmarks");
      }
    };
    checkSession();
    
    // Set year on client side only
    setYear(new Date().getFullYear());
  }, [router]);

  const scrollToFeatures = () => {
    const element = document.getElementById("features");
    element?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Navigation */}
      <nav className="border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BookmarkIcon className="w-6 h-6 text-blue-600" />
            <span className="text-xl font-semibold">SaveLink</span>
          </div>
          <GoogleSignInButton />
        </div>
      </nav>

      {/* Hero Section */}
      <section className="border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-24">
          <div className="max-w-2xl">
            <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
              Save and organize your bookmarks
            </h1>

            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              A simple, smart bookmark manager. Save links with AI-generated titles, 
              prevent duplicates, and access them from anywhere instantly.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <GoogleSignInButton />
              <button
                type="button"
                onClick={scrollToFeatures}
                className="px-8 py-3 border border-gray-300 text-gray-900 rounded-lg font-medium hover:bg-gray-50 transition"
              >
                Learn more
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-24">
          <h2 className="text-3xl font-bold text-gray-900 mb-16">Features</h2>

          <div className="grid md:grid-cols-2 gap-16 max-w-4xl">
            {/* Feature 1 - Save with one click */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Plus className="w-6 h-6 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Save with one click
                </h3>
              </div>
              <p className="text-gray-600 leading-relaxed">
                Add any URL with a title. No complicated forms or settings. Just
                save and move on.
              </p>
            </div>

            {/* Feature 2 - AI Title Detection */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Sparkles className="w-6 h-6 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Smart AI titles
                </h3>
              </div>
              <p className="text-gray-600 leading-relaxed">
                Auto-detect page titles from any URL. If HTML fails, AI generates a perfect title. No manual typing needed.
              </p>
            </div>

            {/* Feature 3 - Duplicate Detection */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <AlertCircle className="w-6 h-6 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Duplicate detection
                </h3>
              </div>
              <p className="text-gray-600 leading-relaxed">
                Never save the same URL twice. Get instant alerts when you try to add a duplicate bookmark.
              </p>
            </div>

            {/* Feature 4 - Real-time sync */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Zap className="w-6 h-6 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Real-time sync
                </h3>
              </div>
              <p className="text-gray-600 leading-relaxed">
                Changes appear instantly across all devices. Add a bookmark and it's there everywhere immediately.
              </p>
            </div>

            {/* Feature 5 - Privacy */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Lock className="w-6 h-6 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Your data is private
                </h3>
              </div>
              <p className="text-gray-600 leading-relaxed">
                Only you see your bookmarks. Your data is encrypted and never
                shared with anyone else.
              </p>
            </div>

            {/* Feature 6 - Manage easily */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <BookmarkIcon className="w-6 h-6 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Manage easily
                </h3>
              </div>
              <p className="text-gray-600 leading-relaxed">
                Add, edit, delete, and organize your bookmarks in a clean,
                distraction-free interface. Search and filter instantly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-24">
          <h2 className="text-3xl font-bold text-gray-900 mb-16">
            How it works
          </h2>

          <div className="space-y-12 max-w-2xl">
            <div>
              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-semibold">
                    1
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Sign in with Google
                  </h3>
                  <p className="text-gray-600">
                    Create your account in seconds using your Google login.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-semibold">
                    2
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Add your bookmarks
                  </h3>
                  <p className="text-gray-600">
                    Paste a URL and click "Get Title" to auto-detect with AI. Or type a custom title. No duplicates allowed.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-semibold">
                    3
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Search and organize
                  </h3>
                  <p className="text-gray-600">
                    Search by title, switch between card and table views, and access your bookmarks from any device instantly.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlight - What Makes Us Different */}
      <section className="border-b border-gray-200 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6 py-24">
          <h2 className="text-3xl font-bold text-gray-900 mb-16">
            Why SaveLink is different
          </h2>

          <div className="grid md:grid-cols-3 gap-12">
            <div>
              <div className="mb-4">
                <Sparkles className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                AI-Powered Titles
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Never type another title manually. Our AI reads the page and suggests 
                the perfect title in seconds. Fast for 85% of sites, AI fallback for the rest.
              </p>
            </div>

            <div>
              <div className="mb-4">
                <AlertCircle className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Smart Duplicate Detection
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Never accidentally save the same link twice. Real-time duplicate checking 
                warns you instantly and lets you edit existing bookmarks.
              </p>
            </div>

            <div>
              <div className="mb-4">
                <Zap className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Lightning Fast
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Real-time sync across all devices. Changes appear instantly. 
                No waiting, no delays. Just instant access everywhere.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Ready to get started?
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Save your first bookmark in less than a minute. It's free and
              takes just a few clicks. Auto-detect titles with AI included.
            </p>
            <GoogleSignInButton />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <BookmarkIcon className="w-5 h-5 text-blue-600" />
              <span className="font-semibold">SaveLink</span>
            </div>
            <p className="text-sm text-gray-600">
              © © {year || "2026"} SaveLink. All rights reserved. SaveLink. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}