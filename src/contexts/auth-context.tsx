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
    let isMounted = true

    const initAuth = async () => {
      try {
        const userData = await authService.me()
        if (isMounted) {
          setUser(userData)
        }
      } catch {
        apiClient.setToken(null)
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    initAuth()

    const handleUnauthorized = () => {
      if (isMounted) {
        setUser(null)
        setIsLoading(false)
      }
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('api:unauthorized', handleUnauthorized)
    }

    return () => {
      isMounted = false
      if (typeof window !== 'undefined') {
        window.removeEventListener('api:unauthorized', handleUnauthorized)
      }
    }
  }, [])

  const login = async (credentials: LoginData) => {
    const { user: userData, token } = await authService.login(credentials)

    apiClient.setToken(token)
    setUser(userData)

    if (typeof document !== 'undefined') {
      const secureAttr = window.location.protocol === 'https:' ? '; secure' : ''
      document.cookie = `auth-token=active; path=/; samesite=lax; max-age=86400${secureAttr}`
    }

    router.replace('/dashboard')
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
      setUser(null)

      if (typeof document !== 'undefined') {
        document.cookie = 'auth-token=; path=/; max-age=0'
      }

      router.replace('/login')
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
