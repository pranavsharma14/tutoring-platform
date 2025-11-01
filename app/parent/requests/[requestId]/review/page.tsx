"use client"

import type React from "react"

import { useAuth } from "@/lib/auth-context"
import { useRouter, useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import Link from "next/link"
import { mockRequests, mockTeachers, mockReviews } from "@/lib/mock-data"
import type { TutoringRequest, Teacher } from "@/lib/types"

export default function LeaveReviewPage() {
  const { user } = useAuth()
  const router = useRouter()
  const params = useParams()
  const requestId = params.requestId as string

  const [request, setRequest] = useState<TutoringRequest | null>(null)
  const [teacher, setTeacher] = useState<Teacher | null>(null)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (!user || user.role !== "parent") {
      router.push("/login")
    } else {
      const foundRequest = mockRequests.find((r) => r.id === requestId)
      setRequest(foundRequest || null)

      if (foundRequest) {
        const foundTeacher = mockTeachers.find((t) => t.id === foundRequest.teacherId)
        setTeacher(foundTeacher || null)
      }
    }
  }, [user, router, requestId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      if (!comment.trim()) {
        throw new Error("Please write a review comment")
      }

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Create new review
      const newReview = {
        id: `review-${Date.now()}`,
        requestId,
        parentId: user!.id,
        teacherId: request!.teacherId,
        rating,
        comment,
        createdAt: new Date(),
      }

      // Add to mock data
      mockReviews.push(newReview)

      // Update teacher rating
      const teacherToUpdate = mockTeachers.find((t) => t.id === request!.teacherId)
      if (teacherToUpdate) {
        const teacherReviews = mockReviews.filter((r) => r.teacherId === teacherToUpdate.id)
        const avgRating = teacherReviews.reduce((sum, r) => sum + r.rating, 0) / teacherReviews.length
        teacherToUpdate.rating = Math.round(avgRating * 10) / 10
        teacherToUpdate.reviewCount = teacherReviews.length
      }

      setSuccess(true)
      setTimeout(() => {
        router.push("/parent/requests")
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit review")
    } finally {
      setIsLoading(false)
    }
  }

  if (!user || user.role !== "parent") {
    return null
  }

  if (!request || !teacher) {
    return (
      <div className="min-h-screen bg-background">
        <nav className="border-b border-border bg-card">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <Link href="/parent/dashboard" className="text-2xl font-bold text-primary">
              TutorHub
            </Link>
          </div>
        </nav>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground">Request or tutor not found</p>
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

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/parent/requests" className="text-primary hover:underline mb-4 inline-block">
          ← Back to Requests
        </Link>

        <Card>
          <CardHeader>
            <CardTitle>Leave a Review</CardTitle>
            <CardDescription>Share your experience with {teacher.name}</CardDescription>
          </CardHeader>
          <CardContent>
            {success && (
              <div className="bg-green-100 text-green-800 p-4 rounded-lg mb-4">
                Thank you! Your review has been submitted successfully.
              </div>
            )}

            {error && <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm mb-4">{error}</div>}

            <div className="flex gap-4 mb-6 pb-6 border-b border-border">
              <img
                src={teacher.image || "/placeholder.svg"}
                alt={teacher.name}
                className="w-16 h-16 rounded-lg object-cover"
              />
              <div>
                <h3 className="font-semibold text-lg">{teacher.name}</h3>
                <p className="text-sm text-muted-foreground">{request.subject}</p>
                <p className="text-sm text-muted-foreground">
                  Session: {new Date(request.proposedDate).toLocaleDateString()}
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="text-3xl transition-colors"
                    >
                      <span className={star <= rating ? "text-yellow-500" : "text-gray-300"}>★</span>
                    </button>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">{rating} out of 5 stars</p>
              </div>

              <div className="space-y-2">
                <label htmlFor="comment" className="text-sm font-medium">
                  Your Review
                </label>
                <Textarea
                  id="comment"
                  placeholder="Share your experience with this tutor. What did you like? What could be improved?"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="min-h-32"
                  required
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Submitting..." : "Submit Review"}
                </Button>
                <Link href="/parent/requests">
                  <Button type="button" variant="outline" className="bg-transparent">
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
