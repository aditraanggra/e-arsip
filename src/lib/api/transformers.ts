import {
  apiResponseSchema,
  paginationMetaSchema,
  suratMasukApiSchema,
  suratMasukSchema,
  suratKeluarApiSchema,
  suratKeluarSchema,
  dashboardMetricsSchema,
  dashboardMetricsApiSchema,
  dashboardChartPointApiSchema,
  type PaginatedResponse,
  type PaginationMeta,
  type SuratMasuk,
  type SuratMasukCreate,
  type SuratKeluar,
  type SuratKeluarCreate,
  type DashboardMetrics,
  type DashboardMetricsApi,
  type DashboardChartPointApi,
} from '@/lib/schemas'
import { z } from 'zod'

const isoDateRegexp = /^\d{4}-\d{2}-\d{2}(T.*)?$/

function toIsoJakarta(dateString: string): string {
  if (!isoDateRegexp.test(dateString)) {
    // Attempt to parse other formats via Date as a fallback.
    const parsed = new Date(dateString)
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString()
    }
    throw new Error(`Tanggal tidak valid: ${dateString}`)
  }

  if (dateString.includes('T')) {
    return dateString
  }

  return `${dateString}T00:00:00+07:00`
}

const fallbackString = (value: string | null | undefined) =>
  value ?? ''

const pickFilePath = (payload: {
  file?: string | null
  file_path?: string | null
  file_url?: string | null
}) => payload.file_path ?? payload.file_url ?? payload.file ?? null

const removeUndefined = (input: Record<string, unknown>) => {
  const result: Record<string, unknown> = {}
  Object.entries(input).forEach(([key, value]) => {
    if (value !== undefined) {
      result[key] = value
    }
  })
  return result
}

type AnyRecord = Record<string, unknown>

const asRecord = (value: unknown): AnyRecord =>
  (typeof value === 'object' && value !== null ? (value as AnyRecord) : {})

const pickString = (record: AnyRecord, keys: string[]): string | null => {
  for (const key of keys) {
    const value = record[key]
    if (typeof value === 'string') {
      const trimmed = value.trim()
      if (trimmed.length > 0) {
        return trimmed
      }
    }
  }
  return null
}

const pickNumber = (record: AnyRecord, keys: string[]): number | null => {
  for (const key of keys) {
    const value = record[key]
    if (typeof value === 'number' && !Number.isNaN(value)) {
      return value
    }
    if (typeof value === 'string') {
      const parsed = Number(value)
      if (!Number.isNaN(parsed)) {
        return parsed
      }
    }
  }
  return null
}

const pickNestedNumber = (record: AnyRecord, paths: string[][]): number | null => {
  for (const path of paths) {
    let current: unknown = record
    for (const segment of path) {
      if (typeof current !== 'object' || current === null) {
        current = undefined
        break
      }
      current = (current as AnyRecord)[segment]
    }

    if (typeof current === 'number' && !Number.isNaN(current)) {
      return current
    }

    if (typeof current === 'string') {
      const parsed = Number(current)
      if (!Number.isNaN(parsed)) {
        return parsed
      }
    }
  }

  return null
}

const normalizeCategory = (value: unknown): SuratMasuk['category'] => {
  const record = asRecord(value)
  const id = pickNumber(record, ['id'])
  if (!id) {
    return null
  }

  const name =
    pickString(record, ['name', 'nama', 'label', 'title']) ?? `Kategori #${id}`

  return { id, name }
}

const pickFilePathFromRecord = (record: AnyRecord) =>
  pickFilePath({
    file: pickString(record, ['file', 'lampiran', 'attachment']),
    file_path: pickString(record, ['file_path', 'path_file', 'filepath']),
    file_url: pickString(record, ['file_url', 'url_file', 'link_file']),
  })

const normalizeDateLabel = (value: string | null, fallback: string): string => {
  if (!value) {
    return fallback
  }

  const trimmed = value.trim()
  if (!trimmed) {
    return fallback
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed
  }

  const parsed = new Date(trimmed)
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toISOString().split('T')[0]
  }

  return trimmed
}

