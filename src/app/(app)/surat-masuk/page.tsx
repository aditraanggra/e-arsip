'use client'

import { Fragment, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { useSearchParams, useRouter } from 'next/navigation'
import { suratMasukService, categoriesService } from '@/lib/api/services'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
import {
  Plus,
  Search,
  FileText,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  X,
  FileDown,
} from 'lucide-react'
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
  const [selectedIds, setSelectedIds] = useState<number[]>([])

  const {
    data: suratMasukDataRaw,
    isLoading: isLoadingSuratMasuk,
    error,
    refetch,
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

  useEffect(() => {
    if (error) {
      console.error('[SuratMasuk] Query error:', error)
    }
  }, [error])

  const parseAgendaForSort = (
    agenda: string | number | null | undefined
  ): { num: number; suffix: string } => {
    if (agenda === null || agenda === undefined) {
      return { num: -Infinity, suffix: '' }
    }
    const str = String(agenda)
    const match = str.match(/^(\d+)(.*)$/)
    if (match) {
      return { num: parseInt(match[1], 10), suffix: match[2] || '' }
    }
    return { num: -Infinity, suffix: str }
  }

  const suratMasukData = useMemo(() => {
    if (!suratMasukDataRaw) return undefined
    const sortedData = [...suratMasukDataRaw.data].sort((a, b) => {
      // Primary sort: tanggal_diterima (date agenda) DESC
      const dateA = a.tanggal_diterima
        ? new Date(a.tanggal_diterima).getTime()
        : 0
      const dateB = b.tanggal_diterima
        ? new Date(b.tanggal_diterima).getTime()
        : 0
      if (dateB !== dateA) {
        return dateB - dateA
      }
      // Secondary sort: no_agenda DESC
      const agendaA = parseAgendaForSort(a.no_agenda)
      const agendaB = parseAgendaForSort(b.no_agenda)
      if (agendaB.num !== agendaA.num) {
        return agendaB.num - agendaA.num
      }
      return agendaB.suffix.localeCompare(agendaA.suffix)
    })
    return { ...suratMasukDataRaw, data: sortedData }
  }, [suratMasukDataRaw])

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesService.getAll(),
  })

  // Reset selection when data changes
  useEffect(() => {
    setSelectedIds([])
  }, [suratMasukData])

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
    params.delete('sort')
    router.push(`/surat-masuk?${params.toString()}`)
  }

  const handleDelete = async (id: number) => {
    if (confirm('Apakah Anda yakin ingin menghapus surat ini?')) {
      try {
        await suratMasukService.delete(id)
        toast.success('Surat berhasil dihapus')
        refetch()
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : 'Gagal menghapus surat'
        toast.error(message || 'Gagal menghapus surat')
      }
    }
  }

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return
    if (
      confirm(`Apakah Anda yakin ingin menghapus ${selectedIds.length} surat?`)
    ) {
      try {
        await Promise.all(selectedIds.map((id) => suratMasukService.delete(id)))
        toast.success(`${selectedIds.length} surat berhasil dihapus`)
        setSelectedIds([])
        refetch()
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

  // Checkbox handlers
  const allIds = suratMasukData?.data.map((s) => s.id) ?? []
  const isAllSelected =
    allIds.length > 0 && selectedIds.length === allIds.length
  const isIndeterminate =
    selectedIds.length > 0 && selectedIds.length < allIds.length

  const handleSelectAll = (checked: boolean | 'indeterminate') => {
    if (checked) {
      setSelectedIds(allIds)
    } else {
      setSelectedIds([])
    }
  }

  const handleSelectRow = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, id])
    } else {
      setSelectedIds((prev) => prev.filter((i) => i !== id))
    }
  }

  return (
    <div className='w-full min-w-0 space-y-6'>
      <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h1 className='text-2xl font-bold text-foreground lg:text-3xl'>
            Surat Masuk
          </h1>
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
            <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
            <Input
              type='search'
              placeholder='Cari nomor atau perihal surat...'
              className='pl-10'
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
              <SelectValue placeholder='Semua Kategori' />
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

      <Card className='overflow-hidden'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className='w-12'>
                <Checkbox
                  checked={isAllSelected}
                  data-state={
                    isIndeterminate
                      ? 'indeterminate'
                      : isAllSelected
                      ? 'checked'
                      : 'unchecked'
                  }
                  onCheckedChange={handleSelectAll}
                  aria-label='Select all'
                />
              </TableHead>
              <TableHead>No. Agenda</TableHead>
              <TableHead>No. Surat</TableHead>
              <TableHead>Perihal</TableHead>
              <TableHead>Pengirim</TableHead>
              <TableHead>Tgl Agenda</TableHead>
              <TableHead>Tgl Surat</TableHead>
              <TableHead>Wilayah</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead className='w-12 text-center'>Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoadingSuratMasuk ? (
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Skeleton className='h-4 w-4' />
                  </TableCell>
                  <TableCell>
                    <Skeleton className='h-4 w-16' />
                  </TableCell>
                  <TableCell>
                    <Skeleton className='h-4 w-24' />
                  </TableCell>
                  <TableCell>
                    <Skeleton className='h-4 w-40' />
                  </TableCell>
                  <TableCell>
                    <Skeleton className='h-4 w-28' />
                  </TableCell>
                  <TableCell>
                    <Skeleton className='h-4 w-20' />
                  </TableCell>
                  <TableCell>
                    <Skeleton className='h-4 w-20' />
                  </TableCell>
                  <TableCell>
                    <Skeleton className='h-4 w-24' />
                  </TableCell>
                  <TableCell>
                    <Skeleton className='h-4 w-16' />
                  </TableCell>
                  <TableCell>
                    <Skeleton className='h-8 w-8 mx-auto' />
                  </TableCell>
                </TableRow>
              ))
            ) : suratMasukData?.data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className='text-center py-12'>
                  <div className='flex flex-col items-center justify-center text-muted-foreground'>
                    <FileText className='h-12 w-12 mb-3 opacity-50' />
                    <p className='font-medium'>Tidak ada data surat masuk</p>
                    <p className='text-sm'>
                      Coba ubah filter atau tambah surat baru
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              (suratMasukData?.data ?? []).map((surat) => (
                <TableRow
                  key={surat.id}
                  data-state={
                    selectedIds.includes(surat.id) ? 'selected' : undefined
                  }
                >
                  <TableCell>
                    <Checkbox
                      checked={selectedIds.includes(surat.id)}
                      onCheckedChange={(checked: boolean | 'indeterminate') =>
                        handleSelectRow(surat.id, checked === true)
                      }
                      aria-label={`Select row ${surat.id}`}
                    />
                  </TableCell>
                  <TableCell className='font-medium'>
                    {surat.no_agenda || '-'}
                  </TableCell>
                  <TableCell>{surat.nomor_surat}</TableCell>
                  <TableCell className='max-w-[200px] truncate'>
                    {surat.perihal}
                  </TableCell>
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
                  <TableCell className='max-w-[120px] truncate'>
                    {[surat.district, surat.village]
                      .filter(Boolean)
                      .join(' • ') || '-'}
                  </TableCell>
                  <TableCell>
                    <Badge variant='outline' className='whitespace-nowrap'>
                      {surat.category?.name || `#${surat.category_id}`}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant='ghost' size='icon' className='h-8 w-8'>
                          <MoreHorizontal className='h-4 w-4' />
                          <span className='sr-only'>Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align='end' className='w-40'>
                        <DropdownMenuItem asChild>
                          <Link
                            href={`/surat-masuk/${surat.id}`}
                            className='flex items-center'
                          >
                            <Eye className='mr-2 h-4 w-4' />
                            Lihat
                          </Link>
                        </DropdownMenuItem>
                        {surat.file_path && (
                          <DropdownMenuItem asChild>
                            <a
                              href={surat.file_path}
                              target='_blank'
                              rel='noopener noreferrer'
                              className='flex items-center'
                            >
                              <FileDown className='mr-2 h-4 w-4' />
                              Lihat Dokumen
                            </a>
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem asChild>
                          <Link
                            href={`/surat-masuk/${surat.id}/edit`}
                            className='flex items-center'
                          >
                            <Edit className='mr-2 h-4 w-4' />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDelete(surat.id)}
                          className='text-destructive focus:text-destructive'
                        >
                          <Trash2 className='mr-2 h-4 w-4' />
                          Hapus
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

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

      {/* Floating Action Bar for bulk actions */}
      {selectedIds.length > 0 && (
        <div className='fixed bottom-6 left-1/2 -translate-x-1/2 z-50'>
          <div
            className='flex items-center gap-4 rounded-2xl bg-foreground px-6 py-3 text-background'
            style={{ boxShadow: '0 10px 40px rgba(0,0,0,0.3)' }}
          >
            <span className='text-sm font-medium'>
              {selectedIds.length} item dipilih
            </span>
            <div className='h-4 w-px bg-background/20' />
            <Button
              variant='ghost'
              size='sm'
              onClick={handleBulkDelete}
              className='text-red-400 hover:text-red-300 hover:bg-red-500/20'
            >
              <Trash2 className='mr-2 h-4 w-4' />
              Hapus
            </Button>
            <Button
              variant='ghost'
              size='icon'
              onClick={() => setSelectedIds([])}
              className='h-8 w-8 hover:bg-background/10'
            >
              <X className='h-4 w-4' />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
