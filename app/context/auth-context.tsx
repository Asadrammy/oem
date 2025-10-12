"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"

interface User {
  username: string
  token: string
}

interface AuthContextType {
  user: User | null
  login: (userData: User) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  // Restore from localStorage
  useEffect(() => {
    // Only run on client side to avoid hydration issues
    if (typeof window === 'undefined') return;
    
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
  }, [])

  const login = (userData: User) => {
    setUser(userData)
    if (typeof window !== 'undefined') {
      localStorage.setItem("user", JSON.stringify(userData))
    }
  }

  const logout = () => {
    setUser(null)
    if (typeof window !== 'undefined') {
      localStorage.removeItem("user")
    }
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth must be used inside AuthProvider")
  return context
}
