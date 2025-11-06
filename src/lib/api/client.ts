import { z } from 'zod'
import { toast } from 'sonner'
import { logClientError } from '@/lib/observability'
import { loadStoredToken, persistToken } from '@/lib/auth/token-storage'

const REQUEST_TIMEOUT_MS = 15_000
const GET_RETRY_DELAYS_MS = [300, 800]

type RequestOptions<T> = {
  schema?: z.ZodSchema<T>
  retries?: number
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public response?: unknown,
    public endpoint?: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

class ApiClient {
  private readonly baseURL = ''
  private readonly credentialsMode: RequestCredentials = 'same-origin'
  private token: string | null = null
  private readonly clientVersion =
    process.env.NEXT_PUBLIC_APP_VERSION || process.env.NEXT_PUBLIC_APP_NAME || 'e-arsip'

  constructor() {
    const storedToken = loadStoredToken()
    if (storedToken) {
      this.token = storedToken
    }
  }

  setToken(token: string | null) {
    this.token = token
    persistToken(token)
  }

  getToken(): string | null {
    return this.token
  }

  private buildHeaders(inputHeaders?: HeadersInit, body?: BodyInit | null) {
    const headers = new Headers(inputHeaders ?? {})
    headers.set('Accept', 'application/json')
    headers.set('X-Client-Version', this.clientVersion)
    headers.set('X-Request-ID', this.generateRequestId())

    const isFormData = typeof FormData !== 'undefined' && body instanceof FormData
    if (!headers.has('Content-Type') && !isFormData) {
      headers.set('Content-Type', 'application/json')
    }

    if (this.token && !headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${this.token}`)
    }

    return headers
  }

  private generateRequestId() {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
      return crypto.randomUUID()
    }
    return `req-${Date.now()}-${Math.random().toString(16).slice(2)}`
  }

  private async fetchWithTimeout(url: string, init: RequestInit) {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

    try {
      return await fetch(url, {
        ...init,
        signal: controller.signal,
      })
    } finally {
      clearTimeout(timeoutId)
    }
  }

  private shouldRetry(status: number, attempt: number, maxAttempts: number) {
    if (attempt >= maxAttempts - 1) {
      return false
    }

    if (status === 429) {
      return true
    }

    return status >= 500 && status < 600
  }

  private delayWithAttempt(attempt: number) {
    const baseDelay =
      GET_RETRY_DELAYS_MS[attempt] ??
      GET_RETRY_DELAYS_MS[GET_RETRY_DELAYS_MS.length - 1] *
        2 ** (attempt - GET_RETRY_DELAYS_MS.length + 1)
    return new Promise((resolve) => setTimeout(resolve, baseDelay))
  }

  private async delayFromResponse(response: Response, attempt: number) {
    const retryAfter = response.headers.get('Retry-After')
    if (retryAfter) {
      const seconds = Number(retryAfter)
      if (!Number.isNaN(seconds)) {
        await new Promise((resolve) => setTimeout(resolve, seconds * 1000))
        return
      }

      const retryDate = new Date(retryAfter)
      if (!Number.isNaN(retryDate.getTime())) {
        const delay = retryDate.getTime() - Date.now()
        if (delay > 0) {
          await new Promise((resolve) => setTimeout(resolve, delay))
          return
        }
      }
    }

    await this.delayWithAttempt(attempt)
  }

  private handleAuthErrors(status: number) {
    if (status === 401) {
      this.setToken(null)
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('api:unauthorized'))
        window.location.assign('/login')
      }
      return
    }

    if (status === 403) {
      if (typeof window !== 'undefined') {
        toast.error('Akses ditolak.')
      }
    }
  }

  private async parseResponse<T>(
    response: Response,
    endpoint: string,
    schema?: z.ZodSchema<T>
  ): Promise<T> {
    if (response.status === 204) {
      return undefined as T
    }

    const contentType = response.headers.get('Content-Type') || ''
    const isJson = contentType.includes('application/json')

    if (!isJson) {
      throw new ApiError(
        'Respons tidak dalam format JSON',
        response.status,
        undefined,
        endpoint
      )
    }

    const data = (await response.json()) as unknown
    if (!schema) {
      return data as T
    }

    return schema.parse(data)
  }

  private async buildError(
    response: Response,
    endpoint: string
  ): Promise<ApiError> {
    let errorPayload: unknown
    try {
      errorPayload = await response.clone().json()
    } catch {
      errorPayload = await response.text().catch(() => undefined)
    }

    const message =
      typeof errorPayload === 'object' &&
      errorPayload !== null &&
      'message' in errorPayload &&
      typeof (errorPayload as { message?: unknown }).message === 'string'
        ? (errorPayload as { message: string }).message
        : `HTTP ${response.status}`

    return new ApiError(message, response.status, errorPayload, endpoint)
  }

  private async request<T>(
    endpoint: string,
    init: RequestInit = {},
    options: RequestOptions<T> = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    const retries =
      options.retries ?? (init.method === 'GET' || !init.method ? 2 : 0)
    let lastError: unknown

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const headers = this.buildHeaders(init.headers ?? {}, init.body ?? null)
        const response = await this.fetchWithTimeout(url, {
          ...init,
          headers,
          credentials: this.credentialsMode,
        })

        if (!response.ok) {
          this.handleAuthErrors(response.status)
          const error = await this.buildError(response, endpoint)

          if (this.shouldRetry(response.status, attempt, retries + 1)) {
            await this.delayFromResponse(response, attempt)
            continue
          }

          if (response.status >= 500 && typeof window !== 'undefined') {
            logClientError(error, {
              tags: {
                status: String(response.status),
                endpoint,
              },
            })
          }

          throw error
        }

        return await this.parseResponse(response, endpoint, options.schema)
      } catch (error) {
        if (error instanceof ApiError) {
          lastError = error
          if (
            error.status > 0 &&
            this.shouldRetry(error.status, attempt, retries + 1)
          ) {
            await this.delayWithAttempt(attempt)
            continue
          }
          throw error
        }

        if (error instanceof DOMException && error.name === 'AbortError') {
          const timeoutError = new ApiError(
            'Permintaan ke server melebihi batas waktu',
            408,
            undefined,
            endpoint
          )
          lastError = timeoutError
          throw timeoutError
        }

        lastError = error
        throw new ApiError(
          error instanceof Error ? error.message : 'Network error',
          0,
          undefined,
          endpoint
        )
      }
    }

    if (lastError instanceof Error) {
      throw lastError
    }

    throw new ApiError('Unknown error', 0, lastError, endpoint)
  }

  async get<T>(endpoint: string, schema?: z.ZodSchema<T>): Promise<T> {
    return this.request(endpoint, { method: 'GET' }, { schema })
  }

  async post<T>(
    endpoint: string,
    data?: unknown,
    schema?: z.ZodSchema<T>,
    init: RequestInit = {}
  ): Promise<T> {
    return this.request(
      endpoint,
      {
        method: 'POST',
        body: data !== undefined && !(data instanceof FormData) ? JSON.stringify(data) : (data as BodyInit),
        ...init,
      },
      { schema }
    )
  }

  async put<T>(
    endpoint: string,
    data?: unknown,
    schema?: z.ZodSchema<T>
  ): Promise<T> {
    return this.request(
      endpoint,
      {
        method: 'PUT',
        body: data !== undefined ? JSON.stringify(data) : undefined,
      },
      { schema }
    )
  }

  async delete<T>(endpoint: string, schema?: z.ZodSchema<T>): Promise<T> {
    return this.request(
      endpoint,
      { method: 'DELETE' },
      { schema }
    )
  }

  async postFormData<T>(
    endpoint: string,
    formData: FormData,
    schema?: z.ZodSchema<T>
  ): Promise<T> {
    return this.request(
      endpoint,
      {
        method: 'POST',
        body: formData,
      },
      { schema }
    )
  }

  async download(endpoint: string, data: Record<string, unknown>) {
    const url = `${this.baseURL}${endpoint}`
    const headers = this.buildHeaders()
    headers.set('Accept', 'application/octet-stream')
    headers.delete('Content-Type')

    const response = await this.fetchWithTimeout(url, {
      method: 'POST',
      body: JSON.stringify(data),
      headers,
      credentials: 'include',
    })

    if (!response.ok) {
      this.handleAuthErrors(response.status)
      const error = await this.buildError(response, endpoint)
      if (response.status >= 500 && typeof window !== 'undefined') {
        logClientError(error, {
          tags: {
            status: String(response.status),
            endpoint,
          },
        })
      }
      throw error
    }

    return response.blob()
  }
}

export const apiClient = new ApiClient()
