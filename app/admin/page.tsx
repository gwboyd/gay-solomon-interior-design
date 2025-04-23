"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff } from "lucide-react"

export default function AdminLogin() {
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      // In a real app, you would use Supabase Auth with email/password or magic link
      // For this demo, we'll use a simple password check against an environment variable
      if (password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
        localStorage.setItem("isAdminAuthenticated", "true")
        router.push("/admin/dashboard")
      } else {
        setError("Invalid password")
      }
    } catch (error) {
      setError("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  // Check if already authenticated
  useEffect(() => {
    const isAuthenticated = localStorage.getItem("isAdminAuthenticated") === "true"
    if (isAuthenticated) {
      router.push("/admin/dashboard")
    }
  }, [router])

  return (
    <section className="py-16">
      <div className="container max-w-md mx-auto">
        <h1 className="text-center mb-8">Admin Login</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <div className="p-4 bg-red-50 text-red-800">{error}</div>}

          <div>
            <label htmlFor="password" className="block mb-2 text-sm font-medium">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="appearance-none relative block w-full px-4 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm pr-10"
                placeholder="Enter password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" aria-hidden="true" />
                ) : (
                  <Eye className="h-5 w-5" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </section>
  )
}
