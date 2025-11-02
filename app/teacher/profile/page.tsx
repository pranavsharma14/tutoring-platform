"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function TeacherProfilePage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  const [form, setForm] = useState({
    name: "",
    email: "",
    bio: "",
    subjects: "",
    qualifications: "",
    hourlyRate: "",
    experience: "",
    location: "",
    image: "",
  })

  useEffect(() => {
    // Wait until user data is loaded
    if (isLoading) return

    // Redirect if not logged in or not teacher
    if (!user || user.role !== "teacher") {
      router.push("/login")
      return
    }

    // Prevent fetch if id missing
    if (!user.id) {
      console.error("❌ No user.id found yet")
      return
    }

    // Fetch teacher profile
    fetch(`http://localhost:5000/api/teacher/${user.id}`, {
      headers: { Authorization: `Bearer ${user.token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setForm({
          name: data.name || "",
          email: data.email || "",
          bio: data.bio || "",
          subjects: data.subjects?.join(", ") || "",
          qualifications: data.qualifications?.join(", ") || "",
          hourlyRate: data.hourlyRate?.toString() || "",
          experience: data.experience?.toString() || "",
          location: data.location || "",
          image: data.image || "",
        })
      })
      .catch((err) => console.error("Error fetching teacher data:", err))
  }, [user, isLoading, router])

  const handleSave = async () => {
    if (!user?.id) return alert("User not logged in!")

    const updatedData = {
      ...form,
      subjects: form.subjects.split(",").map((s) => s.trim()),
      qualifications: form.qualifications.split(",").map((q) => q.trim()),
      hourlyRate: Number(form.hourlyRate),
      experience: Number(form.experience),
    }

    const res = await fetch(`http://localhost:5000/api/teacher/${user.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user.token}`,
      },
      body: JSON.stringify(updatedData),
    })

    if (res.ok) alert("✅ Profile updated successfully!")
    else alert("❌ Error updating profile")
  }

  // Loading state UI
  if (isLoading || !user) {
    return <div className="p-8 text-center text-gray-500">Loading profile...</div>
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>My Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <Input placeholder="Email" disabled value={form.email} />

          <Input
            placeholder="Location"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
          />

          <Input
            placeholder="Hourly Rate ($)"
            type="number"
            value={form.hourlyRate}
            onChange={(e) => setForm({ ...form, hourlyRate: e.target.value })}
          />

          <Input
            placeholder="Experience (years)"
            type="number"
            value={form.experience}
            onChange={(e) => setForm({ ...form, experience: e.target.value })}
          />

          <Input
            placeholder="Subjects (comma separated)"
            value={form.subjects}
            onChange={(e) => setForm({ ...form, subjects: e.target.value })}
          />

          <Input
            placeholder="Qualifications (comma separated)"
            value={form.qualifications}
            onChange={(e) => setForm({ ...form, qualifications: e.target.value })}
          />

          <textarea
            placeholder="Bio"
            className="w-full border rounded p-2"
            rows={4}
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
          />

          <Input
            placeholder="Profile Image URL"
            value={form.image}
            onChange={(e) => setForm({ ...form, image: e.target.value })}
          />

          <Button onClick={handleSave}>Save Changes</Button>
        </CardContent>
      </Card>
    </div>
  )
}
