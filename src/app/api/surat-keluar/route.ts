import { NextResponse } from 'next/server'
import { proxyRequest } from '@/app/api/_utils/proxy'

export async function GET(request: Request) {
  try {
    return await proxyRequest(request, '/surat-keluar')
  } catch (error) {
    console.error('Surat keluar proxy error (GET):', error)
    return NextResponse.json(
      { message: 'Gagal memuat data surat keluar' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    return await proxyRequest(request, '/surat-keluar')
  } catch (error) {
    console.error('Surat keluar proxy error (POST):', error)
    return NextResponse.json(
      { message: 'Gagal membuat surat keluar' },
      { status: 500 }
    )
  }
}
