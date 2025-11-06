import { z } from 'zod'
import { apiClient } from './client'
import {
  userSchema,
  categorySchema,
  suratMasukApiSchema,
  suratKeluarApiSchema,
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
import {
  mapSuratMasukFromApi,
  mapSuratMasukPayload,
  mapSuratKeluarFromApi,
  mapSuratKeluarPayload,
  parseApiResponse,
  parseDashboardMetrics,
  parsePaginatedSuratKeluar,
  parsePaginatedSuratMasuk,
} from './transformers'

const useLocalMocks = process.env.NEXT_PUBLIC_USE_MOCKS === 'true'
const apiPrefix = '/api/v1'

const authEndpoints = {
  login:
    process.env.NEXT_PUBLIC_AUTH_LOGIN_ENDPOINT ??
    `${apiPrefix}/login`,
  logout:
    process.env.NEXT_PUBLIC_AUTH_LOGOUT_ENDPOINT ??
    `${apiPrefix}/logout`,
  me: process.env.NEXT_PUBLIC_AUTH_ME_ENDPOINT ?? `${apiPrefix}/user`,
}

const loginPayloadSchema = z
  .object({
    user: userSchema,
    token: z.string().optional(),
    access_token: z.string().optional(),
    token_type: z.string().optional(),
    expires_in: z.number().optional(),
  })
  .refine((payload) => !!payload.token || !!payload.access_token, {
    message: 'Token autentikasi tidak ditemukan pada respons login',
  })
  .passthrough()

// Auth services
export const authService = {
  async login(credentials: LoginData): Promise<{ user: User; token: string }> {
    if (useLocalMocks) {
      console.warn(
        '[auth] Using local MSW mock for login. Set NEXT_PUBLIC_USE_MOCKS=false to hit the live API.'
      )
      const response = await localApi.auth.login(credentials)

      apiClient.setToken(response.token)
      return response
    }

    if (process.env.NODE_ENV !== 'production') {
      console.info(
        `[auth] Forwarding login to ${authEndpoints.login} (base: ${process.env.NEXT_PUBLIC_API_BASE_URL ?? 'relative'
        })`
      )
    }

    const raw = await apiClient.post(authEndpoints.login, credentials)
    const parsed = parseApiResponse(loginPayloadSchema, raw)

    const rawToken = parsed.token ?? parsed.access_token ?? ''
    const token =
      rawToken.startsWith('Bearer ') ? rawToken.split(' ').at(-1) ?? '' : rawToken

    if (!token) {
      throw new Error('Token autentikasi tidak ditemukan pada respons API')
    }

    apiClient.setToken(token)

    return {
      user: parsed.user,
      token,
    }
  },

  async logout(): Promise<void> {
    if (useLocalMocks) {
      await localApi.auth.logout()
      apiClient.setToken(null)
      return
    }

    await apiClient.post(authEndpoints.logout)
    apiClient.setToken(null)
  },

  async me(): Promise<User> {
    if (useLocalMocks) {
      return localApi.auth.me()
    }

    const raw = await apiClient.get(authEndpoints.me)
    return parseApiResponse(userSchema, raw)
  },
}

// Categories service
export const categoriesService = {
  async getAll(): Promise<Category[]> {
    if (useLocalMocks) {
      return localApi.categories.getAll()
    }

    const raw = await apiClient.get(`${apiPrefix}/categories`)
    return parseApiResponse(categorySchema.array(), raw)
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

    const {
      q,
      page,
      per_page,
      category_id,
      sort,
      date_from,
      date_to,
      district,
      village,
      ...rest
    } = params

    const keyword = q ?? (rest as { search?: string }).search

    if (keyword) searchParams.set('q', keyword)
    if (typeof category_id === 'number') searchParams.set('category_id', String(category_id))
    if (date_from) searchParams.set('date_from', date_from)
    if (date_to) searchParams.set('date_to', date_to)
    if (district) searchParams.set('district', district)
    if (village) searchParams.set('village', village)
    if (sort) searchParams.set('sort', sort)
    if (page) searchParams.set('page', String(page))
    if (per_page) searchParams.set('per_page', String(per_page))

    const queryString = searchParams.toString()
    const endpoint = `${apiPrefix}/surat-masuk${queryString ? `?${queryString}` : ''}`

    const raw = await apiClient.get(endpoint)
    return parsePaginatedSuratMasuk(raw)
  },

  async getById(id: number): Promise<SuratMasuk> {
    if (useLocalMocks) {
      const item = await localApi.suratMasuk.getById(id)
      if (!item) {
        throw new Error('Surat masuk tidak ditemukan')
      }
      return item
    }

    const raw = await apiClient.get(`${apiPrefix}/surat-masuk/${id}`)
    const parsed = parseApiResponse(suratMasukApiSchema, raw)
    return mapSuratMasukFromApi(parsed)
  },

  async create(data: SuratMasukCreate): Promise<SuratMasuk> {
    if (useLocalMocks) {
      return localApi.suratMasuk.create(data)
    }

    const payload = mapSuratMasukPayload(data)
    const raw = await apiClient.post(`${apiPrefix}/surat-masuk`, payload)
    const parsed = parseApiResponse(suratMasukApiSchema, raw)
    return mapSuratMasukFromApi(parsed)
  },

  async update(id: number, data: Partial<SuratMasukCreate>): Promise<SuratMasuk> {
    if (useLocalMocks) {
      return localApi.suratMasuk.update(id, data)
    }

    const payload = mapSuratMasukPayload(data)
    const raw = await apiClient.put(`${apiPrefix}/surat-masuk/${id}`, payload)
    const parsed = parseApiResponse(suratMasukApiSchema, raw)
    return mapSuratMasukFromApi(parsed)
  },

  async delete(id: number): Promise<void> {
    if (useLocalMocks) {
      await localApi.suratMasuk.delete(id)
      return
    }

    await apiClient.delete(`${apiPrefix}/surat-masuk/${id}`)
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

    const {
      q,
      page,
      per_page,
      category_id,
      sort,
      date_from,
      date_to,
      ...rest
    } = params

    const keyword = q ?? (rest as { search?: string }).search

    if (keyword) searchParams.set('q', keyword)
    if (typeof category_id === 'number') searchParams.set('category_id', String(category_id))
    if (date_from) searchParams.set('date_from', date_from)
    if (date_to) searchParams.set('date_to', date_to)
    if (sort) searchParams.set('sort', sort)
    if (page) searchParams.set('page', String(page))
    if (per_page) searchParams.set('per_page', String(per_page))

    const queryString = searchParams.toString()
    const endpoint = `${apiPrefix}/surat-keluar${queryString ? `?${queryString}` : ''}`

    const raw = await apiClient.get(endpoint)
    return parsePaginatedSuratKeluar(raw)
  },

  async getById(id: number): Promise<SuratKeluar> {
    if (useLocalMocks) {
      const item = await localApi.suratKeluar.getById(id)
      if (!item) {
        throw new Error('Surat keluar tidak ditemukan')
      }
      return item
    }

    const raw = await apiClient.get(`${apiPrefix}/surat-keluar/${id}`)
    const parsed = parseApiResponse(suratKeluarApiSchema, raw)
    return mapSuratKeluarFromApi(parsed)
  },

  async create(data: SuratKeluarCreate): Promise<SuratKeluar> {
    if (useLocalMocks) {
      return localApi.suratKeluar.create(data)
    }

    const payload = mapSuratKeluarPayload(data)
    const raw = await apiClient.post(`${apiPrefix}/surat-keluar`, payload)
    const parsed = parseApiResponse(suratKeluarApiSchema, raw)
    return mapSuratKeluarFromApi(parsed)
  },

  async update(id: number, data: Partial<SuratKeluarCreate>): Promise<SuratKeluar> {
    if (useLocalMocks) {
      return localApi.suratKeluar.update(id, data)
    }

    const payload = mapSuratKeluarPayload(data)
    const raw = await apiClient.put(`${apiPrefix}/surat-keluar/${id}`, payload)
    const parsed = parseApiResponse(suratKeluarApiSchema, raw)
    return mapSuratKeluarFromApi(parsed)
  },

  async delete(id: number): Promise<void> {
    if (useLocalMocks) {
      await localApi.suratKeluar.delete(id)
      return
    }

    await apiClient.delete(`${apiPrefix}/surat-keluar/${id}`)
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
    const endpoint = `${apiPrefix}/dashboard/metrics${queryString ? `?${queryString}` : ''}`

    const raw = await apiClient.get(endpoint)
    return parseDashboardMetrics(raw)
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
    const endpoint = `${apiPrefix}/reports/summary${queryString ? `?${queryString}` : ''}`

    const raw = await apiClient.get(endpoint)
    return parseApiResponse(reportsSummarySchema, raw)
  },

  async exportReport(data: Record<string, unknown>): Promise<Blob> {
    if (useLocalMocks) {
      return localApi.reports.exportReport()
    }

    return apiClient.download(`${apiPrefix}/reports/export`, data)
  },
}
