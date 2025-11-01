"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { mockTeachers, mockRequests } from "@/lib/mock-data"
import type { TutoringRequest } from "@/lib/types"

export default function ParentRequestsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [requests, setRequests] = useState<TutoringRequest[]>([])
  const [filter, setFilter] = useState<"all" | "pending" | "accepted" | "rejected" | "completed">("all")

  useEffect(() => {
    if (!user || user.role !== "parent") {
      router.push("/login")
    } else {
      const userRequests = mockRequests.filter((r) => r.parentId === user.id)
      setRequests(userRequests)
    }
  }, [user, router])

  if (!user || user.role !== "parent") {
    return null
  }

  const filteredRequests = filter === "all" ? requests : requests.filter((r) => r.status === filter)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "accepted":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      case "completed":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/parent/dashboard" className="text-2xl font-bold text-primary">
            TutorHub
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              localStorage.removeItem("tutoring_user")
              router.push("/")
            }}
          >
            Logout
          </Button>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">My Tuition Requests</h1>
          <p className="text-muted-foreground">Manage and track your tuition requests</p>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {(["all", "pending", "accepted", "rejected", "completed"] as const).map((status) => (
            <Button
              key={status}
              variant={filter === status ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(status)}
              className={filter === status ? "" : "bg-transparent"}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Button>
          ))}
        </div>

        {/* Requests List */}
        <div className="space-y-4">
          {filteredRequests.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground mb-4">
                  {filter === "all" ? "You haven't sent any requests yet." : `No ${filter} requests.`}
                </p>
                <Link href="/parent/search">
                  <Button>Find a Tutor</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            filteredRequests.map((request) => {
              const teacher = mockTeachers.find((t) => t.id === request.teacherId)
              return (
                <Card key={request.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex gap-4">
                      {teacher && (
                        <img
                          src={teacher.image || "/placeholder.svg"}
                          alt={teacher.name}
                          className="w-20 h-20 rounded-lg object-cover"
                        />
                      )}
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="text-lg font-semibold">{teacher?.name}</h3>
                            <p className="text-sm text-muted-foreground">{request.subject}</p>
                          </div>
                          <span
                            className={`text-xs px-3 py-1 rounded-full font-medium ${getStatusColor(request.status)}`}
                          >
                            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                          <div>
                            <p className="text-muted-foreground">Level</p>
                            <p className="font-medium">{request.level}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Start Date</p>
                            <p className="font-medium">{new Date(request.proposedDate).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Session Type</p>
                            <p className="font-medium">{request.isOnline ? "Online" : "In-Person"}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Rate</p>
                            <p className="font-medium">${teacher?.hourlyRate}/hour</p>
                          </div>
                        </div>

                        {request.description && (
                          <p className="text-sm text-muted-foreground mb-3">{request.description}</p>
                        )}

                        <div className="flex gap-2">
                          {request.status === "pending" && (
                            <Button size="sm" variant="outline" className="bg-transparent">
                              Cancel Request
                            </Button>
                          )}
                          {request.status === "accepted" && (
                            <>
                              <Button size="sm" variant="outline" className="bg-transparent">
                                Message Tutor
                              </Button>
                              <Button size="sm" variant="outline" className="bg-transparent">
                                Reschedule
                              </Button>
                            </>
                          )}
                          {request.status === "completed" && (
                            <Link href={`/parent/requests/${request.id}/review`}>
                              <Button size="sm">Leave Review</Button>
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>
      </main>
    </div>
  )
}
