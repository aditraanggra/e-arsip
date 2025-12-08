'use client'

import { Fragment, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { useSearchParams, useRouter } from 'next/navigation'
import { suratMasukService, categoriesService } from '@/lib/api/services'
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
import { Plus, Search, FileText, Eye, Edit, Trash } from 'lucide-react'
import { toast } from 'sonner'

export default function SuratMasukPage() {
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
  const districtParam = searchParams.get('district') || ''
  const villageParam = searchParams.get('village') || ''

  const [searchInput, setSearchInput] = useState(search)
  const [selectedCategory, setSelectedCategory] = useState(
    categoryIdParam ?? 'all'
  )
  const [dateFromInput, setDateFromInput] = useState(dateFromParam)
  const [dateToInput, setDateToInput] = useState(dateToParam)
  const [districtInput, setDistrictInput] = useState(districtParam)
  const [villageInput, setVillageInput] = useState(villageParam)

  const {
    data: suratMasukDataRaw,
    isLoading: isLoadingSuratMasuk,
    error,
  } = useQuery({
    queryKey: [
      'surat-masuk',
      page,
      perPage,
      search,
      categoryIdParam ?? 'all',
      dateFromParam,
      dateToParam,
      districtParam,
      villageParam,
    ],
    queryFn: () =>
      suratMasukService.getAll({
        page,
        per_page: perPage,
        q: search,
        category_id: categoryFilter,
        date_from: dateFromParam || undefined,
        date_to: dateToParam || undefined,
        district: districtParam || undefined,
        village: villageParam || undefined,
      }),
  })

  // Log error untuk debugging di production
  useEffect(() => {
    if (error) {
      console.error('[SuratMasuk] Query error:', error)
    }
  }, [error])

  // Parse no_agenda untuk sorting - mendukung format seperti "4521", "4521.A", "4521.B"
  const parseAgendaForSort = (
    agenda: string | number | null | undefined
  ): { num: number; suffix: string } => {
    if (agenda === null || agenda === undefined) {
      return { num: -Infinity, suffix: '' }
    }

    const str = String(agenda)
    // Extract numeric part dan suffix (misal: "4521.A" -> num: 4521, suffix: ".A")
    const match = str.match(/^(\d+)(.*)$/)
    if (match) {
      return { num: parseInt(match[1], 10), suffix: match[2] || '' }
    }

    // Jika tidak ada angka di awal, gunakan string comparison
    return { num: -Infinity, suffix: str }
  }

  // Client-side sorting fallback: urutkan berdasarkan no_agenda descending
  const suratMasukData = useMemo(() => {
    if (!suratMasukDataRaw) return undefined

    const sortedData = [...suratMasukDataRaw.data].sort((a, b) => {
      const agendaA = parseAgendaForSort(a.no_agenda)
      const agendaB = parseAgendaForSort(b.no_agenda)

      // Sort by numeric part first (descending)
      if (agendaB.num !== agendaA.num) {
        return agendaB.num - agendaA.num
      }

      // If numeric part is same, sort by suffix (descending: B > A)
      return agendaB.suffix.localeCompare(agendaA.suffix)
    })

    return {
      ...suratMasukDataRaw,
      data: sortedData,
    }
  }, [suratMasukDataRaw])

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
    setDistrictInput(districtParam)
    setVillageInput(villageParam)
  }, [dateFromParam, dateToParam, districtParam, villageParam])

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
    if (districtInput) params.set('district', districtInput)
    if (villageInput) params.set('village', villageInput)

    router.push(`/surat-masuk?${params.toString()}`)
  }

  const paginationMeta = suratMasukData?.meta
  const currentPage = paginationMeta?.current_page ?? page
  const lastPage = paginationMeta?.last_page ?? currentPage
  const perPageValue = paginationMeta?.per_page ?? perPage

  const handlePageChange = (newPage: number) => {
    const safePage = Math.min(Math.max(newPage, 1), lastPage || 1)
    if (safePage === currentPage) return
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', safePage.toString())
    params.set('per_page', perPageValue.toString())
    // Hapus sort param karena backend tidak mendukung
    params.delete('sort')
    router.push(`/surat-masuk?${params.toString()}`)
  }

  const handleDelete = async (id: number) => {
    if (confirm('Apakah Anda yakin ingin menghapus surat ini?')) {
      try {
        await suratMasukService.delete(id)
        toast.success('Surat berhasil dihapus')
        router.refresh()
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : 'Gagal menghapus surat'
        toast.error(message || 'Gagal menghapus surat')
      }
    }
  }

  const visiblePages = useMemo(() => {
    const pages = new Set([1, lastPage, currentPage])
    for (let i = currentPage - 2; i <= currentPage + 2; i += 1) {
      if (i > 1 && i < lastPage) pages.add(i)
    }
    return Array.from(pages).sort((a, b) => a - b)
  }, [currentPage, lastPage])

  return (
    <div className='w-full min-w-0 space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>Surat Masuk</h1>
          <p className='text-muted-foreground'>Kelola arsip surat masuk</p>
        </div>
        <Button asChild>
          <Link href='/surat-masuk/create'>
            <Plus className='mr-2 h-4 w-4' />
            Tambah Surat
          </Link>
        </Button>
      </div>

      <div className='flex flex-col sm:flex-row gap-4'>
        <div className='flex-1'>
          <div className='relative'>
            <Search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
            <Input
              type='search'
              placeholder='Cari nomor atau perihal surat...'
              className='pl-8'
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
        </div>
        <div className='w-full sm:w-64'>
          <Select
            value={selectedCategory}
            onValueChange={(value) => setSelectedCategory(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder='Filter Kategori' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>Semua Kategori</SelectItem>
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

      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        <Input
          type='date'
          value={dateFromInput}
          onChange={(event) => setDateFromInput(event.target.value)}
          placeholder='Tanggal dari'
        />
        <Input
          type='date'
          value={dateToInput}
          onChange={(event) => setDateToInput(event.target.value)}
          placeholder='Tanggal sampai'
        />
        <Input
          value={districtInput}
          onChange={(event) => setDistrictInput(event.target.value)}
          placeholder='Kecamatan'
        />
        <Input
          value={villageInput}
          onChange={(event) => setVillageInput(event.target.value)}
          placeholder='Desa/Kelurahan'
        />
      </div>

      <div className='border rounded-md'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>No. Agenda</TableHead>
              <TableHead>No. Surat</TableHead>
              <TableHead>Perihal</TableHead>
              <TableHead>Pengirim</TableHead>
              <TableHead>Tgl Agenda</TableHead>
              <TableHead>Tgl Surat</TableHead>
              <TableHead>Wilayah</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead className='text-right'>Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoadingSuratMasuk ? (
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Skeleton className='h-4 w-20' />
                  </TableCell>
                  <TableCell>
                    <Skeleton className='h-4 w-24' />
                  </TableCell>
                  <TableCell>
                    <Skeleton className='h-4 w-40' />
                  </TableCell>
                  <TableCell>
                    <Skeleton className='h-4 w-32' />
                  </TableCell>
                  <TableCell>
                    <Skeleton className='h-4 w-24' />
                  </TableCell>
                  <TableCell>
                    <Skeleton className='h-4 w-24' />
                  </TableCell>
                  <TableCell>
                    <Skeleton className='h-4 w-28' />
                  </TableCell>
                  <TableCell>
                    <Skeleton className='h-4 w-20' />
                  </TableCell>
                  <TableCell>
                    <Skeleton className='h-8 w-24 ml-auto' />
                  </TableCell>
                </TableRow>
              ))
            ) : suratMasukData?.data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className='text-center py-8'>
                  <div className='flex flex-col items-center justify-center text-muted-foreground'>
                    <FileText className='h-12 w-12 mb-2' />
                    <p>Tidak ada data surat masuk</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              (suratMasukData?.data ?? []).map((surat) => (
                <TableRow key={surat.id}>
                  <TableCell>{surat.no_agenda || '-'}</TableCell>
                  <TableCell>{surat.nomor_surat}</TableCell>
                  <TableCell>{surat.perihal}</TableCell>
                  <TableCell>{surat.pengirim || '-'}</TableCell>
                  <TableCell>
                    {surat.tanggal_diterima
                      ? new Date(surat.tanggal_diterima).toLocaleDateString(
                          'id-ID'
                        )
                      : '-'}
                  </TableCell>
                  <TableCell>
                    {surat.tanggal
                      ? new Date(surat.tanggal).toLocaleDateString('id-ID')
                      : '-'}
                  </TableCell>
                  <TableCell>
                    {[surat.district, surat.village]
                      .filter(Boolean)
                      .join(' • ') || '-'}
                  </TableCell>
                  <TableCell>
                    <Badge variant='outline'>
                      {surat.category?.name || `#${surat.category_id}`}
                    </Badge>
                  </TableCell>
                  <TableCell className='text-right'>
                    <div className='flex justify-end gap-2'>
                      <Button variant='ghost' size='icon' asChild>
                        <Link href={`/surat-masuk/${surat.id}`}>
                          <Eye className='h-4 w-4' />
                        </Link>
                      </Button>
                      <Button variant='ghost' size='icon' asChild>
                        <Link href={`/surat-masuk/${surat.id}/edit`}>
                          <Edit className='h-4 w-4' />
                        </Link>
                      </Button>
                      <Button
                        variant='ghost'
                        size='icon'
                        onClick={() => handleDelete(surat.id)}
                      >
                        <Trash className='h-4 w-4' />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {paginationMeta && (
        <div className='flex items-center justify-between'>
          <p className='text-sm text-muted-foreground'>
            Menampilkan {paginationMeta.from ?? 0} - {paginationMeta.to ?? 0}{' '}
            dari {paginationMeta.total ?? 0} data
          </p>
          <div className='flex gap-1 items-center'>
            <Button
              variant='outline'
              size='sm'
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage <= 1}
            >
              Sebelumnya
            </Button>
            {visiblePages.map((pageNumber, index) => {
              const prevPage = visiblePages[index - 1]
              const showEllipsis = prevPage && pageNumber - prevPage > 1
              return (
                <Fragment key={pageNumber}>
                  {showEllipsis && (
                    <span className='px-2 text-sm text-muted-foreground'>
                      ...
                    </span>
                  )}
                  <Button
                    variant={pageNumber === currentPage ? 'default' : 'outline'}
                    size='sm'
                    onClick={() => handlePageChange(pageNumber)}
                    aria-current={
                      pageNumber === currentPage ? 'page' : undefined
                    }
                  >
                    {pageNumber}
                  </Button>
                </Fragment>
              )
            })}
            <Button
              variant='outline'
              size='sm'
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= lastPage}
            >
              Selanjutnya
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
