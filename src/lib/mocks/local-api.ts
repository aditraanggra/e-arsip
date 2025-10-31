import {
  mockCategories,
  allMockSuratMasuk as initialSuratMasuk,
  allMockSuratKeluar as initialSuratKeluar,
  mockDashboardMetrics,
  mockUser,
} from '@/mocks/data'
import type {
  Category,
  SuratMasuk,
  SuratMasukCreate,
  SuratKeluar,
  SuratKeluarCreate,
  PaginatedResponse,
  DashboardMetrics,
  ReportsSummary,
  LoginData,
  User,
} from '@/lib/schemas'

type SuratMasukQuery = {
  q?: string
  search?: string
  category_id?: number
  date_from?: string
  date_to?: string
  page?: number
  per_page?: number
}

type SuratKeluarQuery = {
  q?: string
  search?: string
  category_id?: number
  date_from?: string
  date_to?: string
  page?: number
  per_page?: number
}

type ReportsQuery = {
  entity?: string
  period?: string
  date?: string
  month?: string
  year?: string
  category_id?: number
}

const suratMasukStore: SuratMasuk[] = [...initialSuratMasuk]
const suratKeluarStore: SuratKeluar[] = [...initialSuratKeluar]

let nextSuratMasukId = Math.max(...suratMasukStore.map((item) => item.id)) + 1
let nextSuratKeluarId = Math.max(...suratKeluarStore.map((item) => item.id)) + 1

function normalizeText(value: string) {
  return value.toLowerCase()
}

function paginate<T>(items: T[], page = 1, perPage = 10): PaginatedResponse<T> {
  const total = items.length
  const start = (page - 1) * perPage
  const data = items.slice(start, start + perPage)

  const from = data.length ? start + 1 : null
  const to = data.length ? start + data.length : null

  return {
    data,
    meta: {
      current_page: page,
      per_page: perPage,
      total,
      last_page: Math.max(1, Math.ceil(total / perPage)),
      from,
      to,
    },
  }
}

function filterSuratMasuk(items: SuratMasuk[], params: SuratMasukQuery) {
  let filtered = [...items]
  const keyword = params.search || params.q

  if (keyword) {
    const value = normalizeText(keyword)
    filtered = filtered.filter((item) =>
      [item.nomor_surat, item.perihal, item.pengirim]
        .filter(Boolean)
        .some((field) => normalizeText(field!).includes(value))
    )
  }

  if (params.category_id) {
    filtered = filtered.filter((item) => item.category_id === params.category_id)
  }

  if (params.date_from) {
    filtered = filtered.filter((item) => item.tanggal >= params.date_from!)
  }

  if (params.date_to) {
    filtered = filtered.filter((item) => item.tanggal <= params.date_to!)
  }

  return filtered
}

function filterSuratKeluar(items: SuratKeluar[], params: SuratKeluarQuery) {
  let filtered = [...items]
  const keyword = params.search || params.q

  if (keyword) {
    const value = normalizeText(keyword)
    filtered = filtered.filter((item) =>
      [item.nomor_surat, item.perihal, item.tujuan]
        .filter(Boolean)
        .some((field) => normalizeText(field!).includes(value))
    )
  }

  if (params.category_id) {
    filtered = filtered.filter((item) => item.category_id === params.category_id)
  }

  if (params.date_from) {
    filtered = filtered.filter((item) => item.tanggal >= params.date_from!)
  }

  if (params.date_to) {
    filtered = filtered.filter((item) => item.tanggal <= params.date_to!)
  }

  return filtered
}

function computeDashboardMetrics(): DashboardMetrics {
  const totalMasuk = suratMasukStore.length
  const totalKeluar = suratKeluarStore.length

  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()

  const suratMasukBulanIni = suratMasukStore.filter((item) => {
    const date = new Date(item.tanggal)
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear
  }).length

  const suratKeluarBulanIni = suratKeluarStore.filter((item) => {
    const date = new Date(item.tanggal)
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear
  }).length

  // Use existing mock chart data for visual richness
  const chartData = mockDashboardMetrics.chart_data

  return {
    total_surat_masuk: totalMasuk,
    total_surat_keluar: totalKeluar,
    surat_masuk_bulan_ini: suratMasukBulanIni,
    surat_keluar_bulan_ini: suratKeluarBulanIni,
    chart_data: chartData,
  }
}

function buildSummary(params: ReportsQuery): ReportsSummary {
  const metrics = computeDashboardMetrics()
  const summaryParts: string[] = []

  if (params.period === 'yearly') {
    summaryParts.push(`Ringkasan tahunan arsip surat untuk tahun ${params.year || new Date().getFullYear()}.`)
  } else {
    summaryParts.push('Ringkasan bulanan aktivitas arsip surat.')
  }

  if (params.entity === 'incoming') {
    summaryParts.push('Fokus laporan pada surat masuk saja.')
  } else if (params.entity === 'outgoing') {
    summaryParts.push('Fokus laporan pada surat keluar saja.')
  } else {
    summaryParts.push('Menampilkan gabungan surat masuk dan keluar.')
  }

  summaryParts.push(`Total surat masuk tercatat ${metrics.total_surat_masuk} dan surat keluar ${metrics.total_surat_keluar}.`)

  return {
    summary: summaryParts.join(' '),
    charts: metrics.chart_data,
  }
}

