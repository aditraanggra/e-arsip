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
  district?: string
  village?: string
  sort?: string
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
const categoryStore: Category[] = [...mockCategories]

let nextSuratMasukId = Math.max(...suratMasukStore.map((item) => item.id)) + 1
let nextSuratKeluarId = Math.max(...suratKeluarStore.map((item) => item.id)) + 1
let nextCategoryId = Math.max(...categoryStore.map((item) => item.id)) + 1

function normalizeText(value: string | number) {
  return value.toString().toLowerCase()
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
      [item.nomor_surat, item.perihal, item.pengirim, item.no_agenda]
        .filter(Boolean)
        .some((field) => normalizeText(field!).includes(value))
    )
  }

  if (params.category_id) {
    filtered = filtered.filter((item) => item.category_id === params.category_id)
  }

  if (params.date_from) {
    filtered = filtered.filter(
      (item) => item.tanggal.slice(0, 10) >= params.date_from!
    )
  }

  if (params.date_to) {
    filtered = filtered.filter(
      (item) => item.tanggal.slice(0, 10) <= params.date_to!
    )
  }

  if (params.district) {
    filtered = filtered.filter(
      (item) => normalizeText(item.district ?? '') === normalizeText(params.district!)
    )
  }

  if (params.village) {
    filtered = filtered.filter(
      (item) => normalizeText(item.village ?? '') === normalizeText(params.village!)
    )
  }

  return filtered
}

function parseAgendaNumber(value: string | number | null | undefined) {
  if (value === null || value === undefined) return Number.NEGATIVE_INFINITY
  if (typeof value === 'number' && Number.isFinite(value)) return value
  const digits = value.toString().replace(/\D+/g, '')
  if (!digits) return Number.NEGATIVE_INFINITY
  const parsed = Number(digits)
  return Number.isFinite(parsed) ? parsed : Number.NEGATIVE_INFINITY
}

function sortSuratMasuk(items: SuratMasuk[], sort?: string) {
  if (!sort) return items

  const direction = sort.startsWith('-') ? 'desc' : 'asc'
  const field = sort.replace(/^-/, '')

  const compare = (a: SuratMasuk, b: SuratMasuk) => {
    if (field === 'no_agenda') {
      const diff = parseAgendaNumber(b.no_agenda) - parseAgendaNumber(a.no_agenda)
      return direction === 'desc' ? diff : -diff
    }

    if (field === 'tanggal') {
      const diff =
        new Date(b.tanggal ?? 0).getTime() - new Date(a.tanggal ?? 0).getTime()
      return direction === 'desc' ? diff : -diff
    }

    return 0
  }

  return [...items].sort(compare)
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
    filtered = filtered.filter(
      (item) => item.tanggal.slice(0, 10) >= params.date_from!
    )
  }

  if (params.date_to) {
    filtered = filtered.filter(
      (item) => item.tanggal.slice(0, 10) <= params.date_to!
    )
  }

  return filtered
}

