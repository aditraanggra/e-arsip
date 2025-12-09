'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { AppSidebar } from '@/components/layout/app-sidebar'
import { AppHeader } from '@/components/layout/app-header'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { Badge } from '@/components/ui/badge'

const usingMocks = process.env.NEXT_PUBLIC_USE_MOCKS === 'true'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login')
    }
  }, [isLoading, isAuthenticated, router])

  if (isLoading) {
    return (
      <div className='flex items-center justify-center min-h-screen bg-background'>
        <div className='flex flex-col items-center gap-4'>
          <div className='h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent' />
          <p className='text-sm text-muted-foreground'>Memuat...</p>
        </div>
      </div>
    )
  }

  if (!isLoading && !isAuthenticated) {
    return null
  }

  return (
    <SidebarProvider>
      <div className='flex min-h-screen w-full'>
        <AppSidebar />
        <SidebarInset className='bg-background'>
          <AppHeader />
          <main className='flex w-full flex-1 flex-col p-4 sm:p-6 xl:p-8 min-w-0'>
            {children}
          </main>
          <footer className='flex w-full flex-col gap-2 border-t border-border/50 bg-card/50 px-4 py-3 text-xs sm:flex-row sm:items-center sm:justify-between sm:px-6 xl:px-8'>
            <div className='flex items-center gap-2'>
              <Badge
                variant={usingMocks ? 'outline' : 'default'}
                className={
                  usingMocks
                    ? 'border-primary/30 text-primary rounded-lg'
                    : 'bg-primary hover:bg-primary text-primary-foreground rounded-lg'
                }
              >
                {usingMocks ? 'MOCK' : 'LIVE'}
              </Badge>
              <span className='text-muted-foreground'>
                {process.env.NEXT_PUBLIC_API_BASE_URL || 'local'}
              </span>
            </div>
            <span className='text-muted-foreground'>
              © {new Date().getFullYear()} E-Arsip — Baznas Kabupaten Cianjur
            </span>
          </footer>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
