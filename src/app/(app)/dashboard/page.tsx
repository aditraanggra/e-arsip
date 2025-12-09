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
import {
  Mail,
  Send,
  TrendingUp,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react'
import Link from 'next/link'

// Custom Tooltip untuk Bar Chart
const CustomBarTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: Array<{ name: string; value: number; color: string }>
  label?: string
}) => {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
          padding: '12px 16px',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
        }}
      >
        <p
          style={{
            margin: 0,
            fontWeight: 600,
            color: '#1f2937',
            marginBottom: '8px',
          }}
        >
          {label}
        </p>
        {payload.map((entry, index) => (
          <div
            key={index}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginTop: '4px',
            }}
          >
            <div
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: entry.color,
              }}
            />
            <span style={{ color: '#6b7280', fontSize: '14px' }}>
              {entry.name}:
            </span>
            <span
              style={{ fontWeight: 600, color: '#1f2937', fontSize: '14px' }}
            >
              {entry.value}
            </span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

// Custom Tooltip untuk Pie Chart
const CustomPieTooltip = ({
  active,
  payload,
}: {
  active?: boolean
  payload?: Array<{ name: string; value: number; payload: { fill: string } }>
}) => {
  if (active && payload && payload.length) {
    const data = payload[0]
    return (
      <div
        style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
          padding: '12px 16px',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: data.payload.fill,
            }}
          />
          <span style={{ color: '#6b7280', fontSize: '14px' }}>
            {data.name}:
          </span>
          <span style={{ fontWeight: 600, color: '#1f2937', fontSize: '14px' }}>
            {data.value}
          </span>
        </div>
      </div>
    )
  }
  return null
}

