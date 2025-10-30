import { apiClient } from './client'
import {
  loginSchema,
  userSchema,
  categorySchema,
  suratMasukSchema,
  suratKeluarSchema,
  dashboardMetricsSchema,
  paginatedResponseSchema,
  apiResponseSchema,
  type LoginData,
  type User,
  type Category,
  type SuratMasuk,
  type SuratMasukCreate,
  type SuratKeluar,
  type SuratKeluarCreate,
  type PaginatedResponse,
  type ApiResponse,
  type DashboardMetrics,
} from '../schemas'

// Auth services
export const authService = {
  async login(credentials: LoginData): Promise<{ user: User; token: string }> {
    const response = await apiClient.post(
      '/auth/login',
      credentials,
      apiResponseSchema(
        loginSchema.extend({
          user: userSchema,
          token: loginSchema.shape.password, // reuse string schema
        })
      )
    )
    
    // Set token in client
    apiClient.setToken(response.data.token)
    
    return {
      user: response.data.user,
      token: response.data.token,
    }
  },

  async logout(): Promise<void> {
    await apiClient.post('/auth/logout')
    apiClient.setToken(null)
  },

  async me(): Promise<User> {
    const response = await apiClient.get('/me', apiResponseSchema(userSchema))
    return response.data
  },
}

// Categories service
export const categoriesService = {
  async getAll(): Promise<Category[]> {
    const response = await apiClient.get(
      '/categories',
      apiResponseSchema(categorySchema.array())
    )
    return response.data
  },
}

// Surat Masuk services
export const suratMasukService = {
  async getList(params: {
    q?: string
    category_id?: number
    date_from?: string
    date_to?: string
    district?: string
    village?: string
    page?: number
    per_page?: number
    sort?: string
  } = {}): Promise<PaginatedResponse<SuratMasuk>> {
    const searchParams = new URLSearchParams()
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        searchParams.append(key, value.toString())
      }
    })
    
    const queryString = searchParams.toString()
    const endpoint = `/surat-masuk${queryString ? `?${queryString}` : ''}`
    
    return apiClient.get(endpoint, paginatedResponseSchema(suratMasukSchema))
  },

  async getById(id: number): Promise<SuratMasuk> {
    const response = await apiClient.get(
      `/surat-masuk/${id}`,
      apiResponseSchema(suratMasukSchema)
    )
    return response.data
  },

  async create(data: SuratMasukCreate): Promise<SuratMasuk> {
    const response = await apiClient.post(
      '/surat-masuk',
      data,
      apiResponseSchema(suratMasukSchema)
    )
    return response.data
  },

  async update(id: number, data: Partial<SuratMasukCreate>): Promise<SuratMasuk> {
    const response = await apiClient.put(
      `/surat-masuk/${id}`,
      data,
      apiResponseSchema(suratMasukSchema)
    )
    return response.data
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/surat-masuk/${id}`)
  },
}

// Surat Keluar services
export const suratKeluarService = {
  async getList(params: {
    q?: string
    category_id?: number
    date_from?: string
    date_to?: string
    page?: number
    per_page?: number
    sort?: string
  } = {}): Promise<PaginatedResponse<SuratKeluar>> {
    const searchParams = new URLSearchParams()
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        searchParams.append(key, value.toString())
      }
    })
    
    const queryString = searchParams.toString()
    const endpoint = `/surat-keluar${queryString ? `?${queryString}` : ''}`
    
    return apiClient.get(endpoint, paginatedResponseSchema(suratKeluarSchema))
  },

  async getById(id: number): Promise<SuratKeluar> {
    const response = await apiClient.get(
      `/surat-keluar/${id}`,
      apiResponseSchema(suratKeluarSchema)
    )
    return response.data
  },

  async create(data: SuratKeluarCreate): Promise<SuratKeluar> {
    const response = await apiClient.post(
      '/surat-keluar',
      data,
      apiResponseSchema(suratKeluarSchema)
    )
    return response.data
  },

  async update(id: number, data: Partial<SuratKeluarCreate>): Promise<SuratKeluar> {
    const response = await apiClient.put(
      `/surat-keluar/${id}`,
      data,
      apiResponseSchema(suratKeluarSchema)
    )
    return response.data
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/surat-keluar/${id}`)
  },
}

// Dashboard service
export const dashboardService = {
  async getMetrics(params: {
    scope?: string
    unit_id?: number
    from?: string
    to?: string
  } = {}): Promise<DashboardMetrics> {
    const searchParams = new URLSearchParams()
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        searchParams.append(key, value.toString())
      }
    })
    
    const queryString = searchParams.toString()
    const endpoint = `/dashboard/metrics${queryString ? `?${queryString}` : ''}`
    
    const response = await apiClient.get(
      endpoint,
      apiResponseSchema(dashboardMetricsSchema)
    )
    return response.data
  },
}

// Reports service
export const reportsService = {
  async getSummary(params: {
    entity?: string
    period?: string
    date?: string
    month?: string
    year?: string
    category_id?: number
    unit_id?: number
    district?: string
    village?: string
  } = {}): Promise<any> {
    const searchParams = new URLSearchParams()
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        searchParams.append(key, value.toString())
      }
    })
    
    const queryString = searchParams.toString()
    const endpoint = `/reports/summary${queryString ? `?${queryString}` : ''}`
    
    return apiClient.get(endpoint)
  },

  async exportReport(data: any): Promise<Blob> {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/reports/export`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiClient.getToken()}`,
      },
      body: JSON.stringify(data),
    })
    
    if (!response.ok) {
      throw new Error('Export failed')
    }
    
    return response.blob()
  },
}
