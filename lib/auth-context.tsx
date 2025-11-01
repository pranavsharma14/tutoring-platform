"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import type { User } from "./types"
import { mockTeachers, mockParents } from "./mock-data"

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string, role: "parent" | "teacher") => Promise<void>
  logout: () => void
  signup: (email: string, password: string, name: string, role: "parent" | "teacher") => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check localStorage for existing session
    const storedUser = localStorage.getItem("tutoring_user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string, role: "parent" | "teacher") => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500))

      let foundUser: User | null = null

      if (role === "teacher") {
        foundUser = mockTeachers.find((t) => t.email === email) || null
      } else {
        foundUser = mockParents.find((p) => p.email === email) || null
      }

      if (!foundUser) {
        throw new Error("Invalid credentials")
      }

      setUser(foundUser)
      localStorage.setItem("tutoring_user", JSON.stringify(foundUser))
    } finally {
      setIsLoading(false)
    }
  }

  const signup = async (email: string, password: string, name: string, role: "parent" | "teacher") => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500))

      const newUser: User = {
        id: `user-${Date.now()}`,
        email,
        name,
        role,
        avatar: "/diverse-user-avatars.png",
        createdAt: new Date(),
      }

      setUser(newUser)
      localStorage.setItem("tutoring_user", JSON.stringify(newUser))
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("tutoring_user")
  }

  return <AuthContext.Provider value={{ user, isLoading, login, logout, signup }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}
