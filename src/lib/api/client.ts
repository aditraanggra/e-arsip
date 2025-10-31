import { z } from 'zod'

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public response?: unknown
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

class ApiClient {
  private baseURL: string
  private token: string | null = null

  constructor() {
    const useMocks = process.env.NEXT_PUBLIC_USE_MOCKS !== 'false'
    // When mocks are enabled, use same-origin requests so MSW can intercept.
    this.baseURL = useMocks ? '' : (process.env.NEXT_PUBLIC_API_BASE_URL || '')
    
    // Initialize token from localStorage if available
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token')
    }
  }

  setToken(token: string | null) {
    this.token = token
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('auth_token', token)
      } else {
        localStorage.removeItem('auth_token')
      }
    }
  }

  getToken(): string | null {
    return this.token
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    schema?: z.ZodSchema<T>
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    }

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`
    }

    const config: RequestInit = {
      ...options,
      headers,
    }

    try {
      const response = await fetch(url, config)
      
      if (!response.ok) {
        if (response.status === 401) {
          // Clear token and redirect to login
          this.setToken(null)
          if (typeof window !== 'undefined') {
            window.location.href = '/login'
          }
        }
        
        const errorData = (await response.json().catch(() => undefined)) as unknown
        const errorMessage =
          errorData &&
          typeof errorData === 'object' &&
          'message' in errorData &&
          typeof (errorData as { message?: unknown }).message === 'string'
            ? (errorData as { message: string }).message
            : undefined
        throw new ApiError(
          errorMessage || `HTTP ${response.status}`,
          response.status,
          errorData
        )
      }

      const data = (await response.json()) as unknown
      
      if (schema) {
        return schema.parse(data)
      }
      
      return data as T
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }
      
      // Network or parsing error
      throw new ApiError(
        error instanceof Error ? error.message : 'Network error',
        0
      )
    }
  }

  // GET request with retry logic for light operations
  async get<T>(endpoint: string, schema?: z.ZodSchema<T>, retries = 1): Promise<T> {
    let lastError: unknown
    
    for (let i = 0; i <= retries; i++) {
      try {
        return await this.request(endpoint, { method: 'GET' }, schema)
      } catch (error) {
        lastError = error
        if (i < retries && error instanceof ApiError && error.status >= 500) {
          // Only retry on server errors
          await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)))
          continue
        }
        break
      }
    }
    
    if (lastError instanceof Error) {
      throw lastError
    }
    throw new ApiError('Unknown error', 0, lastError)
  }

  async post<T>(
    endpoint: string,
    data?: unknown,
    schema?: z.ZodSchema<T>,
    options: RequestInit = {}
  ): Promise<T> {
    return this.request(
      endpoint,
      {
        method: 'POST',
        body: data ? JSON.stringify(data) : undefined,
        ...options,
      },
      schema
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
        body: data ? JSON.stringify(data) : undefined,
      },
      schema
    )
  }

  async delete<T>(endpoint: string, schema?: z.ZodSchema<T>): Promise<T> {
    return this.request(endpoint, { method: 'DELETE' }, schema)
  }

  // Multipart form data for file uploads
  async postFormData<T>(
    endpoint: string,
    formData: FormData,
    schema?: z.ZodSchema<T>
  ): Promise<T> {
    const headers: HeadersInit = {}
    
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`
    }

    return this.request(
      endpoint,
      {
        method: 'POST',
        body: formData,
        headers,
      },
      schema
    )
  }
}

// Export singleton instance
export const apiClient = new ApiClient()
export { ApiError }
