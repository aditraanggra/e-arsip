'use client'

import { useQuery } from '@tanstack/react-query'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { suratMasukService } from '@/lib/api/services'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Edit, Trash } from 'lucide-react'
import { toast } from 'sonner'

export default function SuratMasukDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = Number(params.id)

  const { data: surat, isLoading } = useQuery({
    queryKey: ['surat-masuk', id],
    queryFn: () => suratMasukService.getById(id),
  })

  const handleDelete = async () => {
    if (confirm('Apakah Anda yakin ingin menghapus surat ini?')) {
      try {
        await suratMasukService.delete(id)
        toast.success('Surat berhasil dihapus')
        router.push('/surat-masuk')
      } catch (error: any) {
        toast.error(error.message || 'Gagal menghapus surat')
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/surat-masuk">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Detail Surat Masuk</h1>
            <p className="text-muted-foreground">
              {isLoading ? (
                <Skeleton className="h-4 w-40" />
              ) : (
                `No. Surat: ${surat?.nomor_surat}`
              )}
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/surat-masuk/${id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash className="mr-2 h-4 w-4" />
            Hapus
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>{surat?.perihal}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Nomor Surat</p>
                  <p>{surat?.nomor_surat}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pengirim</p>
                  <p>{surat?.pengirim}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Tanggal</p>
                  <p>{new Date(surat?.tanggal || '').toLocaleDateString('id-ID')}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Kategori</p>
                  <Badge variant="outline">{surat?.category.name}</Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Tanggal Diterima</p>
                  <p>{new Date(surat?.tanggal_diterima || '').toLocaleDateString('id-ID')}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Dibuat pada</p>
                  <p>{new Date(surat?.created_at || '').toLocaleString('id-ID')}</p>
                </div>
              </div>
            </div>
            
            <div>
              <p className="text-sm font-medium text-muted-foreground">Keterangan</p>
              <p className="whitespace-pre-wrap">{surat?.keterangan || '-'}</p>
            </div>
            
            {surat?.file_path && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Lampiran</p>
                <Button variant="outline" asChild>
                  <a href={surat.file_path} target="_blank" rel="noopener noreferrer">
                    Lihat Dokumen
                  </a>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}