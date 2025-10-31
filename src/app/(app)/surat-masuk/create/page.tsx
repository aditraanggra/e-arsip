'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'
import { SuratMasukForm } from '@/components/forms/surat-masuk-form'

export default function SuratMasukCreatePage() {
  return (
    <div className="w-full min-w-0 space-y-6 2xl:space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
        <Button variant="outline" size="icon" asChild className="sm:shrink-0">
          <Link href="/surat-masuk" aria-label="Kembali ke daftar surat masuk">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-emerald-900 2xl:text-4xl">Tambah Surat Masuk</h1>
          <p className="text-muted-foreground max-w-2xl">
            Lengkapi formulir berikut untuk menambahkan surat masuk baru ke sistem arsip elektronik.
          </p>
        </div>
      </div>

      <Card className="border-none bg-white/95 shadow-sm ring-1 ring-emerald-100">
        <CardHeader>
          <CardTitle className="text-xl text-emerald-900">Detail Surat</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <SuratMasukForm />
        </CardContent>
      </Card>
    </div>
  )
}
