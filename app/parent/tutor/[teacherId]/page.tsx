"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

type Teacher = {
  _id: string;
  name: string;
  bio: string;
  subjects: string[];
  qualifications: string[];
  hourlyRate: number;
  experience: number;
  location: string;
  image?: string;
  verified?: boolean;
  rating?: number;
  reviewCount?: number;
  availability?: string[];
};

type Review = {
  _id: string;
  teacherId: string;
  comment: string;
  rating: number;
  createdAt: string;
};

export default function TutorProfilePage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const teacherId = params.teacherId as string;

  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    if (!teacherId) return;

    // ✅ use public API (no token)
fetch(`http://localhost:5000/api/public/teacher/${teacherId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch teacher");
        return res.json();
      })
      .then((data) => setTeacher(data))
      .catch((err) => {
        console.error("Error fetching teacher:", err);
        setTeacher(null);
      });

    fetch(`http://localhost:5000/api/reviews/${teacherId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch reviews");
        return res.json();
      })
      .then((data) => setReviews(Array.isArray(data) ? data : []))
      .catch((err) => {
        console.error("Error fetching reviews:", err);
        setReviews([]);
      });
  }, [teacherId]);

  if (!teacher)
    return (
      <div className="min-h-screen bg-background flex justify-center items-center text-muted-foreground">
        Loading tutor details...
      </div>
    );

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/parent/dashboard" className="text-2xl font-bold text-primary">
            TutorHub
          </Link>
          {user && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                localStorage.removeItem("tutoring_user");
                router.push("/");
              }}
            >
              Logout
            </Button>
          )}
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-8">
        <Link href="/parent/search" className="text-primary hover:underline mb-4 inline-block">
          ← Back to Search
        </Link>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="md:col-span-1 space-y-4">
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
                  <span className="text-lg font-bold">{teacher.rating || 0}</span>
                  <span className="text-sm text-muted-foreground">
                    ({teacher.reviewCount || 0} reviews)
                  </span>
                </div>
                <p className="text-3xl font-bold text-primary mb-4">${teacher.hourlyRate}</p>
                <p className="text-sm text-muted-foreground mb-4">/hour</p>

                {teacher.verified && (
                  <div className="bg-green-100 text-green-800 px-3 py-2 rounded-lg text-sm font-medium mb-4 text-center">
                    ✓ Verified Tutor
                  </div>
                )}

                <Link href={`/parent/request/${teacher._id}`}>
                  <Button className="w-full">Send Request</Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Quick Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Experience</p>
                  <p className="font-medium">{teacher.experience || 0} years</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Location</p>
                  <p className="font-medium">{teacher.location || "Not specified"}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main */}
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>About</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{teacher.bio || "No bio available"}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Subjects</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {teacher.subjects?.length ? (
                    teacher.subjects.map((subject, i) => (
                      <span key={i} className="bg-secondary text-secondary-foreground px-3 py-1 rounded text-sm">
                        {subject}
                      </span>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No subjects listed</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Qualifications</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                  {teacher.qualifications?.length ? (
                    teacher.qualifications.map((q, i) => <li key={i}>{q}</li>)
                  ) : (
                    <p className="text-sm text-muted-foreground">No qualifications listed</p>
                  )}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Reviews</CardTitle>
              </CardHeader>
              <CardContent>
                {reviews.length > 0 ? (
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <div key={review._id} className="border-b pb-2">
                        <p className="font-medium">⭐ {review.rating}/5</p>
                        <p className="text-muted-foreground">{review.comment}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No reviews yet.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
