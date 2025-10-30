'use client'

import { useState } from 'react'
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
  const perPage = Number(searchParams.get('per_page') || process.env.NEXT_PUBLIC_DEFAULT_PAGE_SIZE || '10')
  const search = searchParams.get('search') || ''
  const categoryId = searchParams.get('category_id') || ''
  
  const [searchInput, setSearchInput] = useState(search)
  const [selectedCategory, setSelectedCategory] = useState(categoryId)

  const { data: suratMasukData, isLoading: isLoadingSuratMasuk } = useQuery({
    queryKey: ['surat-masuk', page, perPage, search, categoryId],
    queryFn: () => suratMasukService.getAll({ 
      page, 
      per_page: perPage,
      search,
      category_id: categoryId || undefined
    }),
  })

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesService.getAll(),
  })

  const handleSearch = () => {
    const params = new URLSearchParams()
    params.set('page', '1')
    params.set('per_page', perPage.toString())
    
    if (searchInput) params.set('search', searchInput)
    if (selectedCategory) params.set('category_id', selectedCategory)
    
    router.push(`/surat-masuk?${params.toString()}`)
  }

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', newPage.toString())
    router.push(`/surat-masuk?${params.toString()}`)
  }

  const handleDelete = async (id: number) => {
    if (confirm('Apakah Anda yakin ingin menghapus surat ini?')) {
      try {
        await suratMasukService.delete(id)
        toast.success('Surat berhasil dihapus')
        router.refresh()
      } catch (error: any) {
        toast.error(error.message || 'Gagal menghapus surat')
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Surat Masuk</h1>
          <p className="text-muted-foreground">Kelola arsip surat masuk</p>
        </div>
        <Button asChild>
          <Link href="/surat-masuk/create">
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
              placeholder="Cari nomor atau perihal surat..."
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
              <SelectItem value="">Semua Kategori</SelectItem>
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

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>No. Surat</TableHead>
              <TableHead>Perihal</TableHead>
              <TableHead>Pengirim</TableHead>
              <TableHead>Tanggal</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoadingSuratMasuk ? (
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-24 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : suratMasukData?.data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <FileText className="h-12 w-12 mb-2" />
                    <p>Tidak ada data surat masuk</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              suratMasukData?.data.map((surat) => (
                <TableRow key={surat.id}>
                  <TableCell>{surat.nomor_surat}</TableCell>
                  <TableCell>{surat.perihal}</TableCell>
                  <TableCell>{surat.pengirim}</TableCell>
                  <TableCell>{new Date(surat.tanggal).toLocaleDateString('id-ID')}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{surat.category.name}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/surat-masuk/${surat.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/surat-masuk/${surat.id}/edit`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleDelete(surat.id)}
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

      {suratMasukData?.meta && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Menampilkan {suratMasukData.meta.from} - {suratMasukData.meta.to} dari {suratMasukData.meta.total} data
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
              disabled={page >= suratMasukData.meta.last_page}
            >
              Selanjutnya
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}