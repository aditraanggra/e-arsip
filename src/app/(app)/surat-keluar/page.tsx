'use client'

import { Fragment, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { suratKeluarService, categoriesService } from '@/lib/api/services'
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
  Trash2,
  ExternalLink,
  MoreHorizontal,
  X,
} from 'lucide-react'
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
  const defaultSort = '-date_letter'
  const sortParam = searchParams.get('sort') || defaultSort
  const categoryIdParam = searchParams.get('category_id')
  const categoryIdNumber = categoryIdParam ? Number(categoryIdParam) : undefined
  const categoryFilter = Number.isNaN(categoryIdNumber)
    ? undefined
    : categoryIdNumber
  const dateFromParam = searchParams.get('date_from') || ''
  const dateToParam = searchParams.get('date_to') || ''

  const [searchInput, setSearchInput] = useState(search)
  const [selectedCategory, setSelectedCategory] = useState(
    categoryIdParam ?? 'all'
  )
  const [dateFromInput, setDateFromInput] = useState(dateFromParam)
  const [dateToInput, setDateToInput] = useState(dateToParam)
  const [selectedIds, setSelectedIds] = useState<number[]>([])

  const {
    data: suratKeluarData,
    isLoading: isLoadingSuratKeluar,
    refetch,
  } = useQuery({
    queryKey: [
      'surat-keluar',
      page,
      perPage,
      search,
      categoryIdParam ?? 'all',
      dateFromParam,
      dateToParam,
      sortParam,
    ],
    queryFn: () =>
      suratKeluarService.getAll({
        page,
        per_page: perPage,
        q: search,
        category_id: categoryFilter,
        date_from: dateFromParam || undefined,
        date_to: dateToParam || undefined,
        sort: sortParam,
      }),
  })

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesService.getAll(),
  })

  const sortedSuratKeluar = useMemo(() => {
    if (!suratKeluarData?.data) return []
    return [...suratKeluarData.data].sort((a, b) => {
      const dateA = a.tanggal ? new Date(a.tanggal).getTime() : 0
      const dateB = b.tanggal ? new Date(b.tanggal).getTime() : 0
      if (dateA !== dateB) return dateB - dateA
      return (b.id ?? 0) - (a.id ?? 0)
    })
  }, [suratKeluarData])

  // Reset selection when data changes
  useEffect(() => {
    setSelectedIds([])
  }, [suratKeluarData])

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
    params.set('sort', sortParam)
    if (searchInput) params.set('q', searchInput)
    if (selectedCategory && selectedCategory !== 'all') {
      params.set('category_id', selectedCategory)
    }
    if (dateFromInput) params.set('date_from', dateFromInput)
    if (dateToInput) params.set('date_to', dateToInput)
    router.push(`/surat-keluar?${params.toString()}`)
  }

  const paginationMeta = suratKeluarData?.meta
  const currentPage = paginationMeta?.current_page ?? page
  const lastPage = paginationMeta?.last_page ?? currentPage
  const perPageValue = paginationMeta?.per_page ?? perPage

  const handlePageChange = (newPage: number) => {
    const safePage = Math.min(Math.max(newPage, 1), lastPage || 1)
    if (safePage === currentPage) return
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', safePage.toString())
    params.set('per_page', perPageValue.toString())
    if (!params.get('sort')) params.set('sort', defaultSort)
    router.push(`/surat-keluar?${params.toString()}`)
  }

  const handleDelete = async (id: number) => {
    if (confirm('Apakah Anda yakin ingin menghapus surat ini?')) {
      try {
        await suratKeluarService.delete(id)
        toast.success('Surat keluar berhasil dihapus')
        refetch()
      } catch (error: unknown) {
        const message =
          error instanceof Error
            ? error.message
            : 'Gagal menghapus surat keluar'
        toast.error(message || 'Gagal menghapus surat keluar')
      }
    }
  }

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return
    if (
      !confirm(`Apakah Anda yakin ingin menghapus ${selectedIds.length} surat?`)
    ) {
      return
    }

    const results = await Promise.allSettled(
      selectedIds.map((id) => suratKeluarService.delete(id).then(() => id))
    )

    const fulfilled = results.filter(
      (r): r is PromiseFulfilledResult<number> => r.status === 'fulfilled'
    )
    const rejected = results.filter(
      (r): r is PromiseRejectedResult => r.status === 'rejected'
    )

    const deletedIds = fulfilled.map((r) => r.value)
    const failedIds = selectedIds.filter((id) => !deletedIds.includes(id))

    if (deletedIds.length > 0) {
      toast.success(`${deletedIds.length} surat berhasil dihapus`)
      refetch()
    }

    if (rejected.length > 0) {
      toast.error(`${rejected.length} surat gagal dihapus`)
    }

    setSelectedIds(failedIds)
  }

  const visiblePages = useMemo(() => {
    const pages = new Set([1, lastPage, currentPage])
    for (let i = currentPage - 2; i <= currentPage + 2; i += 1) {
      if (i > 1 && i < lastPage) pages.add(i)
    }
    return Array.from(pages).sort((a, b) => a - b)
  }, [currentPage, lastPage])

  // Checkbox handlers
  const allIds = sortedSuratKeluar
    .map((s) => s.id)
    .filter((id): id is number => id != null)
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
            Surat Keluar
          </h1>
          <p className='text-muted-foreground'>
            Kelola arsip surat keluar organisasi
          </p>
        </div>
        <Button asChild>
          <Link href='/surat-keluar/create'>
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
              placeholder='Cari nomor, perihal, atau tujuan surat...'
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

      <div className='grid gap-4 sm:grid-cols-2'>
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
              <TableHead>Tanggal</TableHead>
              <TableHead>No. Surat</TableHead>
              <TableHead>Perihal</TableHead>
              <TableHead>Tujuan</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead className='w-12 text-center'>Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoadingSuratKeluar ? (
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Skeleton className='h-4 w-4' />
                  </TableCell>
                  <TableCell>
                    <Skeleton className='h-4 w-20' />
                  </TableCell>
                  <TableCell>
                    <Skeleton className='h-4 w-32' />
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
                    <Skeleton className='h-8 w-8 mx-auto' />
                  </TableCell>
                </TableRow>
              ))
            ) : sortedSuratKeluar.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className='text-center py-12'>
                  <div className='flex flex-col items-center justify-center text-muted-foreground'>
                    <FileText className='h-12 w-12 mb-3 opacity-50' />
                    <p className='font-medium'>Tidak ada data surat keluar</p>
                    <p className='text-sm'>
                      Coba ubah filter atau tambah surat baru
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              sortedSuratKeluar.map((surat) => (
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
                  <TableCell>
                    {surat.tanggal
                      ? new Date(surat.tanggal).toLocaleDateString('id-ID')
                      : '-'}
                  </TableCell>
                  <TableCell className='font-medium'>
                    {surat.nomor_surat}
                  </TableCell>
                  <TableCell className='max-w-[200px] truncate'>
                    {surat.perihal}
                  </TableCell>
                  <TableCell className='max-w-[150px] truncate'>
                    {surat.tujuan || '-'}
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
                        {surat.file_path && (
                          <>
                            <DropdownMenuItem asChild>
                              <a
                                href={surat.file_path}
                                target='_blank'
                                rel='noopener noreferrer'
                                className='flex items-center'
                              >
                                <ExternalLink className='mr-2 h-4 w-4' />
                                Lihat Dokumen
                              </a>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                          </>
                        )}
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
