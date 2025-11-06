import { NextResponse } from 'next/server'
import { proxyRequest } from '@/app/api/_utils/proxy'

type Params = {
  params: { id: string }
}

export async function GET(request: Request, { params }: Params) {
  try {
    return await proxyRequest(request, `/surat-keluar/${params.id}`)
  } catch (error) {
    console.error('Surat keluar proxy error (GET by id):', error)
    return NextResponse.json(
      { message: 'Gagal memuat detail surat keluar' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request, { params }: Params) {
  try {
    return await proxyRequest(request, `/surat-keluar/${params.id}`)
  } catch (error) {
    console.error('Surat keluar proxy error (PUT):', error)
    return NextResponse.json(
      { message: 'Gagal memperbarui surat keluar' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request, { params }: Params) {
  try {
    return await proxyRequest(request, `/surat-keluar/${params.id}`)
  } catch (error) {
    console.error('Surat keluar proxy error (DELETE):', error)
    return NextResponse.json(
      { message: 'Gagal menghapus surat keluar' },
      { status: 500 }
    )
  }
}
