"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { mockTeachers } from "@/lib/mock-data"
import type { Teacher } from "@/lib/types"

export default function SearchTutorsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSubject, setSelectedSubject] = useState("")
  const [maxRate, setMaxRate] = useState(100)
  const [filteredTeachers, setFilteredTeachers] = useState<Teacher[]>(mockTeachers)

  useEffect(() => {
    if (!user || user.role !== "parent") {
      router.push("/login")
    }
  }, [user, router])

  useEffect(() => {
    let filtered = mockTeachers

    if (searchTerm) {
      filtered = filtered.filter(
        (t) =>
          t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.bio.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (selectedSubject) {
      filtered = filtered.filter((t) => t.subjects.some((s) => s.toLowerCase().includes(selectedSubject.toLowerCase())))
    }

    filtered = filtered.filter((t) => t.hourlyRate <= maxRate)

    setFilteredTeachers(filtered)
  }, [searchTerm, selectedSubject, maxRate])

  if (!user || user.role !== "parent") {
    return null
  }

  const allSubjects = Array.from(new Set(mockTeachers.flatMap((t) => t.subjects)))

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/parent/dashboard" className="text-2xl font-bold text-primary">
            TutorHub
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{user.name}</span>
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
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Filters */}
          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Filters</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Search</label>
                  <Input
                    placeholder="Name or subject..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Subject</label>
                  <select
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-md text-sm"
                  >
                    <option value="">All Subjects</option>
                    {allSubjects.map((subject) => (
                      <option key={subject} value={subject}>
                        {subject}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Max Hourly Rate: ${maxRate}</label>
                  <input
                    type="range"
                    min="20"
                    max="100"
                    value={maxRate}
                    onChange={(e) => setMaxRate(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tutors Grid */}
          <div className="md:col-span-3">
            <div className="mb-4">
              <h2 className="text-2xl font-bold">Available Tutors</h2>
              <p className="text-muted-foreground">
                {filteredTeachers.length} tutor{filteredTeachers.length !== 1 ? "s" : ""} found
              </p>
            </div>

            <div className="grid gap-4">
              {filteredTeachers.map((teacher) => (
                <Card key={teacher.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex gap-4">
                      <img
                        src={teacher.image || "/placeholder.svg"}
                        alt={teacher.name}
                        className="w-24 h-24 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="text-lg font-semibold">{teacher.name}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-yellow-500">★</span>
                              <span className="text-sm font-medium">{teacher.rating}</span>
                              <span className="text-sm text-muted-foreground">({teacher.reviewCount} reviews)</span>
                              {teacher.verified && (
                                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                  ✓ Verified
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-primary">${teacher.hourlyRate}</p>
                            <p className="text-xs text-muted-foreground">per hour</p>
                          </div>
                        </div>

                        <p className="text-sm text-muted-foreground mb-3">{teacher.bio}</p>

                        <div className="flex flex-wrap gap-2 mb-3">
                          {teacher.subjects.slice(0, 3).map((subject) => (
                            <span
                              key={subject}
                              className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded"
                            >
                              {subject}
                            </span>
                          ))}
                          {teacher.subjects.length > 3 && (
                            <span className="text-xs text-muted-foreground px-2 py-1">
                              +{teacher.subjects.length - 3} more
                            </span>
                          )}
                        </div>

                        <div className="flex gap-2">
                          <Link href={`/parent/tutor/${teacher.id}`}>
                            <Button size="sm">View Profile</Button>
                          </Link>
                          <Link href={`/parent/request/${teacher.id}`}>
                            <Button size="sm" variant="outline">
                              Send Request
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {filteredTeachers.length === 0 && (
                <Card>
                  <CardContent className="pt-6 text-center">
                    <p className="text-muted-foreground">No tutors found matching your criteria.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
