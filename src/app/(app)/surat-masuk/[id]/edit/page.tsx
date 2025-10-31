'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { suratMasukService } from '@/lib/api/services'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowLeft } from 'lucide-react'
import { SuratMasukForm } from '@/components/forms/surat-masuk-form'

export default function SuratMasukEditPage() {
  const params = useParams()
  const id = Number(params.id)

  const {
    data: surat,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['surat-masuk', id],
    queryFn: () => suratMasukService.getById(id),
    enabled: Number.isFinite(id),
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href={`/surat-masuk/${id}`} aria-label="Kembali ke detail surat">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Surat Masuk</h1>
          <p className="text-muted-foreground">
            Perbarui informasi surat sesuai kebutuhan operasional.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detail Surat</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-40 w-full" />
            </div>
          ) : isError || !surat ? (
            <p className="text-sm text-destructive">
              Data surat tidak ditemukan atau gagal dimuat.
            </p>
          ) : (
            <SuratMasukForm initialData={surat} isEdit />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
