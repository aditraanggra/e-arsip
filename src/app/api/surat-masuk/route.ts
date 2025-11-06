import { NextResponse } from 'next/server'
import { proxyRequest } from '@/app/api/_utils/proxy'

export async function GET(request: Request) {
  try {
    return await proxyRequest(request, '/surat-masuk')
  } catch (error) {
    console.error('Surat masuk proxy error (GET):', error)
    return NextResponse.json(
      { message: 'Gagal memuat data surat masuk' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    return await proxyRequest(request, '/surat-masuk')
  } catch (error) {
    console.error('Surat masuk proxy error (POST):', error)
    return NextResponse.json(
      { message: 'Gagal membuat surat masuk' },
      { status: 500 }
    )
  }
}
