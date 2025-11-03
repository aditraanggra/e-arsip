type SentryGlobal = {
  captureException: (
    error: unknown,
    context?: { tags?: Record<string, string>; extra?: Record<string, unknown> }
  ) => void
} | null

const getSentry = (): SentryGlobal => {
  if (typeof window === 'undefined') {
    return null
  }

  const candidate = (window as unknown as { Sentry?: SentryGlobal }).Sentry
  return candidate ?? null
}

type LogOptions = {
  tags?: Record<string, string | undefined>
  extra?: Record<string, unknown>
}

export function logClientError(error: unknown, options: LogOptions = {}) {
  const sentry = getSentry()
  const defaultTags = {
    api_base: process.env.NEXT_PUBLIC_API_BASE_URL ?? 'mock',
    route:
      typeof window !== 'undefined' ? window.location.pathname : 'unknown-route',
    user_role: options.tags?.user_role ?? 'unknown',
    ...options.tags,
  }

  if (sentry) {
    sentry.captureException(error, {
      tags: Object.fromEntries(
        Object.entries(defaultTags).filter(
          ([, value]) => value !== undefined && value !== null
        )
      ) as Record<string, string>,
      extra: options.extra,
    })
    return
  }

  if (process.env.NODE_ENV !== 'production') {
    console.error('Captured client error', error, options)
  }
}
