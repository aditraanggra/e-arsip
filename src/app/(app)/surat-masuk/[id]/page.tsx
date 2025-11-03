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
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : 'Gagal menghapus surat'
        toast.error(message || 'Gagal menghapus surat')
      }
    }
  }

  return (
    <div className="w-full min-w-0 space-y-6 2xl:space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild className="sm:shrink-0">
            <Link href="/surat-masuk">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-emerald-900 2xl:text-4xl">Detail Surat Masuk</h1>
            <p className="text-muted-foreground">
              {isLoading ? (
                <Skeleton className="h-4 w-40" />
              ) : (
                `No. Surat: ${surat?.nomor_surat ?? '-'}`
              )}
            </p>
          </div>
        </div>
        
        <div className="flex gap-2 sm:w-auto">
          <Button variant="outline" asChild className="2xl:text-base">
            <Link href={`/surat-masuk/${id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
          <Button variant="destructive" onClick={handleDelete} className="2xl:text-base">
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
        <Card className="border-none bg-white/95 shadow-sm ring-1 ring-emerald-100">
          <CardHeader className="space-y-1">
            <CardTitle className="text-emerald-900 text-xl 2xl:text-2xl">{surat?.perihal || '-'}</CardTitle>
            <p className="text-sm text-muted-foreground">
              Ringkasan detail surat masuk berikut dapat digunakan untuk keperluan disposisi dan arsip.
            </p>
          </CardHeader>
          <CardContent className="space-y-6 2xl:space-y-8">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 2xl:grid-cols-3">
              <div className="space-y-4 rounded-lg border border-emerald-100/70 bg-emerald-50/40 p-4">
                <div>
                  <p className="text-xs uppercase tracking-wide text-emerald-700">Nomor Surat</p>
                  <p className="mt-1 text-sm font-medium text-emerald-900">{surat?.nomor_surat ?? '-'}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-emerald-700">Pengirim</p>
                  <p className="mt-1 text-sm font-medium text-emerald-900">{surat?.pengirim || '-'}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-emerald-700">Tanggal Surat</p>
                  <p className="mt-1 text-sm font-medium text-emerald-900">
                    {surat?.tanggal ? new Date(surat.tanggal).toLocaleDateString('id-ID') : '-'}
                  </p>
                </div>
              </div>
              <div className="space-y-4 rounded-lg border border-emerald-100/70 bg-white p-4 shadow-sm">
                <div>
                  <p className="text-xs uppercase tracking-wide text-emerald-700">Nomor Agenda</p>
                  <p className="mt-1 text-sm font-medium text-emerald-900">{surat?.no_agenda || '-'}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-emerald-700">Kategori</p>
                  <Badge variant="outline">{surat?.category?.name || `#${surat?.category_id ?? '-'}`}</Badge>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-emerald-700">Tanggal Diterima</p>
                  <p className="mt-1 text-sm font-medium text-emerald-900">
                    {surat?.tanggal_diterima
                      ? new Date(surat.tanggal_diterima).toLocaleDateString('id-ID')
                      : '-'}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-emerald-700">Dibuat pada</p>
                  <p className="mt-1 text-sm font-medium text-emerald-900">
                    {surat?.created_at
                      ? new Date(surat.created_at).toLocaleString('id-ID')
                      : '-'}
                  </p>
                </div>
              </div>
              <div className="space-y-4 rounded-lg border border-yellow-100/70 bg-yellow-50/50 p-4">
                <div>
                  <p className="text-xs uppercase tracking-wide text-yellow-800">Wilayah</p>
                  <p className="mt-1 text-sm font-medium text-yellow-900">
                    {[surat?.district, surat?.village].filter(Boolean).join(' • ') || '-'}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-yellow-800">Kontak</p>
                  <p className="mt-1 text-sm font-medium text-yellow-900">{surat?.contact || '-'}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-yellow-800">Alamat</p>
                  <p className="mt-1 text-sm text-yellow-900">{surat?.address || '-'}</p>
                </div>
              </div>
            </div>
            
            <div className="rounded-lg border border-emerald-100 bg-white/80 p-4">
              <p className="text-xs uppercase tracking-wide text-emerald-700">Keterangan</p>
              <p className="mt-2 whitespace-pre-wrap text-sm text-emerald-900">{surat?.keterangan || '-'}</p>
            </div>
            
            {surat?.file_path && (
              <div className="rounded-lg border border-emerald-100 bg-white/80 p-4">
                <p className="text-xs uppercase tracking-wide text-emerald-700">Lampiran</p>
                <Button variant="outline" asChild className="mt-3 w-fit text-emerald-700 hover:bg-emerald-50">
                  <a href={surat.file_path} target="_blank" rel="noopener noreferrer">
                    Lihat Dokumen
                  </a>
                </Button>
              </div>
            )}
            {(surat?.dept_disposition || surat?.desc_disposition) && (
              <div className="rounded-lg border border-emerald-100 bg-white/80 p-4">
                <p className="text-xs uppercase tracking-wide text-emerald-700">Disposisi</p>
                <dl className="mt-2 space-y-2 text-sm text-emerald-900">
                  {surat?.dept_disposition && (
                    <div>
                      <dt className="font-semibold">Bagian</dt>
                      <dd>{surat.dept_disposition}</dd>
                    </div>
                  )}
                  {surat?.desc_disposition && (
                    <div>
                      <dt className="font-semibold">Instruksi</dt>
                      <dd>{surat.desc_disposition}</dd>
                    </div>
                  )}
                </dl>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
