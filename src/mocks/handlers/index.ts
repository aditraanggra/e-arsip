import { http, HttpResponse, delay } from 'msw'
import {
  mockUser,
  mockCategories,
  allMockSuratMasuk,
  allMockSuratKeluar,
  mockDashboardMetrics,
} from '../data'
import type { SuratMasuk, SuratKeluar, SuratMasukCreate, SuratKeluarCreate } from '@/lib/schemas'
import { relativeAuthHandlers } from './auth-relative'

type DocumentSearchResult =
  | (SuratMasuk & { document_type: 'incoming' })
  | (SuratKeluar & { document_type: 'outgoing' })

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
  
  const q = params.get('q') || params.get('search')
  if (q) {
    filtered = filtered.filter(item => 
      item.perihal.toLowerCase().includes(q.toLowerCase()) ||
      (item.pengirim ?? '').toLowerCase().includes(q.toLowerCase()) ||
      item.nomor_surat.toLowerCase().includes(q.toLowerCase()) ||
      (item.no_agenda ?? '').toLowerCase().includes(q.toLowerCase())
    )
  }
  
  const categoryId = params.get('category_id')
  if (categoryId) {
    filtered = filtered.filter(item => item.category_id === parseInt(categoryId))
  }
  
  const dateFrom = params.get('date_from')
  if (dateFrom) {
    filtered = filtered.filter(item => {
      const itemDate = item.tanggal.slice(0, 10)
      return itemDate >= dateFrom
    })
  }
  
  const dateTo = params.get('date_to')
  if (dateTo) {
    filtered = filtered.filter(item => {
      const itemDate = item.tanggal.slice(0, 10)
      return itemDate <= dateTo
    })
  }

  const district = params.get('district')
  if (district) {
    filtered = filtered.filter(
      item => (item.district ?? '').toLowerCase() === district.toLowerCase()
    )
  }

  const village = params.get('village')
  if (village) {
    filtered = filtered.filter(
      item => (item.village ?? '').toLowerCase() === village.toLowerCase()
    )
  }
  
  return filtered
}

function filterSuratKeluar(data: SuratKeluar[], params: URLSearchParams) {
  let filtered = [...data]
  
  const q = params.get('q') || params.get('search')
  if (q) {
    filtered = filtered.filter(item => 
      item.perihal.toLowerCase().includes(q.toLowerCase()) ||
      (item.tujuan ?? '').toLowerCase().includes(q.toLowerCase()) ||
      item.nomor_surat.toLowerCase().includes(q.toLowerCase())
    )
  }
  
  const categoryId = params.get('category_id')
  if (categoryId) {
    filtered = filtered.filter(item => item.category_id === parseInt(categoryId))
  }
  
  const dateFrom = params.get('date_from')
  if (dateFrom) {
    filtered = filtered.filter(item => {
      const itemDate = item.tanggal.slice(0, 10)
      return itemDate >= dateFrom
    })
  }
  
  const dateTo = params.get('date_to')
  if (dateTo) {
    filtered = filtered.filter(item => {
      const itemDate = item.tanggal.slice(0, 10)
      return itemDate <= dateTo
    })
  }
  
  return filtered
}

