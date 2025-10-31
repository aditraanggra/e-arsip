'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { apiClient } from '@/lib/api/client'
import { authService } from '@/lib/api/services'
import type { User, LoginData } from '@/lib/schemas'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (credentials: LoginData) => Promise<void>
  logout: () => Promise<void>
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  const isAuthenticated = !!user

  useEffect(() => {
    const initAuth = async () => {
      const token = apiClient.getToken()
      
      if (token) {
        try {
          const userData = await authService.me()
          setUser(userData)
        } catch {
          // Token is invalid, clear it
          apiClient.setToken(null)
        }
      }
      
      setIsLoading(false)
    }

    initAuth()
  }, [])

  const login = async (credentials: LoginData) => {
    const { user: userData, token } = await authService.login(credentials)
    
    // Set token and user before navigation
    apiClient.setToken(token)
    setUser(userData)
    
    // Ensure middleware sees authentication regardless of MSW/server path
    if (typeof document !== 'undefined') {
      document.cookie = `auth-token=${token}; path=/; samesite=lax; max-age=86400`
    }
    
    // Use setTimeout to ensure state updates before navigation
    setTimeout(() => {
      router.push('/dashboard')
    }, 100)
  }

  const logout = async () => {
    try {
      await authService.logout()
    } catch (error) {
      // Continue with logout even if API call fails
      console.error('Logout error:', error)
    } finally {
      // Clear token and cookie
      apiClient.setToken(null)
      if (typeof document !== 'undefined') {
        document.cookie = 'auth-token=; path=/; max-age=0'
      }
      
      // Clear user state
      setUser(null)
      
      // Use setTimeout to ensure state updates before navigation
      setTimeout(() => {
        router.push('/login')
      }, 100)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        logout,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