export const localApi = {
  auth: {
    async login(credentials: LoginData): Promise<{ user: User; token: string }> {
      const validUsers: Record<string, string> = {
        'admin@example.com': 'password123',
        'admin@earsip.com': 'password',
      }

      const password = validUsers[credentials.email]
      if (!password || password !== credentials.password) {
        throw new Error('Email atau password salah')
      }

      return {
        user: mockUser,
        token: 'local-mock-token',
      }
    },

    async logout(): Promise<void> {
      return
    },

    async me(): Promise<User> {
      return mockUser
    },
  },

  categories: {
    async getAll(): Promise<Category[]> {
      return mockCategories
    },
  },

  suratMasuk: {
    async getList(params: SuratMasukQuery = {}): Promise<PaginatedResponse<SuratMasuk>> {
      const page = params.page ?? 1
      const perPage = params.per_page ?? 10
      const filtered = filterSuratMasuk(suratMasukStore, params)
      return paginate(filtered, page, perPage)
    },

    async getById(id: number): Promise<SuratMasuk | undefined> {
      return suratMasukStore.find((item) => item.id === id)
    },

    async create(data: SuratMasukCreate): Promise<SuratMasuk> {
      const category = mockCategories.find((cat) => cat.id === data.category_id)
      if (!category) {
        throw new Error('Kategori tidak ditemukan')
      }

      const newItem: SuratMasuk = {
        id: nextSuratMasukId++,
        nomor_surat: data.nomor_surat,
        perihal: data.perihal,
        pengirim: data.pengirim,
        tanggal: data.tanggal,
        tanggal_diterima: data.tanggal_diterima,
        keterangan: data.keterangan,
        file_path: data.file_path,
        category_id: data.category_id,
        category: { id: category.id, name: category.name },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      suratMasukStore.unshift(newItem)
      return newItem
    },

    async update(id: number, data: Partial<SuratMasukCreate>): Promise<SuratMasuk> {
      const index = suratMasukStore.findIndex((item) => item.id === id)
      if (index === -1) {
        throw new Error('Surat masuk tidak ditemukan')
      }

      const current = suratMasukStore[index]
      let category = mockCategories.find((cat) => cat.id === (data.category_id ?? current.category_id))
      if (!category) {
        category = { id: current.category.id, name: current.category.name }
      }

      const updated: SuratMasuk = {
        ...current,
        ...data,
        category_id: data.category_id ?? current.category_id,
        category: { id: category.id, name: category.name },
        updated_at: new Date().toISOString(),
      }

      suratMasukStore[index] = updated
      return updated
    },

    async delete(id: number): Promise<void> {
      const index = suratMasukStore.findIndex((item) => item.id === id)
      if (index === -1) {
        throw new Error('Surat masuk tidak ditemukan')
      }
      suratMasukStore.splice(index, 1)
    },
  },

  suratKeluar: {
    async getList(params: SuratKeluarQuery = {}): Promise<PaginatedResponse<SuratKeluar>> {
      const page = params.page ?? 1
      const perPage = params.per_page ?? 10
      const filtered = filterSuratKeluar(suratKeluarStore, params)
      return paginate(filtered, page, perPage)
    },

    async getById(id: number): Promise<SuratKeluar | undefined> {
      return suratKeluarStore.find((item) => item.id === id)
    },

    async create(data: SuratKeluarCreate): Promise<SuratKeluar> {
      const category = mockCategories.find((cat) => cat.id === data.category_id)
      if (!category) {
        throw new Error('Kategori tidak ditemukan')
      }

      const newItem: SuratKeluar = {
        id: nextSuratKeluarId++,
        nomor_surat: data.nomor_surat,
        perihal: data.perihal,
        tujuan: data.tujuan,
        tanggal: data.tanggal,
        keterangan: data.keterangan,
        file_path: data.file_path,
        category_id: data.category_id,
        category: { id: category.id, name: category.name },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      suratKeluarStore.unshift(newItem)
      return newItem
    },

    async update(id: number, data: Partial<SuratKeluarCreate>): Promise<SuratKeluar> {
      const index = suratKeluarStore.findIndex((item) => item.id === id)
      if (index === -1) {
        throw new Error('Surat keluar tidak ditemukan')
      }

      const current = suratKeluarStore[index]
      let category = mockCategories.find((cat) => cat.id === (data.category_id ?? current.category_id))
      if (!category) {
        category = { id: current.category.id, name: current.category.name }
      }

      const updated: SuratKeluar = {
        ...current,
        ...data,
        category_id: data.category_id ?? current.category_id,
        category: { id: category.id, name: category.name },
        updated_at: new Date().toISOString(),
      }

      suratKeluarStore[index] = updated
      return updated
    },

    async delete(id: number): Promise<void> {
      const index = suratKeluarStore.findIndex((item) => item.id === id)
      if (index === -1) {
        throw new Error('Surat keluar tidak ditemukan')
      }
      suratKeluarStore.splice(index, 1)
    },
  },

  dashboard: {
    async getMetrics(): Promise<DashboardMetrics> {
      return computeDashboardMetrics()
    },
  },

  reports: {
    async getSummary(params: ReportsQuery = {}): Promise<ReportsSummary> {
      return buildSummary(params)
    },

    async exportReport(): Promise<Blob> {
      const content = 'Laporan E-Arsip (dummy) - silakan gunakan data produksi untuk arsip resmi.'
      return new Blob([content], { type: 'text/plain' })
    },
  },
}