const normalizePaginationMeta = (metaInput: unknown, itemsLength: number): PaginationMeta => {
  const parsed = paginationMetaSchema.parse(metaInput ?? {})

  const determinedPerPage =
    parsed.per_page && parsed.per_page > 0
      ? parsed.per_page
      : itemsLength > 0
        ? itemsLength
        : 10

  const perPage = determinedPerPage
  const total = parsed.total ?? itemsLength
  const currentPage = parsed.current_page ?? 1
  const lastPage =
    parsed.last_page ??
    (perPage > 0 ? Math.max(1, Math.ceil(total / perPage)) : 1)

  const from =
    parsed.from ??
    (total === 0 ? null : (currentPage - 1) * perPage + 1)

  const to =
    parsed.to ??
    (total === 0 || from === null ? null : from + itemsLength - 1)

  return {
    current_page: currentPage,
    per_page: perPage,
    total,
    last_page: lastPage,
    from,
    to,
  }
}

const extractPaginatedData = (payload: unknown) => {
  if (typeof payload !== 'object' || payload === null) {
    throw new Error('Respons paginasi tidak valid')
  }

  const root = payload as AnyRecord
  const candidates: Array<{ data: unknown[]; meta?: unknown }> = []

  if (Array.isArray(root.data)) {
    candidates.push({ data: root.data, meta: root.meta })
  }

  const nestedData = asRecord(root.data)
  if (Array.isArray(nestedData.data)) {
    candidates.push({
      data: nestedData.data,
      meta: nestedData.meta ?? root.meta,
    })
  }

  if (Array.isArray(root.records)) {
    candidates.push({ data: root.records, meta: root.meta })
  }

  const chosen =
    candidates.find((candidate) => candidate.data.length > 0) ??
    candidates[0] ??
    { data: [], meta: root.meta }

  return {
    data: chosen.data,
    meta: chosen.meta ?? root.meta,
  }
}

const normalizeChartPoint = (
  rawPoint: DashboardChartPointApi,
  index: number
) => {
  const record = rawPoint as AnyRecord
  const date = normalizeDateLabel(
    pickString(record, ['date', 'label', 'day', 'period', 'tanggal', 'tgl', 'date_label']),
    `Poin ${index + 1}`
  )

  const suratMasuk =
    pickNumber(record, [
      'surat_masuk',
      'incoming',
      'incoming_total',
      'masuk',
      'jumlah_masuk',
      'total_masuk',
    ]) ?? 0

  const suratKeluar =
    pickNumber(record, [
      'surat_keluar',
      'outgoing',
      'outgoing_total',
      'keluar',
      'jumlah_keluar',
      'total_keluar',
    ]) ?? 0

  return {
    date,
    surat_masuk: suratMasuk,
    surat_keluar: suratKeluar,
  }
}

const normalizeDashboardMetrics = (
  raw: DashboardMetricsApi
): DashboardMetrics => {
  const record = raw as AnyRecord

  const totalMasuk =
    pickNumber(record, [
      'total_surat_masuk',
      'total_incoming',
      'incoming_letters',
      'incoming_total',
    ]) ?? 0

  const totalKeluar =
    pickNumber(record, [
      'total_surat_keluar',
      'total_outgoing',
      'outgoing_letters',
      'outgoing_total',
    ]) ?? 0

  const masukBulanIni =
    pickNumber(record, [
      'surat_masuk_bulan_ini',
      'incoming_this_month',
      'surat_masuk_bulan',
    ]) ?? 0

  const keluarBulanIni =
    pickNumber(record, [
      'surat_keluar_bulan_ini',
      'outgoing_this_month',
      'surat_keluar_bulan',
    ]) ?? 0

  const chartCandidates: unknown[][] = []

  if (Array.isArray(raw.chart_data)) chartCandidates.push(raw.chart_data)
  if (Array.isArray(raw.charts)) chartCandidates.push(raw.charts)

  const chart = (raw as AnyRecord).chart
  if (Array.isArray(chart)) chartCandidates.push(chart)

  const overview = (raw as AnyRecord).overview
  if (overview && Array.isArray((overview as AnyRecord).chart)) {
    chartCandidates.push((overview as AnyRecord).chart as unknown[])
  }

  const overviewData = (raw as AnyRecord).overview_data
  if (overviewData && Array.isArray((overviewData as AnyRecord).chart)) {
    chartCandidates.push((overviewData as AnyRecord).chart as unknown[])
  }

  const chartSource =
    chartCandidates.find((candidate) => candidate.length > 0) ??
    chartCandidates[0] ??
    ([] as unknown[])

  const chart_data = chartSource.map((point, index) =>
    normalizeChartPoint(dashboardChartPointApiSchema.parse(point), index)
  )

  return dashboardMetricsSchema.parse({
    total_surat_masuk: totalMasuk,
    total_surat_keluar: totalKeluar,
    surat_masuk_bulan_ini: masukBulanIni,
    surat_keluar_bulan_ini: keluarBulanIni,
    chart_data,
  })
}

