import { z } from 'zod'

// Auth schemas
export const loginSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
}).strict()

export const userSchema = z
  .object({
    id: z.number(),
    name: z.string(),
    email: z.string().email(),
    role: z.string().optional(),
    email_verified_at: z.string().nullable().optional(),
    created_at: z.string(),
    updated_at: z.string(),
  })
  .strict()

// Category schema
export const categorySchema = z
  .object({
    id: z.number(),
    name: z.string(),
    desc: z.string().optional(),
    description: z.string().optional(),
  })
  .passthrough()

const categorySummarySchema = z
  .object({
    id: z.number(),
    name: z.string(),
  })
  .strict()

const categorySummaryApiSchema = z
  .object({
    id: z.coerce.number().optional(),
    name: z.string().optional(),
    nama: z.string().optional(),
  })
  .passthrough()

// Raw API schemas (Laravel & production)
export const suratMasukApiSchema = z
  .object({
    id: z.coerce.number(),
    category_id: z.coerce.number().optional(),
    category: categorySummaryApiSchema.nullable().optional(),
    kategori: categorySummaryApiSchema.nullable().optional(),
  })
  .passthrough()

export const suratKeluarApiSchema = z
  .object({
    id: z.coerce.number(),
    category_id: z.coerce.number().optional(),
    category: categorySummaryApiSchema.nullable().optional(),
    kategori: categorySummaryApiSchema.nullable().optional(),
  })
  .passthrough()

// Surat Masuk schema
export const suratMasukSchema = z.object({
  id: z.number(),
  nomor_surat: z.string(),
  perihal: z.string(),
  pengirim: z.string().nullable().default(''),
  tanggal: z.string(),
  tanggal_diterima: z.string(),
  keterangan: z.string().optional().nullable(),
  file_path: z.string().optional().nullable(),
  category_id: z.number(),
  category: categorySummarySchema.nullable().optional(),
  district: z.string().nullable().optional(),
  village: z.string().nullable().optional(),
  no_agenda: z.string().nullable().optional(),
  contact: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  dept_disposition: z.string().nullable().optional(),
  desc_disposition: z.string().nullable().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
}).strict()

export const suratMasukCreateSchema = z.object({
  nomor_surat: z.string(),
  perihal: z.string(),
  pengirim: z.string(),
  tanggal: z.string(),
  tanggal_diterima: z.string(),
  keterangan: z.string().optional(),
  file_path: z.string().optional(),
  category_id: z.number(),
}).strict()

// Surat Keluar schema
export const suratKeluarSchema = z.object({
  id: z.number(),
  nomor_surat: z.string(),
  perihal: z.string(),
  tujuan: z.string().nullable().default(''),
  tanggal: z.string(),
  keterangan: z.string().optional().nullable(),
  file_path: z.string().optional().nullable(),
  category_id: z.number(),
  category: categorySummarySchema.nullable().optional(),
  file: z.string().nullable().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
}).strict()

export const suratKeluarCreateSchema = z.object({
  nomor_surat: z.string(),
  perihal: z.string(),
  tujuan: z.string(),
  tanggal: z.string(),
  keterangan: z.string().optional(),
  file_path: z.string().optional(),
  category_id: z.number(),
}).strict()

// API Response schemas
export const paginationMetaSchema = z
  .object({
    current_page: z.coerce.number().optional(),
    per_page: z.coerce.number().optional(),
    total: z.coerce.number().optional(),
    last_page: z.coerce.number().optional(),
    from: z.coerce.number().nullable().optional(),
    to: z.coerce.number().nullable().optional(),
  })
  .passthrough()

export const paginatedResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z
    .object({
      data: z.array(dataSchema).optional(),
      meta: paginationMetaSchema.optional(),
    })
    .passthrough()

export const apiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z
    .object({
      data: dataSchema,
      message: z.string().optional(),
    })
    .passthrough()

// Dashboard metrics schema
export const dashboardMetricsSchema = z
  .object({
    total_surat_masuk: z.number(),
    total_surat_keluar: z.number(),
    surat_masuk_bulan_ini: z.number(),
    surat_keluar_bulan_ini: z.number(),
    chart_data: z.array(
      z.object({
        date: z.string(),
        surat_masuk: z.number(),
        surat_keluar: z.number(),
      })
    ),
  })
  .strict()

export const dashboardChartPointApiSchema = z
  .object({
    date: z.string().optional(),
    label: z.string().optional(),
    day: z.string().optional(),
    period: z.string().optional(),
    surat_masuk: z.coerce.number().optional(),
    surat_keluar: z.coerce.number().optional(),
    incoming: z.coerce.number().optional(),
    outgoing: z.coerce.number().optional(),
    incoming_total: z.coerce.number().optional(),
    outgoing_total: z.coerce.number().optional(),
  })
  .passthrough()

export const dashboardMetricsApiSchema = z
  .object({
    total_surat_masuk: z.coerce.number().optional(),
    total_surat_keluar: z.coerce.number().optional(),
    surat_masuk_bulan_ini: z.coerce.number().optional(),
    surat_keluar_bulan_ini: z.coerce.number().optional(),
    total_incoming: z.coerce.number().optional(),
    total_outgoing: z.coerce.number().optional(),
    incoming_letters: z.coerce.number().optional(),
    outgoing_letters: z.coerce.number().optional(),
    incoming_this_month: z.coerce.number().optional(),
    outgoing_this_month: z.coerce.number().optional(),
    surat_masuk_bulan: z.coerce.number().optional(),
    surat_keluar_bulan: z.coerce.number().optional(),
    chart_data: z.array(dashboardChartPointApiSchema).optional(),
    charts: z.array(dashboardChartPointApiSchema).optional(),
  })
  .passthrough()

// Reports schema
export const reportChartPointSchema = z.object({
  date: z.string(),
  surat_masuk: z.number(),
  surat_keluar: z.number(),
}).strict()

export const reportsSummarySchema = z.object({
  summary: z.string(),
  charts: z.array(reportChartPointSchema),
}).strict()

// Export types
export type LoginData = z.infer<typeof loginSchema>
export type User = z.infer<typeof userSchema>
export type Category = z.infer<typeof categorySchema>
export type SuratMasuk = z.infer<typeof suratMasukSchema>
export type SuratMasukCreate = z.infer<typeof suratMasukCreateSchema>
export type SuratKeluar = z.infer<typeof suratKeluarSchema>
export type SuratKeluarCreate = z.infer<typeof suratKeluarCreateSchema>
export type PaginationMeta = z.infer<typeof paginationMetaSchema>
export type PaginatedResponse<T> = {
  data: T[]
  meta: PaginationMeta
}
export type ApiResponse<T> = {
  data: T
  message?: string
}
export type DashboardMetrics = z.infer<typeof dashboardMetricsSchema>
export type DashboardChartPointApi = z.infer<typeof dashboardChartPointApiSchema>
export type DashboardMetricsApi = z.infer<typeof dashboardMetricsApiSchema>
export type ReportChartPoint = z.infer<typeof reportChartPointSchema>
export type ReportsSummary = z.infer<typeof reportsSummarySchema>
