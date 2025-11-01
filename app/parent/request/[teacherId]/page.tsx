"use client"

import type React from "react"

import { useAuth } from "@/lib/auth-context"
import { useRouter, useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { mockTeachers, mockRequests } from "@/lib/mock-data"
import type { Teacher } from "@/lib/types"

export default function SendRequestPage() {
  const { user } = useAuth()
  const router = useRouter()
  const params = useParams()
  const teacherId = params.teacherId as string

  const [teacher, setTeacher] = useState<Teacher | null>(null)
  const [subject, setSubject] = useState("")
  const [level, setLevel] = useState("High School")
  const [description, setDescription] = useState("")
  const [proposedDate, setProposedDate] = useState("")
  const [isOnline, setIsOnline] = useState(false)
  const [location, setLocation] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!user || user.role !== "parent") {
      router.push("/login")
    } else {
      const foundTeacher = mockTeachers.find((t) => t.id === teacherId)
      setTeacher(foundTeacher || null)
    }
  }, [user, router, teacherId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      if (!subject || !proposedDate) {
        throw new Error("Please fill in all required fields")
      }

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Create new request
      const newRequest = {
        id: `request-${Date.now()}`,
        parentId: user!.id,
        teacherId,
        subject,
        level,
        description,
        status: "pending" as const,
        proposedDate: new Date(proposedDate),
        location: isOnline ? "Online" : location,
        isOnline,
        createdAt: new Date(),
      }

      // Add to mock data
      mockRequests.push(newRequest)

      // Redirect to requests page
      router.push("/parent/requests")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send request")
    } finally {
      setIsLoading(false)
    }
  }

  if (!user || user.role !== "parent") {
    return null
  }

  if (!teacher) {
    return (
      <div className="min-h-screen bg-background">
        <nav className="border-b border-border bg-card">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <Link href="/parent/dashboard" className="text-2xl font-bold text-primary">
              TutorHub
            </Link>
          </div>
        </nav>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground">Teacher not found</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
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
        <Link href="/parent/search" className="text-primary hover:underline mb-4 inline-block">
          ← Back to Search
        </Link>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Teacher Info */}
          <div className="md:col-span-1">
            <Card>
              <CardContent className="pt-6">
                <img
                  src={teacher.image || "/placeholder.svg"}
                  alt={teacher.name}
                  className="w-full h-40 rounded-lg object-cover mb-4"
                />
                <h3 className="text-lg font-semibold mb-2">{teacher.name}</h3>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-yellow-500">★</span>
                  <span className="font-medium">{teacher.rating}</span>
                  <span className="text-sm text-muted-foreground">({teacher.reviewCount})</span>
                </div>
                <p className="text-2xl font-bold text-primary mb-4">${teacher.hourlyRate}/hr</p>
                <div className="space-y-2 text-sm">
                  <p>
                    <span className="font-medium">Experience:</span> {teacher.experience} years
                  </p>
                  <p>
                    <span className="font-medium">Location:</span> {teacher.location}
                  </p>
                  <p>
                    <span className="font-medium">Subjects:</span> {teacher.subjects.join(", ")}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Request Form */}
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Send Tuition Request</CardTitle>
                <CardDescription>Tell {teacher.name} about your learning needs</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm">{error}</div>}

                  <div className="space-y-2">
                    <label htmlFor="subject" className="text-sm font-medium">
                      Subject *
                    </label>
                    <select
                      id="subject"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-md text-sm"
                      required
                    >
                      <option value="">Select a subject</option>
                      {teacher.subjects.map((subj) => (
                        <option key={subj} value={subj}>
                          {subj}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="level" className="text-sm font-medium">
                      Student Level
                    </label>
                    <select
                      id="level"
                      value={level}
                      onChange={(e) => setLevel(e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-md text-sm"
                    >
                      <option value="Elementary">Elementary</option>
                      <option value="Middle School">Middle School</option>
                      <option value="High School">High School</option>
                      <option value="College">College</option>
                      <option value="Adult">Adult</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="description" className="text-sm font-medium">
                      Description
                    </label>
                    <textarea
                      id="description"
                      placeholder="Tell the tutor about your learning goals, challenges, or any specific topics you need help with..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-md text-sm min-h-24"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="proposedDate" className="text-sm font-medium">
                      Proposed Start Date *
                    </label>
                    <Input
                      id="proposedDate"
                      type="date"
                      value={proposedDate}
                      onChange={(e) => setProposedDate(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Session Type</label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" checked={isOnline} onChange={() => setIsOnline(true)} className="w-4 h-4" />
                        <span className="text-sm">Online</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          checked={!isOnline}
                          onChange={() => setIsOnline(false)}
                          className="w-4 h-4"
                        />
                        <span className="text-sm">In-Person</span>
                      </label>
                    </div>
                  </div>

                  {!isOnline && (
                    <div className="space-y-2">
                      <label htmlFor="location" className="text-sm font-medium">
                        Location
                      </label>
                      <Input
                        id="location"
                        placeholder="Your address or preferred meeting location"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                      />
                    </div>
                  )}

                  <div className="flex gap-2 pt-4">
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? "Sending..." : "Send Request"}
                    </Button>
                    <Link href="/parent/search">
                      <Button type="button" variant="outline">
                        Cancel
                      </Button>
                    </Link>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
