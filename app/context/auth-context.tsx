"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { restoreApiBaseUrl } from "@/lib/api"

interface User {
  username: string
  token: string
  refresh_token?: string
}

interface AuthContextType {
  user: User | null
  login: (userData: User) => void
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Restore from localStorage
  useEffect(() => {
    // Only run on client side to avoid hydration issues
    if (typeof window === 'undefined') {
      setLoading(false)
      return
    }
    
    // Restore API base URL first
    restoreApiBaseUrl()
    
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser)
        setUser(parsedUser)
      } catch (error) {
        console.error("Error parsing stored user:", error)
        localStorage.removeItem("user")
      }
    }
    setLoading(false)
  }, [])

  const login = (userData: User) => {
    setUser(userData)
    if (typeof window !== 'undefined') {
      localStorage.setItem("user", JSON.stringify(userData))
    }
  }

  const logout = () => {
    console.log("🚪 Logging out user");
    setUser(null)
    if (typeof window !== 'undefined') {
      // Clear all authentication data
      localStorage.removeItem("user")
      localStorage.removeItem("access_token")
      localStorage.removeItem("refresh_token")
      localStorage.removeItem("api_company")
      
      // Clear any other auth-related data
      sessionStorage.clear()
      
      // Use setTimeout to ensure state updates complete before redirect
      setTimeout(() => {
        window.location.href = "/login"
      }, 100)
    }
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth must be used inside AuthProvider")
  return context
}
