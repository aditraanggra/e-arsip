import { NextResponse } from 'next/server'
import { proxyRequest } from '@/app/api/_utils/proxy'

type Params = {
  params: { id: string }
}

export async function GET(request: Request, { params }: Params) {
  try {
    return await proxyRequest(request, `/surat-masuk/${params.id}`)
  } catch (error) {
    console.error('Surat masuk proxy error (GET by id):', error)
    return NextResponse.json(
      { message: 'Gagal memuat detail surat masuk' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request, { params }: Params) {
  try {
    return await proxyRequest(request, `/surat-masuk/${params.id}`)
  } catch (error) {
    console.error('Surat masuk proxy error (PUT):', error)
    return NextResponse.json(
      { message: 'Gagal memperbarui surat masuk' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request, { params }: Params) {
  try {
    return await proxyRequest(request, `/surat-masuk/${params.id}`)
  } catch (error) {
    console.error('Surat masuk proxy error (DELETE):', error)
    return NextResponse.json(
      { message: 'Gagal menghapus surat masuk' },
      { status: 500 }
    )
  }
}