export function mapSuratMasukFromApi(
  raw: z.infer<typeof suratMasukApiSchema>
): SuratMasuk {
  const record = raw as AnyRecord

  const nomorSurat = pickString(record, [
    'no_letter',
    'no_surat',
    'nomor_surat',
    'no_surat_masuk',
    'number',
    'nomor',
  ])

  if (!nomorSurat) {
    throw new Error('Nomor surat tidak ditemukan pada respons API surat masuk')
  }

  const perihal =
    pickString(record, ['subject', 'perihal', 'hal', 'judul', 'title']) ??
    'Tanpa perihal'

  const pengirim = pickString(record, ['sender', 'pengirim', 'from', 'asal'])

  const tanggalSuratRaw =
    pickString(record, [
      'date_letter',
      'tanggal_surat',
      'tanggal',
      'tgl_surat',
      'issued_at',
    ]) ?? pickString(record, ['created_at'])

  if (!tanggalSuratRaw) {
    throw new Error('Tanggal surat tidak ditemukan pada respons API surat masuk')
  }

  const tanggalDiterimaRaw =
    pickString(record, [
      'date_agenda',
      'tanggal_diterima',
      'tanggal_agenda',
      'tgl_diterima',
      'received_at',
    ]) ?? tanggalSuratRaw

  const categoryId =
    raw.category_id ??
    pickNumber(record, ['category_id', 'kategori_id', 'categoryId']) ??
    pickNestedNumber(record, [
      ['category', 'id'],
      ['kategori', 'id'],
    ])

  if (!categoryId) {
    throw new Error('Kategori surat masuk tidak ditemukan pada respons API')
  }

  const category =
    normalizeCategory(raw.category) ?? normalizeCategory(raw.kategori)

  const keterangan =
    pickString(record, [
      'desc_disposition',
      'disposition_note',
      'keterangan',
      'description',
      'catatan',
    ]) ??
    pickString(record, ['dept_disposition', 'disposition_department'])

  const mapped = {
    id: raw.id,
    nomor_surat: nomorSurat,
    perihal,
    pengirim: fallbackString(pengirim),
    tanggal: toIsoJakarta(tanggalSuratRaw),
    tanggal_diterima: toIsoJakarta(tanggalDiterimaRaw),
    keterangan: keterangan ?? null,
    file_path: pickFilePathFromRecord(record),
    category_id: categoryId,
    category,
    district:
      pickString(record, ['district', 'kecamatan', 'district_name']) ?? null,
    village:
      pickString(record, ['village', 'desa', 'kelurahan', 'village_name']) ?? null,
    no_agenda:
      pickString(record, ['no_agenda', 'nomor_agenda', 'agenda_number']) ?? null,
    contact:
      pickString(record, ['contact', 'phone', 'telepon', 'telp']) ?? null,
    address: pickString(record, ['address', 'alamat']) ?? null,
    dept_disposition:
      pickString(record, [
        'dept_disposition',
        'disposition_department',
        'dept',
        'bagian_disposisi',
      ]) ?? null,
    desc_disposition:
      pickString(record, [
        'desc_disposition',
        'disposition_note',
        'catatan_disposisi',
        'note',
        'keterangan',
      ]) ?? null,
    created_at: pickString(record, ['created_at']) ?? undefined,
    updated_at: pickString(record, ['updated_at']) ?? undefined,
  }

  return suratMasukSchema.parse(mapped)
}

