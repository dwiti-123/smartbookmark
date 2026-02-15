"use client"

import { GoogleSignInButton } from "@/components/GoogleSignInButton"
import { BookmarkIcon } from "lucide-react"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

export default function SignInPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (session) {
        router.push("/bookmarks")
      }
      setLoading(false)
    }
    checkSession()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-gray-600">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-12">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
          <BookmarkIcon className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">SaveLink</h1>
      </div>

      {/* Sign In Card */}
      <div className="w-full max-w-sm">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome back</h2>
          <p className="text-gray-600">Sign in to save and manage your bookmarks</p>
        </div>

        <GoogleSignInButton />

        <p className="text-xs text-gray-500 text-center mt-8">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  )
}