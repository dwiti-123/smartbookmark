"use client";

import { supabase } from "@/lib/supabase";

export function GoogleSignInButton() {
  const handleGoogleSignIn = async () => {
    const redirectTo = `${window.location.origin}/bookmarks`;

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    });

    if (error) console.error("Sign in error:", error);
    else if (data?.url) window.location.href = data.url;
  };

  return (
    <button
      onClick={handleGoogleSignIn}
      className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
    >
      Sign in with Google
    </button>
  );
}
