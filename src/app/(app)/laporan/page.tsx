'use client'

import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { reportsService } from '@/lib/api/services'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import { Download, Filter } from 'lucide-react'

const MONTHS = [
  { value: '01', label: 'Januari' },
  { value: '02', label: 'Februari' },
  { value: '03', label: 'Maret' },
  { value: '04', label: 'April' },
  { value: '05', label: 'Mei' },
  { value: '06', label: 'Juni' },
  { value: '07', label: 'Juli' },
  { value: '08', label: 'Agustus' },
  { value: '09', label: 'September' },
  { value: '10', label: 'Oktober' },
  { value: '11', label: 'November' },
  { value: '12', label: 'Desember' },
]

const CURRENT_YEAR = new Date().getFullYear()
const CURRENT_MONTH = new Date().getMonth() + 1

const ENTITY_OPTIONS = [
  { value: 'all', label: 'Semua Surat' },
  { value: 'incoming', label: 'Surat Masuk' },
  { value: 'outgoing', label: 'Surat Keluar' },
]

type ReportFilters = {
  period: 'monthly' | 'yearly'
  month: string
  year: string
  entity: 'all' | 'incoming' | 'outgoing'
}

export default function LaporanPage() {
  const [isExporting, setIsExporting] = useState(false)
  const [filters, setFilters] = useState<ReportFilters>({
    period: 'monthly',
    month: String(CURRENT_MONTH).padStart(2, '0'),
    year: String(CURRENT_YEAR),
    entity: 'all',
  })

  const years = useMemo(() => {
    return Array.from({ length: 6 }, (_, index) =>
      String(CURRENT_YEAR - index)
    )
  }, [])

  const apiParams = useMemo(() => {
    const base = {
      period: filters.period,
      year: filters.year,
    } as Record<string, string>

    if (filters.period === 'monthly') {
      base.month = filters.month
    }

    if (filters.entity !== 'all') {
      base.entity = filters.entity
    }

    return base
  }, [filters])

  const { data: report, isLoading } = useQuery({
    queryKey: ['reports-summary', apiParams],
    queryFn: () => reportsService.getSummary(apiParams),
  })

  const chartData = report?.charts ?? []
  const totalIncoming = chartData.reduce(
    (sum, item) => sum + item.surat_masuk,
    0
  )
  const totalOutgoing = chartData.reduce(
    (sum, item) => sum + item.surat_keluar,
    0
  )

  const handleExport = async () => {
    try {
      setIsExporting(true)
      const blob = await reportsService.exportReport(apiParams)
      const fileURL = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = fileURL
      link.download = 'laporan-e-arsip.pdf'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(fileURL)
      toast.success('Laporan berhasil diunduh')
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Gagal mengekspor laporan'
      toast.error(message || 'Gagal mengekspor laporan')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="w-full min-w-0 space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Laporan</h1>
          <p className="text-muted-foreground">
            Ringkasan performa surat masuk dan surat keluar
          </p>
        </div>
        <Button onClick={handleExport} disabled={isExporting}>
          <Download className="mr-2 h-4 w-4" />
          {isExporting ? 'Mengunduh...' : 'Unduh Laporan'}
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Filter className="h-4 w-4" />
            <span>Filter laporan</span>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Select
              value={filters.period}
              onValueChange={(value: ReportFilters['period']) =>
                setFilters((prev) => ({ ...prev, period: value }))
              }
            >
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Periode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Bulanan</SelectItem>
                <SelectItem value="yearly">Tahunan</SelectItem>
              </SelectContent>
            </Select>

            {filters.period === 'monthly' && (
              <Select
                value={filters.month}
                onValueChange={(value) =>
                  setFilters((prev) => ({ ...prev, month: value }))
                }
              >
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Pilih bulan" />
                </SelectTrigger>
                <SelectContent>
                  {MONTHS.map((month) => (
                    <SelectItem key={month.value} value={month.value}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            <Select
              value={filters.year}
              onValueChange={(value) =>
                setFilters((prev) => ({ ...prev, year: value }))
              }
            >
              <SelectTrigger className="w-full sm:w-32">
                <SelectValue placeholder="Pilih tahun" />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={year}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.entity}
              onValueChange={(value: ReportFilters['entity']) =>
                setFilters((prev) => ({ ...prev, entity: value }))
              }
            >
              <SelectTrigger className="w-full sm:w-44">
                <SelectValue placeholder="Jenis surat" />
              </SelectTrigger>
              <SelectContent>
                {ENTITY_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Total Surat Masuk</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-10 w-24" />
            ) : (
              <p className="text-3xl font-bold">{totalIncoming}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Surat Keluar</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-10 w-24" />
            ) : (
              <p className="text-3xl font-bold">{totalOutgoing}</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tren Surat</CardTitle>
        </CardHeader>
        <CardContent className="h-80">
          {isLoading ? (
            <Skeleton className="h-full w-full" />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="surat_masuk" name="Surat Masuk" fill="#3182CE" />
                <Bar dataKey="surat_keluar" name="Surat Keluar" fill="#38A169" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ringkasan</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ) : (
            <p className="text-muted-foreground leading-relaxed">
              {report?.summary ??
                'Ringkasan laporan tidak tersedia untuk filter yang dipilih.'}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
