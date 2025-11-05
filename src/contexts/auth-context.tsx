'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { apiClient } from '@/lib/api/client'
import { authService } from '@/lib/api/services'
import type { User, LoginData } from '@/lib/schemas'
import { loadStoredToken } from '@/lib/auth/token-storage'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (credentials: LoginData) => Promise<void>
  logout: () => Promise<void>
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const AUTH_COOKIE_NAME = 'auth-token'
const AUTH_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24

const setAuthCookieActive = () => {
  if (typeof document === 'undefined') return
  const isSecure = typeof window !== 'undefined' && window.location.protocol === 'https:'
  const secureAttr = isSecure ? '; secure' : ''
  document.cookie = `${AUTH_COOKIE_NAME}=active; path=/; samesite=lax; max-age=${AUTH_COOKIE_MAX_AGE_SECONDS}${secureAttr}`
}

const clearAuthCookie = () => {
  if (typeof document === 'undefined') return
  const isSecure = typeof window !== 'undefined' && window.location.protocol === 'https:'
  const secureAttr = isSecure ? '; secure' : ''
  document.cookie = `${AUTH_COOKIE_NAME}=; path=/; samesite=lax; max-age=0${secureAttr}`
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  const isAuthenticated = !!user

  useEffect(() => {
    let isMounted = true

    const initAuth = async () => {
      const storedToken = loadStoredToken()
      if (!storedToken) {
        apiClient.setToken(null)
        clearAuthCookie()
        if (isMounted) {
          setIsLoading(false)
          setUser(null)
        }
        return
      }

      apiClient.setToken(storedToken)

      try {
        const userData = await authService.me()
        if (isMounted) {
          setUser(userData)
          setAuthCookieActive()
        }
      } catch {
        apiClient.setToken(null)
        clearAuthCookie()
        if (isMounted) {
          setUser(null)
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    initAuth()

    const handleUnauthorized = () => {
      if (isMounted) {
        apiClient.setToken(null)
        clearAuthCookie()
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

    setAuthCookieActive()

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

      clearAuthCookie()

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
