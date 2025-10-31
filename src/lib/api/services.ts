import { apiClient } from './client'
import { z } from 'zod'
import {
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
  type DashboardMetrics,
  reportsSummarySchema,
  type ReportsSummary,
} from '../schemas'
import { localApi } from '../mocks/local-api'

const useLocalMocks = process.env.NEXT_PUBLIC_USE_MOCKS !== 'false'

// Auth services
export const authService = {
  async login(credentials: LoginData): Promise<{ user: User; token: string }> {
    if (useLocalMocks) {
      const response = await localApi.auth.login(credentials)

      apiClient.setToken(response.token)
      return response
    }

    const loginResponseSchema = apiResponseSchema(
      z.object({
        user: userSchema,
        token: z.string(),
      })
    )

    const response = await apiClient.post(
      '/auth/login',
      credentials,
      loginResponseSchema
    )
    
    // Set token in client
    apiClient.setToken(response.data.token)
    
    return {
      user: response.data.user,
      token: response.data.token,
    }
  },

  async logout(): Promise<void> {
    if (useLocalMocks) {
      await localApi.auth.logout()
      apiClient.setToken(null)
      return
    }

    await apiClient.post('/auth/logout')
    apiClient.setToken(null)
  },

  async me(): Promise<User> {
    if (useLocalMocks) {
      return localApi.auth.me()
    }

    const response = await apiClient.get('/me', apiResponseSchema(userSchema))
    return response.data
  },
}

// Categories service
export const categoriesService = {
  async getAll(): Promise<Category[]> {
    if (useLocalMocks) {
      return localApi.categories.getAll()
    }

    const response = await apiClient.get(
      '/categories',
      apiResponseSchema(categorySchema.array())
    )
    return response.data
  },
}

// Surat Masuk services
export const suratMasukService = {
  async getAll(params: {
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
    if (useLocalMocks) {
      return localApi.suratMasuk.getList(params)
    }

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
    if (useLocalMocks) {
      const item = await localApi.suratMasuk.getById(id)
      if (!item) {
        throw new Error('Surat masuk tidak ditemukan')
      }
      return item
    }

    const response = await apiClient.get(
      `/surat-masuk/${id}`,
      apiResponseSchema(suratMasukSchema)
    )
    return response.data
  },

  async create(data: SuratMasukCreate): Promise<SuratMasuk> {
    if (useLocalMocks) {
      return localApi.suratMasuk.create(data)
    }

    const response = await apiClient.post(
      '/surat-masuk',
      data,
      apiResponseSchema(suratMasukSchema)
    )
    return response.data
  },

  async update(id: number, data: Partial<SuratMasukCreate>): Promise<SuratMasuk> {
    if (useLocalMocks) {
      return localApi.suratMasuk.update(id, data)
    }

    const response = await apiClient.put(
      `/surat-masuk/${id}`,
      data,
      apiResponseSchema(suratMasukSchema)
    )
    return response.data
  },

  async delete(id: number): Promise<void> {
    if (useLocalMocks) {
      await localApi.suratMasuk.delete(id)
      return
    }

    await apiClient.delete(`/surat-masuk/${id}`)
  },
}

// Surat Keluar services
export const suratKeluarService = {
  async getAll(params: {
    q?: string
    category_id?: number
    date_from?: string
    date_to?: string
    page?: number
    per_page?: number
    sort?: string
  } = {}): Promise<PaginatedResponse<SuratKeluar>> {
    if (useLocalMocks) {
      return localApi.suratKeluar.getList(params)
    }

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
    if (useLocalMocks) {
      const item = await localApi.suratKeluar.getById(id)
      if (!item) {
        throw new Error('Surat keluar tidak ditemukan')
      }
      return item
    }

    const response = await apiClient.get(
      `/surat-keluar/${id}`,
      apiResponseSchema(suratKeluarSchema)
    )
    return response.data
  },

  async create(data: SuratKeluarCreate): Promise<SuratKeluar> {
    if (useLocalMocks) {
      return localApi.suratKeluar.create(data)
    }

    const response = await apiClient.post(
      '/surat-keluar',
      data,
      apiResponseSchema(suratKeluarSchema)
    )
    return response.data
  },

  async update(id: number, data: Partial<SuratKeluarCreate>): Promise<SuratKeluar> {
    if (useLocalMocks) {
      return localApi.suratKeluar.update(id, data)
    }

    const response = await apiClient.put(
      `/surat-keluar/${id}`,
      data,
      apiResponseSchema(suratKeluarSchema)
    )
    return response.data
  },

  async delete(id: number): Promise<void> {
    if (useLocalMocks) {
      await localApi.suratKeluar.delete(id)
      return
    }

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
    if (useLocalMocks) {
      return localApi.dashboard.getMetrics()
    }

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
  } = {}): Promise<ReportsSummary> {
    if (useLocalMocks) {
      return localApi.reports.getSummary(params)
    }

    const searchParams = new URLSearchParams()
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        searchParams.append(key, value.toString())
      }
    })
    
    const queryString = searchParams.toString()
    const endpoint = `/reports/summary${queryString ? `?${queryString}` : ''}`
    
    const response = await apiClient.get(
      endpoint,
      apiResponseSchema(reportsSummarySchema)
    )
    return response.data
  },

  async exportReport(data: Record<string, unknown>): Promise<Blob> {
    if (useLocalMocks) {
      return localApi.reports.exportReport()
    }

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
