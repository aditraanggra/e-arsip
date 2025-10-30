'use client'

import { useEffect, useState } from 'react'

export function MSWProvider({ children }: { children: React.ReactNode }) {
  const [mswReady, setMswReady] = useState(false)

  useEffect(() => {
    let cancelled = false
    let timer: number | undefined

    const initMSW = async () => {
      try {
        if (
          typeof window !== 'undefined' &&
          (process.env.NEXT_PUBLIC_USE_MOCKS === 'true' || process.env.NODE_ENV === 'development')
        ) {
          // Prevent blocking UI for too long if MSW hangs
          timer = window.setTimeout(() => {
            if (!cancelled) setMswReady(true)
          }, 800)

          const { worker } = await import('@/mocks/browser')
          await worker.start({
            onUnhandledRequest: 'bypass',
            serviceWorker: { url: '/mockServiceWorker.js' },
          })
          console.log('🔶 MSW enabled')
        }
      } catch (error) {
        console.error('MSW init failed:', error)
      } finally {
        if (!cancelled) {
          if (timer) window.clearTimeout(timer)
          setMswReady(true)
        }
      }
    }

    initMSW()

    return () => {
      cancelled = true
      if (timer) window.clearTimeout(timer)
    }
  }, [])

  if (!mswReady) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return <>{children}</>
}
