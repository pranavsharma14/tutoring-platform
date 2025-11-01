"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import Link from "next/link"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState<"parent" | "teacher">("parent")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      await login(email, password, role)
      router.push(role === "parent" ? "/parent/dashboard" : "/teacher/dashboard")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed")
    } finally {
      setIsLoading(false)
    }
  }

  // Demo credentials
  const demoCredentials = {
    parent: { email: "parent@example.com", password: "demo" },
    teacher: { email: "sarah@example.com", password: "demo" },
  }

  const fillDemoCredentials = (userRole: "parent" | "teacher") => {
    setEmail(demoCredentials[userRole].email)
    setPassword(demoCredentials[userRole].password)
    setRole(userRole)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Login to TutorHub</CardTitle>
          <CardDescription>Sign in to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm">{error}</div>}

            <div className="space-y-2">
              <label className="text-sm font-medium">I am a:</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    value="parent"
                    checked={role === "parent"}
                    onChange={(e) => setRole(e.target.value as "parent" | "teacher")}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Parent</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    value="teacher"
                    checked={role === "teacher"}
                    onChange={(e) => setRole(e.target.value as "parent" | "teacher")}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Teacher</span>
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Logging in..." : "Login"}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Demo Accounts</span>
              </div>
            </div>

            <div className="space-y-2">
              <Button
                type="button"
                variant="outline"
                className="w-full text-sm bg-transparent"
                onClick={() => fillDemoCredentials("parent")}
              >
                Demo Parent
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full text-sm bg-transparent"
                onClick={() => fillDemoCredentials("teacher")}
              >
                Demo Teacher
              </Button>
            </div>
          </form>

          <div className="mt-6 text-center text-sm">
            Don't have an account?{" "}
            <Link href="/signup" className="text-primary hover:underline font-medium">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
