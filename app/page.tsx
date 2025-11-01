"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function Home() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && user) {
      if (user.role === "parent") {
        router.push("/parent/dashboard")
      } else {
        router.push("/teacher/dashboard")
      }
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (user) {
    return null
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-secondary">
      {/* Navigation */}
      <nav className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-primary">TutorHub</div>
          <div className="flex gap-4">
            <Link href="/login">
              <Button variant="outline">Login</Button>
            </Link>
            <Link href="/signup">
              <Button>Sign Up</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center space-y-6">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground text-balance">Find Your Perfect Tutor</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-balance">
            Connect with verified teachers for home or in-person tuitions. Learn from the best in your area.
          </p>
          <div className="flex gap-4 justify-center pt-4">
            <Link href="/signup?role=parent">
              <Button size="lg" className="text-base">
                Find a Tutor
              </Button>
            </Link>
            <Link href="/signup?role=teacher">
              <Button size="lg" variant="outline" className="text-base bg-transparent">
                Become a Tutor
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-card p-6 rounded-lg border border-border">
            <div className="text-3xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold mb-2">Find Verified Tutors</h3>
            <p className="text-muted-foreground">
              Search by subject, location, and fees. All tutors are verified and rated by parents.
            </p>
          </div>
          <div className="bg-card p-6 rounded-lg border border-border">
            <div className="text-3xl mb-4">📍</div>
            <h3 className="text-xl font-semibold mb-2">Location-Based Search</h3>
            <p className="text-muted-foreground">Find tutors near you for convenient home or in-person tuitions.</p>
          </div>
          <div className="bg-card p-6 rounded-lg border border-border">
            <div className="text-3xl mb-4">⭐</div>
            <h3 className="text-xl font-semibold mb-2">Ratings & Reviews</h3>
            <p className="text-muted-foreground">Make informed decisions based on real reviews from other parents.</p>
          </div>
        </div>
      </section>
    </main>
  )
}
