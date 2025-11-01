"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter, useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { mockTeachers, mockReviews } from "@/lib/mock-data"
import type { Teacher, Review } from "@/lib/types"

export default function TutorProfilePage() {
  const { user } = useAuth()
  const router = useRouter()
  const params = useParams()
  const teacherId = params.teacherId as string

  const [teacher, setTeacher] = useState<Teacher | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])

  useEffect(() => {
    if (!user || user.role !== "parent") {
      router.push("/login")
    } else {
      const foundTeacher = mockTeachers.find((t) => t.id === teacherId)
      setTeacher(foundTeacher || null)

      if (foundTeacher) {
        const tutorReviews = mockReviews.filter((r) => r.teacherId === teacherId)
        setReviews(tutorReviews)
      }
    }
  }, [user, router, teacherId])

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
              <p className="text-muted-foreground">Tutor not found</p>
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
          {/* Sidebar */}
          <div className="md:col-span-1 space-y-4">
            {/* Profile Card */}
            <Card>
              <CardContent className="pt-6">
                <img
                  src={teacher.image || "/placeholder.svg"}
                  alt={teacher.name}
                  className="w-full h-48 rounded-lg object-cover mb-4"
                />
                <h2 className="text-2xl font-bold mb-2">{teacher.name}</h2>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-yellow-500 text-lg">★</span>
                  <span className="text-lg font-bold">{teacher.rating}</span>
                  <span className="text-sm text-muted-foreground">({teacher.reviewCount} reviews)</span>
                </div>
                <p className="text-3xl font-bold text-primary mb-4">${teacher.hourlyRate}</p>
                <p className="text-sm text-muted-foreground mb-4">/hour</p>

                {teacher.verified && (
                  <div className="bg-green-100 text-green-800 px-3 py-2 rounded-lg text-sm font-medium mb-4 text-center">
                    ✓ Verified Tutor
                  </div>
                )}

                <Link href={`/parent/request/${teacher.id}`}>
                  <Button className="w-full">Send Request</Button>
                </Link>
              </CardContent>
            </Card>

            {/* Quick Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Quick Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Experience</p>
                  <p className="font-medium">{teacher.experience} years</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Location</p>
                  <p className="font-medium">{teacher.location}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Availability</p>
                  <p className="font-medium">{teacher.availability.join(", ")}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
            {/* Bio */}
            <Card>
              <CardHeader>
                <CardTitle>About</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{teacher.bio}</p>
              </CardContent>
            </Card>

            {/* Subjects */}
            <Card>
              <CardHeader>
                <CardTitle>Subjects</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {teacher.subjects.map((subject) => (
                    <span
                      key={subject}
                      className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm"
                    >
                      {subject}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Qualifications */}
            <Card>
              <CardHeader>
                <CardTitle>Qualifications</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {teacher.qualifications.map((qual, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-primary mt-1">✓</span>
                      <span>{qual}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Reviews */}
            <Card>
              <CardHeader>
                <CardTitle>Reviews</CardTitle>
                <CardDescription>
                  {reviews.length === 0 ? "No reviews yet" : `${reviews.length} review(s)`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {reviews.length === 0 ? (
                  <p className="text-muted-foreground text-sm">This tutor doesn't have any reviews yet.</p>
                ) : (
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <div key={review.id} className="border-b border-border pb-4 last:border-b-0">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <span key={i} className={i < review.rating ? "text-yellow-500" : "text-gray-300"}>
                                ★
                              </span>
                            ))}
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm">{review.comment}</p>
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
