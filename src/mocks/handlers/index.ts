import { http, HttpResponse, delay } from 'msw'
import {
  mockUser,
  mockCategories,
  allMockSuratMasuk,
  allMockSuratKeluar,
  mockDashboardMetrics,
} from '../data'
import type { SuratMasuk, SuratKeluar } from '@/lib/schemas'
import { relativeAuthHandlers } from './auth-relative'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.domain.tld/api/v1'
const MOCK_LATENCY = 300

// Helper function to simulate pagination
function paginate<T>(data: T[], page: number = 1, perPage: number = 20) {
  const start = (page - 1) * perPage
  const end = start + perPage
  const paginatedData = data.slice(start, end)
  
  return {
    data: paginatedData,
    meta: {
      current_page: page,
      per_page: perPage,
      total: data.length,
      last_page: Math.ceil(data.length / perPage),
      from: paginatedData.length > 0 ? start + 1 : null,
      to: paginatedData.length > 0 ? start + paginatedData.length : null,
    },
  }
}

// Helper function to filter data
function filterSuratMasuk(data: SuratMasuk[], params: URLSearchParams) {
  let filtered = [...data]
  
  const q = params.get('q')
  if (q) {
    filtered = filtered.filter(item => 
      item.subject.toLowerCase().includes(q.toLowerCase()) ||
      item.sender.toLowerCase().includes(q.toLowerCase()) ||
      item.no_letter.toLowerCase().includes(q.toLowerCase())
    )
  }
  
  const categoryId = params.get('category_id')
  if (categoryId) {
    filtered = filtered.filter(item => item.category_id === parseInt(categoryId))
  }
  
  const dateFrom = params.get('date_from')
  if (dateFrom) {
    filtered = filtered.filter(item => item.date_letter >= dateFrom)
  }
  
  const dateTo = params.get('date_to')
  if (dateTo) {
    filtered = filtered.filter(item => item.date_letter <= dateTo)
  }
  
  const district = params.get('district')
  if (district) {
    filtered = filtered.filter(item => item.district?.toLowerCase().includes(district.toLowerCase()))
  }
  
  const village = params.get('village')
  if (village) {
    filtered = filtered.filter(item => item.village?.toLowerCase().includes(village.toLowerCase()))
  }
  
  return filtered
}

function filterSuratKeluar(data: SuratKeluar[], params: URLSearchParams) {
  let filtered = [...data]
  
  const q = params.get('q')
  if (q) {
    filtered = filtered.filter(item => 
      item.subject.toLowerCase().includes(q.toLowerCase()) ||
      item.to_letter.toLowerCase().includes(q.toLowerCase()) ||
      item.no_letter.toLowerCase().includes(q.toLowerCase())
    )
  }
  
  const categoryId = params.get('category_id')
  if (categoryId) {
    filtered = filtered.filter(item => item.category_id === parseInt(categoryId))
  }
  
  const dateFrom = params.get('date_from')
  if (dateFrom) {
    filtered = filtered.filter(item => item.date_letter >= dateFrom)
  }
  
  const dateTo = params.get('date_to')
  if (dateTo) {
    filtered = filtered.filter(item => item.date_letter <= dateTo)
  }
  
  return filtered
}

