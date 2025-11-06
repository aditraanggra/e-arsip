import { NextResponse, type NextRequest } from 'next/server'
import { proxyRequest } from '@/app/api/_utils/proxy'

type RouteContext = {
  params: Promise<{ id: string }>
}

async function resolveId(context: RouteContext) {
  const params = await context.params
  return params.id
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const id = await resolveId(context)
    return await proxyRequest(request, `/surat-masuk/${id}`)
  } catch (error) {
    console.error('Surat masuk proxy error (GET by id):', error)
    return NextResponse.json(
      { message: 'Gagal memuat detail surat masuk' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const id = await resolveId(context)
    return await proxyRequest(request, `/surat-masuk/${id}`)
  } catch (error) {
    console.error('Surat masuk proxy error (PUT):', error)
    return NextResponse.json(
      { message: 'Gagal memperbarui surat masuk' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const id = await resolveId(context)
    return await proxyRequest(request, `/surat-masuk/${id}`)
  } catch (error) {
    console.error('Surat masuk proxy error (DELETE):', error)
    return NextResponse.json(
      { message: 'Gagal menghapus surat masuk' },
      { status: 500 }
    )
  }
}
