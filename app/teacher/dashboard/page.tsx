"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { mockRequests, mockTeachers } from "@/lib/mock-data"
import type { TutoringRequest } from "@/lib/types"

export default function TeacherDashboard() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [requests, setRequests] = useState<TutoringRequest[]>([])

  useEffect(() => {
    if (!user || user.role !== "teacher") {
      router.push("/login")
    } else {
      // Load requests for this teacher
      setRequests(mockRequests.filter((r) => r.teacherId === user.id))
    }
  }, [user, router])

  if (!user || user.role !== "teacher") {
    return null
  }

  const teacher = mockTeachers.find((t) => t.id === user.id)

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  const pendingRequests = requests.filter((r) => r.status === "pending")
  const acceptedRequests = requests.filter((r) => r.status === "accepted")

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
                <Link href="/teacher/profile">
                  <Button className="w-full justify-start" variant="ghost">
                    👤 My Profile
                  </Button>
                </Link>
                <Link href="/teacher/requests">
                  <Button className="w-full justify-start" variant="ghost">
                    📋 Manage Requests
                  </Button>
                </Link>
                <Link href="/teacher/students">
                  <Button className="w-full justify-start" variant="ghost">
                    👥 My Students
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
            {/* Profile Card */}
            {teacher && (
              <Card>
                <CardHeader>
                  <CardTitle>Your Profile</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4">
                    <img
                      src={teacher.image || "/placeholder.svg"}
                      alt={teacher.name}
                      className="w-20 h-20 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold">{teacher.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-yellow-500">★</span>
                        <span className="font-medium">{teacher.rating}</span>
                        <span className="text-muted-foreground">({teacher.reviewCount} reviews)</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">${teacher.hourlyRate}/hour</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{pendingRequests.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Active Students</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{acceptedRequests.length}</div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Requests */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Requests</CardTitle>
                <CardDescription>
                  {requests.length === 0 ? "No requests yet" : `${requests.length} total request(s)`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {requests.length === 0 ? (
                  <p className="text-muted-foreground text-sm">
                    No tuition requests yet. Your profile will be visible to parents searching for tutors.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {requests.slice(0, 5).map((request) => (
                      <div key={request.id} className="border border-border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold">{request.subject}</h4>
                            <p className="text-sm text-muted-foreground">{request.level}</p>
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
                      </div>
                    ))}
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
