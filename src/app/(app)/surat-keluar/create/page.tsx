'use client'

import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { SuratKeluarForm } from '@/components/forms/surat-keluar-form'

export default function SuratKeluarCreatePage() {
  return (
    <div className='w-full min-w-0 space-y-6 2xl:space-y-8'>
      <div className='space-y-3'>
        <nav className='flex items-center gap-2 text-sm text-muted-foreground'>
          <Link href='/surat-keluar' className='hover:text-foreground'>
            Surat Keluar
          </Link>
          <span aria-hidden='true'>›</span>
          <span className='text-foreground'>Create</span>
        </nav>
        <div className='space-y-1'>
          <h1 className='text-3xl font-bold tracking-tight text-emerald-900 2xl:text-4xl'>
            Tambah Surat Keluar
          </h1>
          <p className='text-muted-foreground max-w-3xl'>
            Lengkapi formulir berikut untuk mencatat surat keluar baru.
          </p>
        </div>
      </div>

      <Card className='border-none bg-white shadow-sm ring-1 ring-emerald-100'>
        <CardContent className='space-y-6'>
          <SuratKeluarForm />
        </CardContent>
      </Card>
    </div>
  )
}