export const handlers = [
  ...relativeAuthHandlers,
  // Auth endpoints - Full URL handlers
  http.post(`${API_BASE_URL}/auth/login`, async ({ request }) => {
    await delay(MOCK_LATENCY)
    
    const body = await request.json() as any
    
    if (body.email === 'admin@earsip.com' && body.password === 'password') {
      return HttpResponse.json({
        data: {
          user: mockUser,
          token: 'mock-jwt-token-12345',
        },
        message: 'Login berhasil',
      })
    }
    
    return HttpResponse.json(
      { message: 'Email atau password salah' },
      { status: 401 }
    )
  }),

  // Auth endpoints - Relative path handlers for direct requests
  http.post('/auth/login', async ({ request }) => {
    await delay(MOCK_LATENCY)
    
    const body = await request.json() as any
    
    if (body.email === 'admin@earsip.com' && body.password === 'password') {
      return HttpResponse.json({
        data: {
          user: mockUser,
          token: 'mock-jwt-token-12345',
        },
        message: 'Login berhasil',
      })
    }
    
    return HttpResponse.json(
      { message: 'Email atau password salah' },
      { status: 401 }
    )
  }),

  http.post(`${API_BASE_URL}/auth/logout`, async () => {
    await delay(MOCK_LATENCY)
    return HttpResponse.json({
      message: 'Logout berhasil',
    })
  }),

  http.post('/auth/logout', async () => {
    await delay(MOCK_LATENCY)
    return HttpResponse.json({
      message: 'Logout berhasil',
    })
  }),

  http.get(`${API_BASE_URL}/me`, async ({ request }) => {
    await delay(MOCK_LATENCY)
    
    const authHeader = request.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    return HttpResponse.json({
      data: mockUser,
    })
  }),

  http.get('/me', async ({ request }) => {
    await delay(MOCK_LATENCY)
    
    const authHeader = request.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    return HttpResponse.json({
      data: mockUser,
    })
  }),

  // Categories endpoint
  http.get(`${API_BASE_URL}/categories`, async () => {
    await delay(MOCK_LATENCY)
    return HttpResponse.json({
      data: mockCategories,
    })
  }),

  // Surat Masuk endpoints
  http.get(`${API_BASE_URL}/surat-masuk`, async ({ request }) => {
    await delay(MOCK_LATENCY)
    
    const url = new URL(request.url)
    const params = url.searchParams
    
    const filtered = filterSuratMasuk(allMockSuratMasuk, params)
    const page = parseInt(params.get('page') || '1')
    const perPage = parseInt(params.get('per_page') || '20')
    
    return HttpResponse.json(paginate(filtered, page, perPage))
  }),

  http.get(`${API_BASE_URL}/surat-masuk/:id`, async ({ params }) => {
    await delay(MOCK_LATENCY)
    
    const id = parseInt(params.id as string)
    const item = allMockSuratMasuk.find(s => s.id === id)
    
    if (!item) {
      return HttpResponse.json(
        { message: 'Surat masuk tidak ditemukan' },
        { status: 404 }
      )
    }
    
    return HttpResponse.json({
      data: item,
    })
  }),

  http.post(`${API_BASE_URL}/surat-masuk`, async ({ request }) => {
    await delay(MOCK_LATENCY)
    
    const body = await request.json() as any
    const newItem = {
      id: Math.max(...allMockSuratMasuk.map(s => s.id)) + 1,
      ...body,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    
    allMockSuratMasuk.push(newItem)
    
    return HttpResponse.json({
      data: newItem,
      message: 'Surat masuk berhasil ditambahkan',
    })
  }),

  http.put(`${API_BASE_URL}/surat-masuk/:id`, async ({ params, request }) => {
    await delay(MOCK_LATENCY)
    
    const id = parseInt(params.id as string)
    const body = await request.json() as any
    const index = allMockSuratMasuk.findIndex(s => s.id === id)
    
    if (index === -1) {
      return HttpResponse.json(
        { message: 'Surat masuk tidak ditemukan' },
        { status: 404 }
      )
    }
    
    allMockSuratMasuk[index] = {
      ...allMockSuratMasuk[index],
      ...body,
      updated_at: new Date().toISOString(),
    }
    
    return HttpResponse.json({
      data: allMockSuratMasuk[index],
      message: 'Surat masuk berhasil diperbarui',
    })
  }),

  http.delete(`${API_BASE_URL}/surat-masuk/:id`, async ({ params }) => {
    await delay(MOCK_LATENCY)
    
    const id = parseInt(params.id as string)
    const index = allMockSuratMasuk.findIndex(s => s.id === id)
    
    if (index === -1) {
      return HttpResponse.json(
        { message: 'Surat masuk tidak ditemukan' },
        { status: 404 }
      )
    }
    
    allMockSuratMasuk.splice(index, 1)
    
    return HttpResponse.json({
      message: 'Surat masuk berhasil dihapus',
    })
  }),

  // Surat Keluar endpoints
  http.get(`${API_BASE_URL}/surat-keluar`, async ({ request }) => {
    await delay(MOCK_LATENCY)
    
    const url = new URL(request.url)
    const params = url.searchParams
    
    const filtered = filterSuratKeluar(allMockSuratKeluar, params)
    const page = parseInt(params.get('page') || '1')
    const perPage = parseInt(params.get('per_page') || '20')
    
    return HttpResponse.json(paginate(filtered, page, perPage))
  }),

  http.get(`${API_BASE_URL}/surat-keluar/:id`, async ({ params }) => {
    await delay(MOCK_LATENCY)
    
    const id = parseInt(params.id as string)
    const item = allMockSuratKeluar.find(s => s.id === id)
    
    if (!item) {
      return HttpResponse.json(
        { message: 'Surat keluar tidak ditemukan' },
        { status: 404 }
      )
    }
    
    return HttpResponse.json({
      data: item,
    })
  }),

  http.post(`${API_BASE_URL}/surat-keluar`, async ({ request }) => {
    await delay(MOCK_LATENCY)
    
    const body = await request.json() as any
    const newItem = {
      id: Math.max(...allMockSuratKeluar.map(s => s.id)) + 1,
      ...body,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    
    allMockSuratKeluar.push(newItem)
    
    return HttpResponse.json({
      data: newItem,
      message: 'Surat keluar berhasil ditambahkan',
    })
  }),

  http.put(`${API_BASE_URL}/surat-keluar/:id`, async ({ params, request }) => {
    await delay(MOCK_LATENCY)
    
    const id = parseInt(params.id as string)
    const body = await request.json() as any
    const index = allMockSuratKeluar.findIndex(s => s.id === id)
    
    if (index === -1) {
      return HttpResponse.json(
        { message: 'Surat keluar tidak ditemukan' },
        { status: 404 }
      )
    }
    
    allMockSuratKeluar[index] = {
      ...allMockSuratKeluar[index],
      ...body,
      updated_at: new Date().toISOString(),
    }
    
    return HttpResponse.json({
      data: allMockSuratKeluar[index],
      message: 'Surat keluar berhasil diperbarui',
    })
  }),

  http.delete(`${API_BASE_URL}/surat-keluar/:id`, async ({ params }) => {
    await delay(MOCK_LATENCY)
    
    const id = parseInt(params.id as string)
    const index = allMockSuratKeluar.findIndex(s => s.id === id)
    
    if (index === -1) {
      return HttpResponse.json(
        { message: 'Surat keluar tidak ditemukan' },
        { status: 404 }
      )
    }
    
    allMockSuratKeluar.splice(index, 1)
    
    return HttpResponse.json({
      message: 'Surat keluar berhasil dihapus',
    })
  }),

  // Dashboard endpoint
  http.get(`${API_BASE_URL}/dashboard/metrics`, async () => {
    await delay(MOCK_LATENCY)
    return HttpResponse.json({
      data: mockDashboardMetrics,
    })
  }),

  // Reports endpoints
  http.get(`${API_BASE_URL}/reports/summary`, async () => {
    await delay(MOCK_LATENCY)
    return HttpResponse.json({
      data: {
        summary: 'Mock report summary data',
        charts: mockDashboardMetrics.chart_data,
      },
    })
  }),

  http.post(`${API_BASE_URL}/reports/export`, async () => {
    await delay(MOCK_LATENCY)
    
    // Return a mock PDF blob
    const pdfContent = 'Mock PDF content for export'
    return HttpResponse.arrayBuffer(
      new TextEncoder().encode(pdfContent).buffer,
      {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'attachment; filename="report.pdf"',
        },
      }
    )
  }),
]
