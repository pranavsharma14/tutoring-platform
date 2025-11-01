"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { mockTeachers, mockRequests } from "@/lib/mock-data"
import type { TutoringRequest } from "@/lib/types"

export default function ParentDashboard() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [requests, setRequests] = useState<TutoringRequest[]>([])

  useEffect(() => {
    if (!user || user.role !== "parent") {
      router.push("/login")
    } else {
      // Load requests for this parent
      setRequests(mockRequests.filter((r) => r.parentId === user.id))
    }
  }, [user, router])

  if (!user || user.role !== "parent") {
    return null
  }

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-primary">TutorHub</div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">Welcome, {user.name}</span>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href="/parent/search">
                  <Button className="w-full justify-start" variant="ghost">
                    🔍 Find a Tutor
                  </Button>
                </Link>
                <Link href="/parent/requests">
                  <Button className="w-full justify-start" variant="ghost">
                    📋 My Requests
                  </Button>
                </Link>
                <Link href="/parent/profile">
                  <Button className="w-full justify-start" variant="ghost">
                    👤 My Profile
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
            {/* Welcome Card */}
            <Card>
              <CardHeader>
                <CardTitle>Welcome to TutorHub</CardTitle>
                <CardDescription>Find the perfect tutor for your child's learning needs</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Start by searching for tutors in your area. Filter by subject, location, and hourly rate to find the
                  best match.
                </p>
                <Link href="/parent/search">
                  <Button>Find a Tutor</Button>
                </Link>
              </CardContent>
            </Card>

            {/* Recent Requests */}
            <Card>
              <CardHeader>
                <CardTitle>Your Tuition Requests</CardTitle>
                <CardDescription>
                  {requests.length === 0 ? "No requests yet" : `${requests.length} active request(s)`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {requests.length === 0 ? (
                  <p className="text-muted-foreground text-sm">
                    You haven't made any tuition requests yet. Start by finding a tutor!
                  </p>
                ) : (
                  <div className="space-y-4">
                    {requests.map((request) => {
                      const teacher = mockTeachers.find((t) => t.id === request.teacherId)
                      return (
                        <div key={request.id} className="border border-border rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="font-semibold">{teacher?.name}</h4>
                              <p className="text-sm text-muted-foreground">{request.subject}</p>
                            </div>
                            <span
                              className={`text-xs px-2 py-1 rounded-full ${
                                request.status === "accepted"
                                  ? "bg-green-100 text-green-800"
                                  : request.status === "pending"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {request.isOnline ? "💻 Online" : "📍 " + request.location}
                          </p>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
