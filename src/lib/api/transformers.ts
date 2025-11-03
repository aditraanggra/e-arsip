import {
  apiResponseSchema,
  paginatedResponseSchema,
  suratMasukApiSchema,
  suratMasukSchema,
  suratKeluarApiSchema,
  suratKeluarSchema,
  type PaginatedResponse,
  type SuratMasuk,
  type SuratMasukCreate,
  type SuratKeluar,
  type SuratKeluarCreate,
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

export function mapSuratMasukFromApi(
  raw: z.infer<typeof suratMasukApiSchema>
): SuratMasuk {
  const mapped = {
    id: raw.id,
    nomor_surat: raw.no_letter,
    perihal: raw.subject,
    pengirim: fallbackString(raw.sender),
    tanggal: toIsoJakarta(raw.date_letter),
    tanggal_diterima: toIsoJakarta(raw.date_agenda),
    keterangan: raw.desc_disposition ?? raw.dept_disposition ?? null,
    file_path: pickFilePath(raw),
    category_id: raw.category_id,
    category: raw.category ?? null,
    district: raw.district ?? null,
    village: raw.village ?? null,
    no_agenda: raw.no_agenda ?? null,
    contact: raw.contact ?? null,
    address: raw.address ?? null,
    dept_disposition: raw.dept_disposition ?? null,
    desc_disposition: raw.desc_disposition ?? null,
    created_at: raw.created_at,
    updated_at: raw.updated_at,
  }

  return suratMasukSchema.parse(mapped)
}

export function mapSuratKeluarFromApi(
  raw: z.infer<typeof suratKeluarApiSchema>
): SuratKeluar {
  const mapped = {
    id: raw.id,
    nomor_surat: raw.no_letter,
    perihal: raw.subject,
    tujuan: fallbackString(raw.to_letter),
    tanggal: toIsoJakarta(raw.date_letter),
    keterangan: raw.body ?? null,
    file_path: pickFilePath(raw),
    file: raw.file ?? null,
    category_id: raw.category_id,
    category: raw.category ?? null,
    created_at: raw.created_at,
    updated_at: raw.updated_at,
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
  const parsed = paginatedResponseSchema(suratMasukApiSchema).parse(payload)
  return {
    data: parsed.data.map(mapSuratMasukFromApi),
    meta: parsed.meta,
  }
}

export function parsePaginatedSuratKeluar(
  payload: unknown
): PaginatedResponse<SuratKeluar> {
  const parsed = paginatedResponseSchema(suratKeluarApiSchema).parse(payload)
  return {
    data: parsed.data.map(mapSuratKeluarFromApi),
    meta: parsed.meta,
  }
}

export function parseApiResponse<T extends z.ZodTypeAny>(
  schema: T,
  payload: unknown
): z.infer<T> {
  const unionSchema = z
    .union([
      apiResponseSchema(schema),
      z.object({ data: schema }).strict(),
      schema,
    ])
    .transform((value) => {
      if ('data' in value) {
        return value.data
      }
      return value
    })

  return unionSchema.parse(payload)
}
