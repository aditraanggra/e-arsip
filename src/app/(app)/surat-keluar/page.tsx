'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { suratKeluarService, categoriesService } from '@/lib/api/services'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Plus, Search, FileText, Trash, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'

export default function SuratKeluarPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const page = Number(searchParams.get('page') || '1')
  const perPage = Number(
    searchParams.get('per_page') ||
      process.env.NEXT_PUBLIC_DEFAULT_PAGE_SIZE ||
      '10'
  )
  const search = searchParams.get('q') || ''
  const categoryIdParam = searchParams.get('category_id')
  const categoryIdNumber = categoryIdParam ? Number(categoryIdParam) : undefined
  const categoryFilter = Number.isNaN(categoryIdNumber)
    ? undefined
    : categoryIdNumber
  const dateFromParam = searchParams.get('date_from') || ''
  const dateToParam = searchParams.get('date_to') || ''

  const [searchInput, setSearchInput] = useState(search)
  const [selectedCategory, setSelectedCategory] = useState(categoryIdParam ?? 'all')
  const [dateFromInput, setDateFromInput] = useState(dateFromParam)
  const [dateToInput, setDateToInput] = useState(dateToParam)

  const { data: suratKeluarData, isLoading: isLoadingSuratKeluar } = useQuery({
    queryKey: [
      'surat-keluar',
      page,
      perPage,
      search,
      categoryIdParam ?? 'all',
      dateFromParam,
      dateToParam,
    ],
    queryFn: () =>
      suratKeluarService.getAll({
        page,
        per_page: perPage,
        q: search,
        category_id: categoryFilter,
        date_from: dateFromParam || undefined,
        date_to: dateToParam || undefined,
      }),
  })

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesService.getAll(),
  })

  useEffect(() => {
    setSearchInput(search)
  }, [search])

  useEffect(() => {
    setSelectedCategory(categoryIdParam ?? 'all')
  }, [categoryIdParam])

  useEffect(() => {
    setDateFromInput(dateFromParam)
    setDateToInput(dateToParam)
  }, [dateFromParam, dateToParam])

  const handleSearch = () => {
    const params = new URLSearchParams()
    params.set('page', '1')
    params.set('per_page', perPage.toString())

    if (searchInput) params.set('q', searchInput)
    if (selectedCategory && selectedCategory !== 'all') {
      params.set('category_id', selectedCategory)
    }
    if (dateFromInput) params.set('date_from', dateFromInput)
    if (dateToInput) params.set('date_to', dateToInput)

    router.push(`/surat-keluar?${params.toString()}`)
  }

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', newPage.toString())
    router.push(`/surat-keluar?${params.toString()}`)
  }

  const handleDelete = async (id: number) => {
    if (confirm('Apakah Anda yakin ingin menghapus surat ini?')) {
      try {
        await suratKeluarService.delete(id)
        toast.success('Surat keluar berhasil dihapus')
        router.refresh()
      } catch (error: unknown) {
        const message =
          error instanceof Error
            ? error.message
            : 'Gagal menghapus surat keluar'
        toast.error(message || 'Gagal menghapus surat keluar')
      }
    }
  }

  return (
    <div className="w-full min-w-0 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Surat Keluar</h1>
          <p className="text-muted-foreground">
            Kelola arsip surat keluar organisasi
          </p>
        </div>
        <Button asChild disabled>
          <Link href="#">
            <Plus className="mr-2 h-4 w-4" />
            Tambah Surat
          </Link>
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Cari nomor, perihal, atau tujuan surat..."
              className="pl-8"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
        </div>
        <div className="w-full sm:w-64">
          <Select
            value={selectedCategory}
            onValueChange={(value) => setSelectedCategory(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter Kategori" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Kategori</SelectItem>
              {categories?.map((category) => (
                <SelectItem key={category.id} value={category.id.toString()}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={handleSearch}>Filter</Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          type="date"
          value={dateFromInput}
          onChange={(event) => setDateFromInput(event.target.value)}
          placeholder="Tanggal dari"
        />
        <Input
          type="date"
          value={dateToInput}
          onChange={(event) => setDateToInput(event.target.value)}
          placeholder="Tanggal sampai"
        />
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tanggal</TableHead>
              <TableHead>No. Surat</TableHead>
              <TableHead>Perihal</TableHead>
              <TableHead>Tujuan</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoadingSuratKeluar ? (
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Skeleton className="h-4 w-40" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-32" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-8 w-28 ml-auto" />
                  </TableCell>
                </TableRow>
              ))
            ) : suratKeluarData?.data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <FileText className="h-12 w-12 mb-2" />
                    <p>Tidak ada data surat keluar</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              suratKeluarData?.data.map((surat) => (
                <TableRow key={surat.id}>
                  <TableCell>
                    {surat.tanggal
                      ? new Date(surat.tanggal).toLocaleDateString('id-ID')
                      : '-'}
                  </TableCell>
                  <TableCell>{surat.nomor_surat}</TableCell>
                  <TableCell>{surat.perihal}</TableCell>
                  <TableCell>{surat.tujuan || '-'}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {surat.category?.name || `#${surat.category_id}`}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {surat.file_path && (
                        <Button variant="ghost" size="icon" asChild>
                          <a
                            href={surat.file_path}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Lihat dokumen surat"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(surat.id)}
                        aria-label="Hapus surat"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {suratKeluarData?.meta && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Menampilkan {(suratKeluarData.meta?.from ?? 0)} -{' '}
            {(suratKeluarData.meta?.to ?? 0)} dari {(suratKeluarData.meta?.total ?? 0)} data
          </p>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(page - 1)}
              disabled={page <= 1}
            >
              Sebelumnya
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(page + 1)}
              disabled={page >= (suratKeluarData.meta?.last_page ?? page)}
            >
              Selanjutnya
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