export const handlers = [
  ...relativeAuthHandlers,
  // Auth endpoints - Full URL handlers
  http.post(`${API_BASE_URL}/login`, async ({ request }) => {
    await delay(MOCK_LATENCY)
    
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>
    const email = typeof body['email'] === 'string' ? (body['email'] as string) : ''
    const password = typeof body['password'] === 'string' ? (body['password'] as string) : ''
    
    if (
      (email === 'admin@earsip.com' && password === 'password') ||
      (email === 'admin@example.com' && password === 'password123')
    ) {
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
  http.post('/login', async ({ request }) => {
    await delay(MOCK_LATENCY)
    
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>
    const email = typeof body['email'] === 'string' ? (body['email'] as string) : ''
    const password = typeof body['password'] === 'string' ? (body['password'] as string) : ''
    
    if (
      (email === 'admin@earsip.com' && password === 'password') ||
      (email === 'admin@example.com' && password === 'password123')
    ) {
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

  http.post('/api/auth/login', async ({ request }) => {
    await delay(MOCK_LATENCY)
    
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>
    const email = typeof body['email'] === 'string' ? (body['email'] as string) : ''
    const password = typeof body['password'] === 'string' ? (body['password'] as string) : ''
    
    if (
      (email === 'admin@earsip.com' && password === 'password') ||
      (email === 'admin@example.com' && password === 'password123')
    ) {
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

  http.post(`${API_BASE_URL}/logout`, async () => {
    await delay(MOCK_LATENCY)
    return HttpResponse.json({
      message: 'Logout berhasil',
    })
  }),

  http.post('/logout', async () => {
    await delay(MOCK_LATENCY)
    return HttpResponse.json({
      message: 'Logout berhasil',
    })
  }),

  http.post('/api/auth/logout', async () => {
    await delay(MOCK_LATENCY)
    return HttpResponse.json({
      message: 'Logout berhasil',
    })
  }),

  http.get(`${API_BASE_URL}/user`, async ({ request }) => {
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

  http.get('/user', async ({ request }) => {
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

  http.get('/api/user', async ({ request }) => {
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

  http.get('/categories', async () => {
    await delay(MOCK_LATENCY)
    return HttpResponse.json({
      data: mockCategories,
    })
  }),

  http.get('/api/categories', async () => {
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

  http.get('/surat-masuk', async ({ request }) => {
    await delay(MOCK_LATENCY)
    
    const url = new URL(request.url, 'https://example.com')
    const params = url.searchParams
    
    const filtered = filterSuratMasuk(allMockSuratMasuk, params)
    const page = parseInt(params.get('page') || '1')
    const perPage = parseInt(params.get('per_page') || '20')
    
    return HttpResponse.json(paginate(filtered, page, perPage))
  }),

  http.get('/api/surat-masuk', async ({ request }) => {
    await delay(MOCK_LATENCY)
    
    const url = new URL(request.url, 'https://example.com')
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

  http.get('/surat-masuk/:id', async ({ params }) => {
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

  http.get('/api/surat-masuk/:id', async ({ params }) => {
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
    
    const body = (await request.json()) as Partial<SuratMasukCreate> | undefined
    if (!body) {
      return HttpResponse.json({ message: 'Payload tidak valid' }, { status: 400 })
    }

    const { nomor_surat, perihal, pengirim, tanggal, tanggal_diterima, category_id } = body
    if (!nomor_surat || !perihal || !pengirim || !tanggal || !tanggal_diterima || !category_id) {
      return HttpResponse.json({ message: 'Payload tidak valid' }, { status: 422 })
    }

    const category = mockCategories.find(cat => cat.id === category_id) ?? mockCategories[0]
    const newItem = {
      id: Math.max(...allMockSuratMasuk.map(s => s.id)) + 1,
      nomor_surat,
      perihal,
      pengirim,
      tanggal,
      tanggal_diterima,
      category_id,
      keterangan: body.keterangan ?? null,
      file_path: body.file_path ?? null,
      category: { id: category.id, name: category.name },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    
    allMockSuratMasuk.push(newItem)
    
    return HttpResponse.json({
      data: newItem,
      message: 'Surat masuk berhasil ditambahkan',
    })
  }),

  http.post('/surat-masuk', async ({ request }) => {
    await delay(MOCK_LATENCY)
    
    const body = (await request.json()) as Partial<SuratMasukCreate> | undefined
    if (!body) {
      return HttpResponse.json({ message: 'Payload tidak valid' }, { status: 400 })
    }

    const { nomor_surat, perihal, pengirim, tanggal, tanggal_diterima, category_id } = body
    if (!nomor_surat || !perihal || !pengirim || !tanggal || !tanggal_diterima || !category_id) {
      return HttpResponse.json({ message: 'Payload tidak valid' }, { status: 422 })
    }

    const category = mockCategories.find(cat => cat.id === category_id) ?? mockCategories[0]
    const newItem = {
      id: Math.max(...allMockSuratMasuk.map(s => s.id)) + 1,
      nomor_surat,
      perihal,
      pengirim,
      tanggal,
      tanggal_diterima,
      category_id,
      keterangan: body.keterangan ?? null,
      file_path: body.file_path ?? null,
      category: { id: category.id, name: category.name },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    
    allMockSuratMasuk.push(newItem)
    
    return HttpResponse.json({
      data: newItem,
      message: 'Surat masuk berhasil ditambahkan',
    })
  }),

  http.post('/api/surat-masuk', async ({ request }) => {
    await delay(MOCK_LATENCY)
    
    const body = (await request.json()) as Partial<SuratMasukCreate> | undefined
    if (!body) {
      return HttpResponse.json({ message: 'Payload tidak valid' }, { status: 400 })
    }

    const { nomor_surat, perihal, pengirim, tanggal, tanggal_diterima, category_id } = body
    if (!nomor_surat || !perihal || !pengirim || !tanggal || !tanggal_diterima || !category_id) {
      return HttpResponse.json({ message: 'Payload tidak valid' }, { status: 422 })
    }

    const category = mockCategories.find(cat => cat.id === category_id) ?? mockCategories[0]
    const newItem = {
      id: Math.max(...allMockSuratMasuk.map(s => s.id)) + 1,
      nomor_surat,
      perihal,
      pengirim,
      tanggal,
      tanggal_diterima,
      category_id,
      keterangan: body.keterangan ?? null,
      file_path: body.file_path ?? null,
      category: { id: category.id, name: category.name },
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
    const body = ((await request.json().catch(() => undefined)) ?? {}) as Partial<SuratMasukCreate>
    const index = allMockSuratMasuk.findIndex(s => s.id === id)
    
    if (index === -1) {
      return HttpResponse.json(
        { message: 'Surat masuk tidak ditemukan' },
        { status: 404 }
      )
    }
    
    const updatedCategoryId = body.category_id ?? allMockSuratMasuk[index].category_id
    const category = mockCategories.find(cat => cat.id === updatedCategoryId) ?? mockCategories[0]
    
    allMockSuratMasuk[index] = {
      ...allMockSuratMasuk[index],
      ...body,
      category_id: updatedCategoryId,
      category: { id: category.id, name: category.name },
      updated_at: new Date().toISOString(),
    }
    
    return HttpResponse.json({
      data: allMockSuratMasuk[index],
      message: 'Surat masuk berhasil diperbarui',
    })
  }),

  http.put('/surat-masuk/:id', async ({ params, request }) => {
    await delay(MOCK_LATENCY)
    
    const id = parseInt(params.id as string)
    const body = ((await request.json().catch(() => undefined)) ?? {}) as Partial<SuratMasukCreate>
    const index = allMockSuratMasuk.findIndex(s => s.id === id)
    
    if (index === -1) {
      return HttpResponse.json(
        { message: 'Surat masuk tidak ditemukan' },
        { status: 404 }
      )
    }
    
    const updatedCategoryId = body.category_id ?? allMockSuratMasuk[index].category_id
    const category = mockCategories.find(cat => cat.id === updatedCategoryId) ?? mockCategories[0]
    
    allMockSuratMasuk[index] = {
      ...allMockSuratMasuk[index],
      ...body,
      category_id: updatedCategoryId,
      category: { id: category.id, name: category.name },
      updated_at: new Date().toISOString(),
    }
    
    return HttpResponse.json({
      data: allMockSuratMasuk[index],
      message: 'Surat masuk berhasil diperbarui',
    })
  }),

  http.put('/api/surat-masuk/:id', async ({ params, request }) => {
    await delay(MOCK_LATENCY)
    
    const id = parseInt(params.id as string)
    const body = ((await request.json().catch(() => undefined)) ?? {}) as Partial<SuratMasukCreate>
    const index = allMockSuratMasuk.findIndex(s => s.id === id)
    
    if (index === -1) {
      return HttpResponse.json(
        { message: 'Surat masuk tidak ditemukan' },
        { status: 404 }
      )
    }
    
    const updatedCategoryId = body.category_id ?? allMockSuratMasuk[index].category_id
    const category = mockCategories.find(cat => cat.id === updatedCategoryId) ?? mockCategories[0]
    
    allMockSuratMasuk[index] = {
      ...allMockSuratMasuk[index],
      ...body,
      category_id: updatedCategoryId,
      category: { id: category.id, name: category.name },
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

  http.delete('/surat-masuk/:id', async ({ params }) => {
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

  http.delete('/api/surat-masuk/:id', async ({ params }) => {
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

  http.get('/surat-keluar', async ({ request }) => {
    await delay(MOCK_LATENCY)
    
    const url = new URL(request.url, 'https://example.com')
    const params = url.searchParams
    
    const filtered = filterSuratKeluar(allMockSuratKeluar, params)
    const page = parseInt(params.get('page') || '1')
    const perPage = parseInt(params.get('per_page') || '20')
    
    return HttpResponse.json(paginate(filtered, page, perPage))
  }),

  http.get('/api/surat-keluar', async ({ request }) => {
    await delay(MOCK_LATENCY)
    
    const url = new URL(request.url, 'https://example.com')
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

  http.get('/surat-keluar/:id', async ({ params }) => {
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

  http.get('/api/surat-keluar/:id', async ({ params }) => {
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
    
    const body = (await request.json()) as Partial<SuratKeluarCreate> | undefined
    if (!body) {
      return HttpResponse.json({ message: 'Payload tidak valid' }, { status: 400 })
    }

    const { nomor_surat, perihal, tujuan, tanggal, category_id } = body
    if (!nomor_surat || !perihal || !tujuan || !tanggal || !category_id) {
      return HttpResponse.json({ message: 'Payload tidak valid' }, { status: 422 })
    }

    const category = mockCategories.find(cat => cat.id === category_id) ?? mockCategories[0]
    const newItem = {
      id: Math.max(...allMockSuratKeluar.map(s => s.id)) + 1,
      nomor_surat,
      perihal,
      tujuan,
      tanggal,
      keterangan: body.keterangan ?? null,
      file_path: body.file_path ?? null,
      category_id,
      category: { id: category.id, name: category.name },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    
    allMockSuratKeluar.push(newItem)
    
    return HttpResponse.json({
      data: newItem,
      message: 'Surat keluar berhasil ditambahkan',
    })
  }),

  http.post('/surat-keluar', async ({ request }) => {
    await delay(MOCK_LATENCY)
    
    const body = (await request.json()) as Partial<SuratKeluarCreate> | undefined
    if (!body) {
      return HttpResponse.json({ message: 'Payload tidak valid' }, { status: 400 })
    }

    const { nomor_surat, perihal, tujuan, tanggal, category_id } = body
    if (!nomor_surat || !perihal || !tujuan || !tanggal || !category_id) {
      return HttpResponse.json({ message: 'Payload tidak valid' }, { status: 422 })
    }

    const category = mockCategories.find(cat => cat.id === category_id) ?? mockCategories[0]
    const newItem = {
      id: Math.max(...allMockSuratKeluar.map(s => s.id)) + 1,
      nomor_surat,
      perihal,
      tujuan,
      tanggal,
      keterangan: body.keterangan ?? null,
      file_path: body.file_path ?? null,
      category_id,
      category: { id: category.id, name: category.name },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    
    allMockSuratKeluar.push(newItem)
    
    return HttpResponse.json({
      data: newItem,
      message: 'Surat keluar berhasil ditambahkan',
    })
  }),

  http.post('/api/surat-keluar', async ({ request }) => {
    await delay(MOCK_LATENCY)
    
    const body = (await request.json()) as Partial<SuratKeluarCreate> | undefined
    if (!body) {
      return HttpResponse.json({ message: 'Payload tidak valid' }, { status: 400 })
    }

    const { nomor_surat, perihal, tujuan, tanggal, category_id } = body
    if (!nomor_surat || !perihal || !tujuan || !tanggal || !category_id) {
      return HttpResponse.json({ message: 'Payload tidak valid' }, { status: 422 })
    }

    const category = mockCategories.find(cat => cat.id === category_id) ?? mockCategories[0]
    const newItem = {
      id: Math.max(...allMockSuratKeluar.map(s => s.id)) + 1,
      nomor_surat,
      perihal,
      tujuan,
      tanggal,
      keterangan: body.keterangan ?? null,
      file_path: body.file_path ?? null,
      category_id,
      category: { id: category.id, name: category.name },
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
    const body = ((await request.json().catch(() => undefined)) ?? {}) as Partial<SuratKeluarCreate>
    const index = allMockSuratKeluar.findIndex(s => s.id === id)
    
    if (index === -1) {
      return HttpResponse.json(
        { message: 'Surat keluar tidak ditemukan' },
        { status: 404 }
      )
    }
    
    const updatedCategoryId = body.category_id ?? allMockSuratKeluar[index].category_id
    const category = mockCategories.find(cat => cat.id === updatedCategoryId) ?? mockCategories[0]
    
    allMockSuratKeluar[index] = {
      ...allMockSuratKeluar[index],
      ...body,
      category_id: updatedCategoryId,
      category: { id: category.id, name: category.name },
      updated_at: new Date().toISOString(),
    }
    
    return HttpResponse.json({
      data: allMockSuratKeluar[index],
      message: 'Surat keluar berhasil diperbarui',
    })
  }),

  http.put('/surat-keluar/:id', async ({ params, request }) => {
    await delay(MOCK_LATENCY)
    
    const id = parseInt(params.id as string)
    const body = ((await request.json().catch(() => undefined)) ?? {}) as Partial<SuratKeluarCreate>
    const index = allMockSuratKeluar.findIndex(s => s.id === id)
    
    if (index === -1) {
      return HttpResponse.json(
        { message: 'Surat keluar tidak ditemukan' },
        { status: 404 }
      )
    }
    
    const updatedCategoryId = body.category_id ?? allMockSuratKeluar[index].category_id
    const category = mockCategories.find(cat => cat.id === updatedCategoryId) ?? mockCategories[0]
    
    allMockSuratKeluar[index] = {
      ...allMockSuratKeluar[index],
      ...body,
      category_id: updatedCategoryId,
      category: { id: category.id, name: category.name },
      updated_at: new Date().toISOString(),
    }
    
    return HttpResponse.json({
      data: allMockSuratKeluar[index],
      message: 'Surat keluar berhasil diperbarui',
    })
  }),

  http.put('/api/surat-keluar/:id', async ({ params, request }) => {
    await delay(MOCK_LATENCY)
    
    const id = parseInt(params.id as string)
    const body = ((await request.json().catch(() => undefined)) ?? {}) as Partial<SuratKeluarCreate>
    const index = allMockSuratKeluar.findIndex(s => s.id === id)
    
    if (index === -1) {
      return HttpResponse.json(
        { message: 'Surat keluar tidak ditemukan' },
        { status: 404 }
      )
    }
    
    const updatedCategoryId = body.category_id ?? allMockSuratKeluar[index].category_id
    const category = mockCategories.find(cat => cat.id === updatedCategoryId) ?? mockCategories[0]
    
    allMockSuratKeluar[index] = {
      ...allMockSuratKeluar[index],
      ...body,
      category_id: updatedCategoryId,
      category: { id: category.id, name: category.name },
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

  http.delete('/surat-keluar/:id', async ({ params }) => {
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

  http.delete('/api/surat-keluar/:id', async ({ params }) => {
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
  http.get(`${API_BASE_URL}/dashboard/summary`, async () => {
    await delay(MOCK_LATENCY)
    return HttpResponse.json({
      data: mockDashboardMetrics,
    })
  }),

  // Dashboard endpoint - Relative path for same-origin requests
  http.get('/dashboard/summary', async () => {
    await delay(MOCK_LATENCY)
    return HttpResponse.json({
      data: mockDashboardMetrics,
    })
  }),

  http.get('/api/dashboard/summary', async () => {
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
        charts: mockDashboardMetrics.harian_30_hari,
      },
    })
  }),

  http.get('/reports/summary', async () => {
    await delay(MOCK_LATENCY)
    return HttpResponse.json({
      data: {
        summary: 'Mock report summary data',
        charts: mockDashboardMetrics.harian_30_hari,
      },
    })
  }),

  http.get('/api/reports/summary', async () => {
    await delay(MOCK_LATENCY)
    return HttpResponse.json({
      data: {
        summary: 'Mock report summary data',
        charts: mockDashboardMetrics.harian_30_hari,
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

  http.post('/reports/export', async () => {
    await delay(MOCK_LATENCY)
    
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

  http.post('/api/reports/export', async () => {
    await delay(MOCK_LATENCY)
    
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

  // Document search endpoint
  http.get(`${API_BASE_URL}/documents/search`, async ({ request }) => {
    await delay(MOCK_LATENCY)
    
    const url = new URL(request.url)
    const query = url.searchParams.get('q') || ''
    const type = url.searchParams.get('type') || 'all'
    const page = parseInt(url.searchParams.get('page') || '1')
    const perPage = parseInt(url.searchParams.get('per_page') || '10')
    
    let results: DocumentSearchResult[] = []
    
  if (type === 'incoming' || type === 'all') {
      const filteredIncoming = allMockSuratMasuk.filter(doc => 
        doc.perihal.toLowerCase().includes(query.toLowerCase()) ||
        (doc.pengirim ?? '').toLowerCase().includes(query.toLowerCase()) ||
        doc.nomor_surat.toLowerCase().includes(query.toLowerCase())
      ).map(doc => ({
        ...doc,
        document_type: 'incoming' as const,
      }))
      results = [...results, ...filteredIncoming]
  }
  
  if (type === 'outgoing' || type === 'all') {
      const filteredOutgoing = allMockSuratKeluar.filter(doc => 
        doc.perihal.toLowerCase().includes(query.toLowerCase()) ||
        (doc.tujuan ?? '').toLowerCase().includes(query.toLowerCase()) ||
        doc.nomor_surat.toLowerCase().includes(query.toLowerCase())
      ).map(doc => ({
        ...doc,
        document_type: 'outgoing' as const,
      }))
      results = [...results, ...filteredOutgoing]
    }
    
    return HttpResponse.json(paginate(results, page, perPage))
  }),
]