function computeDashboardMetrics(): DashboardMetrics {
  const totalMasuk = suratMasukStore.length
  const totalKeluar = suratKeluarStore.length

  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()
  const todayKey = now.toISOString().split('T')[0]

  const suratMasukBulanIni = suratMasukStore.filter((item) => {
    const date = new Date(item.tanggal)
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear
  }).length

  const suratKeluarBulanIni = suratKeluarStore.filter((item) => {
    const date = new Date(item.tanggal)
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear
  }).length

  const suratMasukHariIni = suratMasukStore.filter(
    (item) => item.tanggal.slice(0, 10) === todayKey
  ).length
  const suratKeluarHariIni = suratKeluarStore.filter(
    (item) => item.tanggal.slice(0, 10) === todayKey
  ).length

  const chartData = mockDashboardMetrics.harian_30_hari

  return {
    total_surat_masuk: totalMasuk,
    total_surat_keluar: totalKeluar,
    bulan_ini: {
      surat_masuk: suratMasukBulanIni,
      surat_keluar: suratKeluarBulanIni,
      total: suratMasukBulanIni + suratKeluarBulanIni,
    },
    hari_ini: {
      surat_masuk: suratMasukHariIni,
      surat_keluar: suratKeluarHariIni,
      total: suratMasukHariIni + suratKeluarHariIni,
    },
    harian_30_hari: chartData,
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
    charts: metrics.harian_30_hari,
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
      return categoryStore
    },
    async create(data: { name: string; desc?: string }): Promise<Category> {
      const trimmedName = data.name.trim()
      if (!trimmedName) {
        throw new Error('Nama kategori wajib diisi')
      }
      const existing = categoryStore.find(
        (category) => category.name.toLowerCase() === trimmedName.toLowerCase()
      )
      if (existing) {
        throw new Error('Kategori dengan nama tersebut sudah ada')
      }
      const newCategory: Category = {
        id: nextCategoryId++,
        name: trimmedName,
        desc: data.desc?.trim() || '',
      }
      categoryStore.push(newCategory)
      return newCategory
    },
  },

  suratMasuk: {
    async getList(params: SuratMasukQuery = {}): Promise<PaginatedResponse<SuratMasuk>> {
      const page = params.page ?? 1
      const perPage = params.per_page ?? 10
      const filtered = filterSuratMasuk(suratMasukStore, params)
      const sorted = sortSuratMasuk(filtered, params.sort)
      return paginate(sorted, page, perPage)
    },

    async getById(id: number): Promise<SuratMasuk | undefined> {
      return suratMasukStore.find((item) => item.id === id)
    },

    async create(data: SuratMasukCreate): Promise<SuratMasuk> {
      const category = categoryStore.find((cat) => cat.id === data.category_id)
      if (!category) {
        throw new Error('Kategori tidak ditemukan')
      }

      const generatedAgenda = `AGD-${new Date().getFullYear()}-${String(nextSuratMasukId).padStart(3, '0')}`

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
        no_agenda: data.no_agenda ?? generatedAgenda,
        district: data.district ?? null,
        village: data.village ?? null,
        contact: data.contact ?? null,
        address: data.address ?? null,
        dept_disposition: data.dept_disposition ?? null,
        desc_disposition: data.desc_disposition ?? data.keterangan ?? null,
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
      const fallbackCategory = current.category
        ? { id: current.category.id, name: current.category.name }
        : categoryStore.find((cat) => cat.id === current.category_id) ?? categoryStore[0]

      const matchedCategory =
        (data.category_id !== undefined
          ? categoryStore.find((cat) => cat.id === data.category_id)
          : null) ?? fallbackCategory

      const updated: SuratMasuk = {
        ...current,
        ...data,
        category_id: data.category_id ?? current.category_id,
        category: matchedCategory ? { id: matchedCategory.id, name: matchedCategory.name } : current.category,
        updated_at: new Date().toISOString(),
      }

      if (Object.prototype.hasOwnProperty.call(data, 'desc_disposition')) {
        updated.desc_disposition = data.desc_disposition ?? null
      } else if (Object.prototype.hasOwnProperty.call(data, 'keterangan')) {
        updated.desc_disposition = data.keterangan ?? current.desc_disposition ?? null
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
      const category = categoryStore.find((cat) => cat.id === data.category_id)
      if (!category) {
        throw new Error('Kategori tidak ditemukan')
      }

      const fileName = data.file_path?.split('/').pop() ?? null

      const newItem: SuratKeluar = {
        id: nextSuratKeluarId++,
        nomor_surat: data.nomor_surat,
        perihal: data.perihal,
        tujuan: data.tujuan,
        tanggal: data.tanggal,
        keterangan: data.keterangan,
        file_path: data.file_path,
        file: fileName,
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
      const fallbackCategory = current.category
        ? { id: current.category.id, name: current.category.name }
        : categoryStore.find((cat) => cat.id === current.category_id) ?? categoryStore[0]

      const matchedCategory =
        (data.category_id !== undefined
          ? categoryStore.find((cat) => cat.id === data.category_id)
          : null) ?? fallbackCategory

      const updated: SuratKeluar = {
        ...current,
        ...data,
        category_id: data.category_id ?? current.category_id,
        category: matchedCategory ? { id: matchedCategory.id, name: matchedCategory.name } : current.category,
        updated_at: new Date().toISOString(),
      }

      if (Object.prototype.hasOwnProperty.call(data, 'file_path')) {
        updated.file = data.file_path?.split('/').pop() ?? current.file ?? null
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
