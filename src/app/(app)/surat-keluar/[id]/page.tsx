'use client'

import { useQuery } from '@tanstack/react-query'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { suratKeluarService } from '@/lib/api/services'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Edit, Trash, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'

export default function SuratKeluarDetailPage() {
  const params = useParams()
  const router = useRouter()

  // Validate params.id: ensure it's a string containing a valid integer
  const rawId = params.id
  const isValidId =
    typeof rawId === 'string' && rawId.length > 0 && /^\d+$/.test(rawId)
  const id = isValidId ? Number(rawId) : NaN

  const {
    data: surat,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['surat-keluar', id],
    queryFn: () => suratKeluarService.getById(id),
    enabled: isValidId,
  })

  const handleDelete = async () => {
    if (confirm('Apakah Anda yakin ingin menghapus surat ini?')) {
      try {
        await suratKeluarService.delete(id)
        toast.success('Surat keluar berhasil dihapus')
        router.push('/surat-keluar')
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : 'Gagal menghapus surat'
        toast.error(message || 'Gagal menghapus surat')
      }
    }
  }

  // Handle invalid ID
  if (!isValidId) {
    return (
      <Card className='border-none bg-white/95 shadow-sm ring-1 ring-red-100'>
        <CardContent className='p-6'>
          <p className='text-red-600'>ID surat tidak valid.</p>
          <Button variant='outline' asChild className='mt-4'>
            <Link href='/surat-keluar'>
              <ArrowLeft className='mr-2 h-4 w-4' />
              Kembali ke Daftar Surat Keluar
            </Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  // Handle query error
  if (isError) {
    return (
      <Card className='border-none bg-white/95 shadow-sm ring-1 ring-red-100'>
        <CardContent className='p-6'>
          <p className='text-red-600'>
            Gagal memuat data surat. {error?.message}
          </p>
          <Button variant='outline' asChild className='mt-4'>
            <Link href='/surat-keluar'>
              <ArrowLeft className='mr-2 h-4 w-4' />
              Kembali ke Daftar Surat Keluar
            </Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className='w-full min-w-0 space-y-6 2xl:space-y-8'>
      <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div className='flex items-center gap-4'>
          <Button variant='outline' size='icon' asChild className='sm:shrink-0'>
            <Link href='/surat-keluar'>
              <ArrowLeft className='h-4 w-4' />
            </Link>
          </Button>
          <div>
            <h1 className='text-3xl font-bold tracking-tight text-emerald-900 2xl:text-4xl'>
              Detail Surat Keluar
            </h1>
            <div className='text-muted-foreground'>
              {isLoading ? (
                <Skeleton className='h-4 w-40' />
              ) : (
                <p>No. Surat: {surat?.nomor_surat ?? '-'}</p>
              )}
            </div>
          </div>
        </div>

        <div className='flex gap-2 sm:w-auto'>
          <Button variant='outline' asChild className='2xl:text-base'>
            <Link href={`/surat-keluar/${id}/edit`}>
              <Edit className='mr-2 h-4 w-4' />
              Edit
            </Link>
          </Button>
          <Button
            variant='destructive'
            onClick={handleDelete}
            className='2xl:text-base'
          >
            <Trash className='mr-2 h-4 w-4' />
            Hapus
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className='space-y-4'>
          <Skeleton className='h-8 w-full' />
          <Skeleton className='h-24 w-full' />
          <Skeleton className='h-8 w-full' />
        </div>
      ) : (
        <Card className='border-none bg-white/95 shadow-sm ring-1 ring-emerald-100'>
          <CardHeader className='space-y-1'>
            <CardTitle className='text-emerald-900 text-xl 2xl:text-2xl'>
              {surat?.perihal || '-'}
            </CardTitle>
            <p className='text-sm text-muted-foreground'>
              Ringkasan detail surat keluar berikut dapat digunakan untuk
              keperluan arsip dan dokumentasi.
            </p>
          </CardHeader>
          <CardContent className='space-y-6 2xl:space-y-8'>
            <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
              <div className='space-y-4 rounded-lg border border-emerald-100/70 bg-emerald-50/40 p-4'>
                <div>
                  <p className='text-xs uppercase tracking-wide text-emerald-700'>
                    Nomor Surat
                  </p>
                  <p className='mt-1 text-sm font-medium text-emerald-900'>
                    {surat?.nomor_surat ?? '-'}
                  </p>
                </div>
                <div>
                  <p className='text-xs uppercase tracking-wide text-emerald-700'>
                    Tujuan
                  </p>
                  <p className='mt-1 text-sm font-medium text-emerald-900'>
                    {surat?.tujuan || '-'}
                  </p>
                </div>
                <div>
                  <p className='text-xs uppercase tracking-wide text-emerald-700'>
                    Tanggal Surat
                  </p>
                  <p className='mt-1 text-sm font-medium text-emerald-900'>
                    {surat?.tanggal
                      ? new Date(surat.tanggal).toLocaleDateString('id-ID')
                      : '-'}
                  </p>
                </div>
              </div>
              <div className='space-y-4 rounded-lg border border-emerald-100/70 bg-white p-4 shadow-sm'>
                <div>
                  <p className='text-xs uppercase tracking-wide text-emerald-700'>
                    Kategori
                  </p>
                  <Badge variant='outline'>
                    {surat?.category?.name || `#${surat?.category_id ?? '-'}`}
                  </Badge>
                </div>
                <div>
                  <p className='text-xs uppercase tracking-wide text-emerald-700'>
                    Dibuat pada
                  </p>
                  <p className='mt-1 text-sm font-medium text-emerald-900'>
                    {surat?.created_at
                      ? new Date(surat.created_at).toLocaleString('id-ID')
                      : '-'}
                  </p>
                </div>
                <div>
                  <p className='text-xs uppercase tracking-wide text-emerald-700'>
                    Terakhir diperbarui
                  </p>
                  <p className='mt-1 text-sm font-medium text-emerald-900'>
                    {surat?.updated_at
                      ? new Date(surat.updated_at).toLocaleString('id-ID')
                      : '-'}
                  </p>
                </div>
              </div>
            </div>

            {surat?.keterangan && (
              <div className='rounded-lg border border-emerald-100 bg-white/80 p-4'>
                <p className='text-xs uppercase tracking-wide text-emerald-700'>
                  Keterangan
                </p>
                <p className='mt-2 whitespace-pre-wrap text-sm text-emerald-900'>
                  {surat.keterangan}
                </p>
              </div>
            )}

            {surat?.file_path && (
              <div className='rounded-lg border border-emerald-100 bg-white/80 p-4'>
                <p className='text-xs uppercase tracking-wide text-emerald-700'>
                  Lampiran
                </p>
                <Button
                  variant='outline'
                  asChild
                  className='mt-3 w-fit text-emerald-700 hover:bg-emerald-50'
                >
                  <a
                    href={surat.file_path}
                    target='_blank'
                    rel='noopener noreferrer'
                  >
                    <ExternalLink className='mr-2 h-4 w-4' />
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