export default function DashboardPage() {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: () => dashboardService.getMetrics(),
    staleTime: 60_000,
  })

  // Warna sesuai permintaan: #259148 (hijau) dan #fdc727 (kuning)
  const CHART_COLORS = {
    suratMasuk: '#259148',
    suratKeluar: '#fdc727',
  }

  const PIE_COLORS = ['#259148', '#fdc727']

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
    (monthlySummary?.surat_masuk ?? 0) + (monthlySummary?.surat_keluar ?? 0)

  return (
    <div className='w-full min-w-0 space-y-6'>
      <div className='flex flex-col gap-1'>
        <h1 className='text-2xl font-bold text-foreground lg:text-3xl'>
          Dashboard
        </h1>
        <p className='text-muted-foreground'>
          Monitor aktivitas surat masuk dan keluar secara real-time
        </p>
      </div>

      <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
        <Card>
          <CardContent className='pt-6'>
            <div className='flex items-start justify-between'>
              <div>
                <p className='text-sm font-medium text-muted-foreground'>
                  Total Surat Masuk
                </p>
                {isLoading ? (
                  <Skeleton className='h-9 w-24 mt-2' />
                ) : (
                  <p className='text-3xl font-bold text-foreground mt-1'>
                    {metrics?.total_surat_masuk ?? '—'}
                  </p>
                )}
                {/* TODO: Calculate actual trend from API data */}{' '}
              </div>
              <div className='flex h-12 w-12 items-center justify-center rounded-2xl bg-[#259148]/10'>
                <Mail className='h-6 w-6 text-[#259148]' />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='pt-6'>
            <div className='flex items-start justify-between'>
              <div>
                <p className='text-sm font-medium text-muted-foreground'>
                  Total Surat Keluar
                </p>
                {isLoading ? (
                  <Skeleton className='h-9 w-24 mt-2' />
                ) : (
                  <p className='text-3xl font-bold text-foreground mt-1'>
                    {metrics?.total_surat_keluar ?? '—'}
                  </p>
                )}
                <div className='flex items-center gap-1 mt-2'>
                  <ArrowUpRight className='h-4 w-4 text-[#259148]' />
                  <span className='text-xs font-medium text-[#259148]'>
                    +8%
                  </span>
                  <span className='text-xs text-muted-foreground'>
                    dari bulan lalu
                  </span>
                </div>
              </div>
              <div className='flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fdc727]/10'>
                <Send className='h-6 w-6 text-[#d4a520]' />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='pt-6'>
            <div className='flex items-start justify-between'>
              <div>
                <p className='text-sm font-medium text-muted-foreground'>
                  Bulan Ini
                </p>
                {isLoading ? (
                  <Skeleton className='h-9 w-24 mt-2' />
                ) : (
                  <p className='text-3xl font-bold text-foreground mt-1'>
                    {totalThisMonth}
                  </p>
                )}
                <div className='flex items-center gap-2 mt-2 text-xs text-muted-foreground'>
                  <span className='px-2 py-0.5 rounded-md bg-[#259148]/10 text-[#259148] font-medium'>
                    {monthlySummary?.surat_masuk ?? 0} masuk
                  </span>
                  <span className='px-2 py-0.5 rounded-md bg-[#fdc727]/20 text-[#b8941c] font-medium'>
                    {monthlySummary?.surat_keluar ?? 0} keluar
                  </span>
                </div>
              </div>
              <div className='flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10'>
                <Calendar className='h-6 w-6 text-blue-500' />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='pt-6'>
            <div className='flex items-start justify-between'>
              <div>
                <p className='text-sm font-medium text-muted-foreground'>
                  Hari Ini
                </p>
                {isLoading ? (
                  <Skeleton className='h-9 w-24 mt-2' />
                ) : (
                  <p className='text-3xl font-bold text-foreground mt-1'>
                    {dailySummary?.total ??
                      (dailySummary?.surat_masuk ?? 0) +
                        (dailySummary?.surat_keluar ?? 0)}
                  </p>
                )}
                <div className='flex items-center gap-1 mt-2'>
                  <ArrowDownRight className='h-4 w-4 text-orange-500' />
                  <span className='text-xs font-medium text-orange-500'>
                    -3%
                  </span>
                  <span className='text-xs text-muted-foreground'>
                    dari kemarin
                  </span>
                </div>
              </div>
              <div className='flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500/10'>
                <TrendingUp className='h-6 w-6 text-orange-500' />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className='grid gap-4 xl:grid-cols-12'>
        <Card className='xl:col-span-8'>
          <CardHeader>
            <CardTitle>Aktivitas 30 Hari Terakhir</CardTitle>
            <p className='text-sm text-muted-foreground'>
              Tren surat masuk dan keluar harian
            </p>
          </CardHeader>
          <CardContent className='h-[360px]'>
            {isLoading ? (
              <div className='flex h-full items-center justify-center'>
                <Skeleton className='h-full w-full rounded-xl' />
              </div>
            ) : (
              <ResponsiveContainer width='100%' height='100%'>
                <BarChart
                  data={chartData}
                  margin={{ top: 20, right: 20, left: 0, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray='3 3'
                    stroke='#e5e7eb'
                    vertical={false}
                  />
                  <XAxis
                    dataKey='date'
                    tick={{ fill: '#6b7280', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: '#6b7280', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    content={<CustomBarTooltip />}
                    cursor={{ fill: 'rgba(37, 145, 72, 0.08)' }}
                  />
                  <Legend
                    verticalAlign='top'
                    height={36}
                    iconType='circle'
                    formatter={(value) => (
                      <span style={{ color: '#6b7280', fontSize: '13px' }}>
                        {value}
                      </span>
                    )}
                  />
                  <Bar
                    dataKey='surat_keluar'
                    name='Surat Keluar'
                    radius={[4, 4, 0, 0]}
                    fill={CHART_COLORS.suratKeluar}
                  />
                  <Bar
                    dataKey='surat_masuk'
                    name='Surat Masuk'
                    radius={[4, 4, 0, 0]}
                    fill={CHART_COLORS.suratMasuk}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className='xl:col-span-4'>
          <CardHeader>
            <CardTitle>Distribusi Surat</CardTitle>
            <p className='text-sm text-muted-foreground'>
              Proporsi surat masuk vs keluar
            </p>
          </CardHeader>
          <CardContent className='h-[360px]'>
            {isLoading ? (
              <div className='flex h-full items-center justify-center'>
                <Skeleton className='h-full w-full rounded-xl' />
              </div>
            ) : (
              <ResponsiveContainer width='100%' height='100%'>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx='50%'
                    cy='50%'
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={4}
                    dataKey='count'
                    nameKey='name'
                    label={({ percent }: { percent?: number }) => {
                      const percentValue =
                        typeof percent === 'number' ? percent : 0
                      return `${(percentValue * 100).toFixed(0)}%`
                    }}
                    labelLine={false}
                  >
                    {pieData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={PIE_COLORS[index % PIE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomPieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            )}
            {!isLoading && pieData.length > 0 && (
              <div className='flex justify-center gap-6 -mt-4'>
                {pieData.map((entry, index) => (
                  <div key={entry.name} className='flex items-center gap-2'>
                    <div
                      className='h-3 w-3 rounded-full'
                      style={{
                        backgroundColor: PIE_COLORS[index % PIE_COLORS.length],
                      }}
                    />
                    <span className='text-sm text-muted-foreground'>
                      {entry.name}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className='grid gap-4 md:grid-cols-3'>
        <Card className='bg-gradient-to-br from-[#259148]/10 to-[#259148]/5 border-[#259148]/20'>
          <CardContent className='pt-6'>
            <h3 className='font-semibold text-foreground'>Surat Masuk Baru</h3>
            <p className='text-sm text-muted-foreground mt-1'>
              Catat surat masuk yang baru diterima
            </p>
            <Link
              href='/surat-masuk/create'
              className='inline-flex items-center gap-1 text-sm font-medium text-[#259148] mt-3 hover:underline'
            >
              Tambah Surat <ArrowUpRight className='h-4 w-4' />
            </Link>
          </CardContent>
        </Card>

        <Card className='bg-gradient-to-br from-[#fdc727]/10 to-[#fdc727]/5 border-[#fdc727]/30'>
          <CardContent className='pt-6'>
            <h3 className='font-semibold text-foreground'>Surat Keluar Baru</h3>
            <p className='text-sm text-muted-foreground mt-1'>
              Buat dan catat surat keluar baru
            </p>
            <Link
              href='/surat-keluar/create'
              className='inline-flex items-center gap-1 text-sm font-medium text-[#b8941c] mt-3 hover:underline'
            >
              Tambah Surat <ArrowUpRight className='h-4 w-4' />
            </Link>
          </CardContent>
        </Card>

        <Card className='bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20'>
          <CardContent className='pt-6'>
            <h3 className='font-semibold text-foreground'>Lihat Laporan</h3>
            <p className='text-sm text-muted-foreground mt-1'>
              Analisis dan ekspor data arsip
            </p>
            <Link
              href='/laporan'
              className='inline-flex items-center gap-1 text-sm font-medium text-blue-600 mt-3 hover:underline'
            >
              Buka Laporan <ArrowUpRight className='h-4 w-4' />
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