export function mapSuratKeluarFromApi(
  raw: z.infer<typeof suratKeluarApiSchema>
): SuratKeluar {
  const record = raw as AnyRecord

  const nomorSurat = pickString(record, [
    'no_letter',
    'no_surat',
    'nomor_surat',
    'number',
    'nomor',
  ])

  if (!nomorSurat) {
    throw new Error('Nomor surat tidak ditemukan pada respons API surat keluar')
  }

  const perihal =
    pickString(record, ['subject', 'perihal', 'hal', 'judul', 'title']) ??
    'Tanpa perihal'

  const tujuan = pickString(record, [
    'to_letter',
    'tujuan',
    'recipient',
    'kepada',
    'addressed_to',
  ])

  const tanggalRaw =
    pickString(record, [
      'date_letter',
      'tanggal',
      'tanggal_surat',
      'tgl_surat',
      'issued_at',
    ]) ?? pickString(record, ['created_at'])

  if (!tanggalRaw) {
    throw new Error('Tanggal surat tidak ditemukan pada respons API surat keluar')
  }

  const categoryId =
    raw.category_id ??
    pickNumber(record, ['category_id', 'kategori_id', 'categoryId']) ??
    pickNestedNumber(record, [
      ['category', 'id'],
      ['kategori', 'id'],
    ])

  if (!categoryId) {
    throw new Error('Kategori surat keluar tidak ditemukan pada respons API')
  }

  const category =
    normalizeCategory(raw.category) ?? normalizeCategory(raw.kategori)

  const mapped = {
    id: raw.id,
    nomor_surat: nomorSurat,
    perihal,
    tujuan: fallbackString(tujuan),
    tanggal: toIsoJakarta(tanggalRaw),
    keterangan:
      pickString(record, ['body', 'keterangan', 'description', 'catatan']) ?? null,
    file_path: pickFilePathFromRecord(record),
    file: pickString(record, ['file', 'lampiran', 'attachment']) ?? null,
    category_id: categoryId,
    category,
    created_at: pickString(record, ['created_at']) ?? undefined,
    updated_at: pickString(record, ['updated_at']) ?? undefined,
  }

  return suratKeluarSchema.parse(mapped)
}

export function mapSuratMasukPayload(
  data: Partial<SuratMasukCreate> & {
    district?: string | null
    village?: string | null
    contact?: string | null
    address?: string | null
    dept_disposition?: string | null
    desc_disposition?: string | null
  }
) {
  return removeUndefined({
    no_letter: data.nomor_surat,
    subject: data.perihal,
    sender: data.pengirim,
    date_letter: data.tanggal,
    date_agenda: data.tanggal_diterima,
    desc_disposition: data.desc_disposition ?? data.keterangan ?? null,
    dept_disposition: data.dept_disposition ?? null,
    contact: data.contact ?? null,
    address: data.address ?? null,
    district: data.district ?? null,
    village: data.village ?? null,
    file: data.file_path ?? null,
    category_id: data.category_id,
  })
}

export function mapSuratKeluarPayload(
  data: Partial<SuratKeluarCreate> & {
    to_letter?: string | null
  }
) {
  return removeUndefined({
    no_letter: data.nomor_surat,
    subject: data.perihal,
    to_letter: data.tujuan ?? data.to_letter ?? null,
    date_letter: data.tanggal,
    body: data.keterangan ?? null,
    file: data.file_path ?? null,
    category_id: data.category_id,
  })
}

export function parsePaginatedSuratMasuk(
  payload: unknown
): PaginatedResponse<SuratMasuk> {
  const { data, meta } = extractPaginatedData(payload)
  const mappedData = data.map((item) =>
    mapSuratMasukFromApi(suratMasukApiSchema.parse(item))
  )
  return {
    data: mappedData,
    meta: normalizePaginationMeta(meta, mappedData.length),
  }
}

export function parsePaginatedSuratKeluar(
  payload: unknown
): PaginatedResponse<SuratKeluar> {
  const { data, meta } = extractPaginatedData(payload)
  const mappedData = data.map((item) =>
    mapSuratKeluarFromApi(suratKeluarApiSchema.parse(item))
  )
  return {
    data: mappedData,
    meta: normalizePaginationMeta(meta, mappedData.length),
  }
}

export function parseDashboardMetrics(payload: unknown): DashboardMetrics {
  const raw = parseApiResponse(dashboardMetricsApiSchema, payload)
  return normalizeDashboardMetrics(raw)
}

export function parseApiResponse<T extends z.ZodTypeAny>(
  schema: T,
  payload: unknown
): z.infer<T> {
  const unionSchema = z.union([
    apiResponseSchema(schema),
    z.object({ data: schema }).passthrough(),
    schema,
  ])

  const parsed = unionSchema.parse(payload)

  if (typeof parsed === 'object' && parsed !== null && 'data' in parsed) {
    return (parsed as { data: z.infer<T> }).data
  }

  return parsed as z.infer<T>
}
