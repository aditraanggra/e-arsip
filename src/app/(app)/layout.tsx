'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { AppSidebar } from '@/components/layout/app-sidebar'
import { AppHeader } from '@/components/layout/app-header'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { Badge } from '@/components/ui/badge'

const usingMocks = process.env.NEXT_PUBLIC_USE_MOCKS === 'true'

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  // Client-side redirect when unauthenticated to avoid RSC payload errors
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login')
    }
  }, [isLoading, isAuthenticated, router])

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Render nothing briefly while redirecting
  if (!isLoading && !isAuthenticated) {
    return null
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-muted/20">
        <AppSidebar />
        <SidebarInset className="bg-gradient-to-br from-emerald-50/40 via-white to-yellow-50/30">
          <AppHeader />
          <main className="flex w-full flex-1 flex-col px-4 py-4 sm:px-6 sm:py-6 xl:px-8 2xl:px-12 min-w-0">
            {children}
          </main>
          <footer className="flex w-full flex-col gap-2 border-t border-emerald-100/60 bg-white/70 px-4 py-3 text-xs text-emerald-900 sm:flex-row sm:items-center sm:justify-between sm:px-6 xl:px-8">
            <div className="flex items-center gap-2">
              <Badge
                variant={usingMocks ? 'outline' : 'default'}
                className={
                  usingMocks
                    ? 'border-emerald-300 text-emerald-700'
                    : 'bg-emerald-600 hover:bg-emerald-600 text-white'
                }
              >
                MODE: {usingMocks ? 'MOCK' : 'LIVE'}
              </Badge>
              <span className="text-muted-foreground">
                API Base: {process.env.NEXT_PUBLIC_API_BASE_URL || 'local'}
              </span>
            </div>
            <span className="text-muted-foreground">
              © {new Date().getFullYear()} E-Arsip — Baznas Kabupaten Cianjur
            </span>
          </footer>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
