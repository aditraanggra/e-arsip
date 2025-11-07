'use client'

import { useQuery } from '@tanstack/react-query'
import { dashboardService } from '@/lib/api/services'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { Mail, Send, Sparkles, TrendingUp } from 'lucide-react'

export default function DashboardPage() {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: () => dashboardService.getMetrics(),
    staleTime: 60_000,
  })

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

  const chartData = metrics?.harian_30_hari ?? []
  const monthlySummary = metrics?.bulan_ini
  const dailySummary = metrics?.hari_ini

  const pieData = chartData.length
    ? [
        {
          name: 'Surat Masuk',
          count: chartData.reduce((sum, d) => sum + (d.surat_masuk || 0), 0),
        },
        {
          name: 'Surat Keluar',
          count: chartData.reduce((sum, d) => sum + (d.surat_keluar || 0), 0),
        },
      ]
    : []

  const totalThisMonth =
    monthlySummary?.total ??
    ((monthlySummary?.surat_masuk ?? 0) + (monthlySummary?.surat_keluar ?? 0))

  return (
    <div className="w-full min-w-0 space-y-6 xl:space-y-8">
      <div className="flex flex-col gap-2">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-100/70 bg-emerald-50/60 px-3 py-1 text-sm font-medium text-emerald-700 w-fit">
          <Sparkles className="h-4 w-4" />
          Ringkasan Arsip Terkini
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-emerald-900 lg:text-4xl">Dashboard</h1>
        <p className="text-muted-foreground max-w-3xl">
          Monitor aktivitas surat masuk dan keluar secara real-time dengan tampilan adaptif untuk semua ukuran layar.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-5">
        <Card className="border-none bg-white/90 shadow-sm ring-1 ring-emerald-100">
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
            <div>
              <span className="text-xs uppercase tracking-wide text-emerald-600">Total</span>
              <CardTitle className="mt-1 text-base font-semibold text-emerald-900">
                Surat Masuk
              </CardTitle>
            </div>
            <div className="rounded-full bg-emerald-100 p-2 text-emerald-700">
              <Mail className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <p className="text-3xl font-semibold text-emerald-900">
                {metrics?.total_surat_masuk ?? '—'}
              </p>
            )}
            <p className="mt-2 text-xs text-muted-foreground">
              Akumulasi surat masuk sepanjang periode berjalan.
            </p>
          </CardContent>
        </Card>

        <Card className="border-none bg-white/90 shadow-sm ring-1 ring-emerald-100">
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
            <div>
              <span className="text-xs uppercase tracking-wide text-emerald-600">Total</span>
              <CardTitle className="mt-1 text-base font-semibold text-emerald-900">
                Surat Keluar
              </CardTitle>
            </div>
            <div className="rounded-full bg-emerald-100 p-2 text-emerald-700">
              <Send className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <p className="text-3xl font-semibold text-emerald-900">
                {metrics?.total_surat_keluar ?? '—'}
              </p>
            )}
            <p className="mt-2 text-xs text-muted-foreground">
              Termasuk semua surat keluar yang telah tercatat.
            </p>
          </CardContent>
        </Card>

        <Card className="border-none bg-yellow-50/90 shadow-sm ring-1 ring-yellow-100">
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
            <div>
              <span className="text-xs uppercase tracking-wide text-yellow-600">Bulan ini</span>
              <CardTitle className="mt-1 text-base font-semibold text-yellow-800">
                Aktivitas Surat
              </CardTitle>
            </div>
            <div className="rounded-full bg-yellow-100 p-2 text-yellow-700">
              <TrendingUp className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <p className="text-3xl font-semibold text-yellow-800">{totalThisMonth}</p>
            )}
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-yellow-700">
              <div className="rounded-md bg-yellow-100/80 px-2 py-1">
                Masuk: {monthlySummary?.surat_masuk ?? 0}
              </div>
              <div className="rounded-md bg-yellow-100/80 px-2 py-1">
                Keluar: {monthlySummary?.surat_keluar ?? 0}
              </div>
            </div>
            <div className="mt-3 rounded-md bg-white/70 px-3 py-2 text-xs text-yellow-800">
              Hari ini: {dailySummary?.surat_masuk ?? 0} masuk • {dailySummary?.surat_keluar ?? 0} keluar (total{' '}
              {dailySummary?.total ?? (dailySummary?.surat_masuk ?? 0) + (dailySummary?.surat_keluar ?? 0)})
            </div>
          </CardContent>
        </Card>

        <Card className="border-none bg-white/90 shadow-sm ring-1 ring-emerald-100">
          <CardHeader className="space-y-1 pb-2">
            <span className="text-xs uppercase tracking-wide text-emerald-600">Catatan</span>
            <CardTitle className="text-base font-semibold text-emerald-900">Sorotan Sistem</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p className="rounded-md bg-emerald-50/70 px-3 py-2 text-emerald-700">
              Pastikan data kategori diperbarui agar laporan distribusi tetap akurat.
            </p>
            <p className="rounded-md bg-yellow-50/80 px-3 py-2 text-yellow-700">
              Terapkan filter tanggal untuk melihat performa arsip pada periode tertentu.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-12 2xl:grid-cols-[repeat(12,minmax(0,1fr))] 2xl:gap-6">
        <Card className="xl:col-span-7 2xl:col-span-8 border-none bg-white/95 shadow-sm ring-1 ring-emerald-100">
          <CardHeader>
            <CardTitle className="text-emerald-900">Surat Masuk & Keluar per Hari</CardTitle>
            <p className="text-sm text-muted-foreground">
              Visualisasi tren aktivitas arsip selama 30 hari terakhir.
            </p>
          </CardHeader>
          <CardContent className="h-[360px]">
            {isLoading ? (
              <div className="flex h-full items-center justify-center">
                <Skeleton className="h-full w-full" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                  data={chartData}
                  margin={{
                    top: 24,
                    right: 24,
                    left: 8,
                    bottom: 12,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#dcfce7" />
                  <XAxis dataKey="date" tick={{ fill: '#047857', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#047857', fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip cursor={{ fill: 'rgba(16, 185, 129, 0.08)' }} />
                  <Legend verticalAlign="top" height={36} iconType="circle" />
                  <Bar dataKey="surat_masuk" name="Surat Masuk" radius={[8, 8, 0, 0]} fill="#10b981" />
                  <Bar dataKey="surat_keluar" name="Surat Keluar" radius={[8, 8, 0, 0]} fill="#facc15" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="xl:col-span-5 2xl:col-span-4 border-none bg-white/95 shadow-sm ring-1 ring-emerald-100">
          <CardHeader>
            <CardTitle className="text-emerald-900">Distribusi Kategori</CardTitle>
            <p className="text-sm text-muted-foreground">
              Proporsi surat masuk dan keluar berdasarkan total aktivitas.
            </p>
          </CardHeader>
          <CardContent className="h-[360px]">
            {isLoading ? (
              <div className="flex h-full items-center justify-center">
                <Skeleton className="h-full w-full" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }: { name?: string; percent?: number }) => {
                      const percentValue = typeof percent === 'number' ? percent : 0
                      return `${name ?? 'Total'}: ${(percentValue * 100).toFixed(0)}%`
                    }}
                    outerRadius={110}
                    fill="#10b981"
                    dataKey="count"
                    nameKey="name"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip cursor={{ fill: 'rgba(252, 211, 77, 0.08)' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        <Card className="border-none bg-white/95 shadow-sm ring-1 ring-emerald-100">
          <CardHeader>
            <CardTitle className="text-emerald-900">Panduan Cepat</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="rounded-lg border border-emerald-100 bg-emerald-50/60 p-3 text-emerald-800">
              Gunakan pencarian pada halaman surat untuk menemukan arsip spesifik dengan cepat.
            </div>
            <div className="rounded-lg border border-yellow-100 bg-yellow-50/70 p-3 text-yellow-800">
              Terapkan filter kategori untuk memantau prioritas surat per divisi.
            </div>
            <div className="rounded-lg border border-emerald-100 bg-white/80 p-3 text-muted-foreground">
              Jalankan ekspor laporan pada menu laporan untuk dokumentasi berkala.
            </div>
          </CardContent>
        </Card>

        <Card className="border-none bg-white/95 shadow-sm ring-1 ring-emerald-100 lg:col-span-1 xl:col-span-2 2xl:col-span-3">
          <CardHeader>
            <CardTitle className="text-emerald-900">Langkah Selanjutnya</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <div className="rounded-xl border border-dashed border-emerald-200 bg-emerald-50/50 p-4">
              <h3 className="text-sm font-semibold text-emerald-800">Verifikasi Surat</h3>
              <p className="mt-2 text-xs text-muted-foreground">
                Cek kembali surat yang belum memiliki kategori untuk menjaga data tetap rapi.
              </p>
            </div>
            <div className="rounded-xl border border-dashed border-yellow-200 bg-yellow-50/60 p-4">
              <h3 className="text-sm font-semibold text-yellow-800">Tinjau Laporan</h3>
              <p className="mt-2 text-xs text-muted-foreground">
                Gunakan filter bulanan pada menu laporan untuk memantau kinerja.
              </p>
            </div>
            <div className="rounded-xl border border-dashed border-emerald-200 bg-white/80 p-4">
              <h3 className="text-sm font-semibold text-emerald-800">Perbarui Profil</h3>
              <p className="mt-2 text-xs text-muted-foreground">
                Pastikan informasi user selalu mutakhir demi keamanan akses.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
