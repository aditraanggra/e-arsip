import { z } from 'zod'

// Auth schemas
export const loginSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
})

export const userSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email(),
  role: z.string().optional(),
  created_at: z.string(),
  updated_at: z.string(),
})

// Category schema
export const categorySchema = z.object({
  id: z.number(),
  name: z.string(),
  desc: z.string().optional(),
})

const categorySummarySchema = z.object({
  id: z.number(),
  name: z.string(),
})

// Surat Masuk schema
export const suratMasukSchema = z.object({
  id: z.number(),
  nomor_surat: z.string(),
  perihal: z.string(),
  pengirim: z.string(),
  tanggal: z.string(),
  tanggal_diterima: z.string(),
  keterangan: z.string().optional().nullable(),
  file_path: z.string().optional().nullable(),
  category_id: z.number(),
  category: categorySummarySchema,
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
})

export const suratMasukCreateSchema = z.object({
  nomor_surat: z.string(),
  perihal: z.string(),
  pengirim: z.string(),
  tanggal: z.string(),
  tanggal_diterima: z.string(),
  keterangan: z.string().optional(),
  file_path: z.string().optional(),
  category_id: z.number(),
})

// Surat Keluar schema
export const suratKeluarSchema = z.object({
  id: z.number(),
  nomor_surat: z.string(),
  perihal: z.string(),
  tujuan: z.string(),
  tanggal: z.string(),
  keterangan: z.string().optional().nullable(),
  file_path: z.string().optional().nullable(),
  category_id: z.number(),
  category: categorySummarySchema,
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
})

export const suratKeluarCreateSchema = z.object({
  nomor_surat: z.string(),
  perihal: z.string(),
  tujuan: z.string(),
  tanggal: z.string(),
  keterangan: z.string().optional(),
  file_path: z.string().optional(),
  category_id: z.number(),
})

// API Response schemas
export const paginationMetaSchema = z.object({
  current_page: z.number(),
  per_page: z.number(),
  total: z.number(),
  last_page: z.number(),
  from: z.number().nullable(),
  to: z.number().nullable(),
})

export const paginatedResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    data: z.array(dataSchema),
    meta: paginationMetaSchema,
  })

export const apiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    data: dataSchema,
    message: z.string().optional(),
  })

// Dashboard metrics schema
export const dashboardMetricsSchema = z.object({
  total_surat_masuk: z.number(),
  total_surat_keluar: z.number(),
  surat_masuk_bulan_ini: z.number(),
  surat_keluar_bulan_ini: z.number(),
  chart_data: z.array(z.object({
    date: z.string(),
    surat_masuk: z.number(),
    surat_keluar: z.number(),
  })),
})

// Reports schema
export const reportChartPointSchema = z.object({
  date: z.string(),
  surat_masuk: z.number(),
  surat_keluar: z.number(),
})

export const reportsSummarySchema = z.object({
  summary: z.string(),
  charts: z.array(reportChartPointSchema),
})

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
export type ReportChartPoint = z.infer<typeof reportChartPointSchema>
export type ReportsSummary = z.infer<typeof reportsSummarySchema>
