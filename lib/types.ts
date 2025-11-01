export type UserRole = "parent" | "teacher"

export interface User {
  id: string
  email: string
  name: string
  password: string
  role: UserRole
  avatar?: string
  createdAt: Date
}

export interface Teacher extends User {
  role: "teacher"
  bio: string
  subjects: string[]
  qualifications: string[]
  hourlyRate: number
  location: string
  latitude: number
  longitude: number
  verified: boolean
  rating: number
  reviewCount: number
  availability: string[]
  experience: number
  image?: string
}

export interface Parent extends User {
  role: "parent"
  location: string
  latitude: number
  longitude: number
}

export interface TutoringRequest {
  id: string
  parentId: string
  teacherId: string
  subject: string
  level: string
  description: string
  status: "pending" | "accepted" | "rejected" | "completed"
  proposedDate: Date
  location: string
  isOnline: boolean
  createdAt: Date
}

export interface Review {
  id: string
  requestId: string
  parentId: string
  teacherId: string
  rating: number
  comment: string
  createdAt: Date
}
