const STORAGE_KEY = 'earsip.auth.token'

const isBrowser = () =>
  typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'

const safeLocalStorage = () => {
  if (!isBrowser()) return null
  try {
    return window.localStorage
  } catch {
    return null
  }
}

export function loadStoredToken(): string | null {
  const storage = safeLocalStorage()
  if (!storage) return null

  try {
    return storage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

export function persistToken(token: string | null) {
  const storage = safeLocalStorage()
  if (!storage) return

  try {
    if (token) {
      storage.setItem(STORAGE_KEY, token)
    } else {
      storage.removeItem(STORAGE_KEY)
    }
  } catch {
    // Ignore storage quota errors silently
  }
}

export function clearStoredToken() {
  persistToken(null)
}
