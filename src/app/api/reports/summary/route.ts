import { NextResponse } from 'next/server'
import { proxyRequest } from '@/app/api/_utils/proxy'

export async function GET(request: Request) {
  try {
    return await proxyRequest(request, '/reports/summary')
  } catch (error) {
    console.error('Reports summary proxy error:', error)
    return NextResponse.json(
      { message: 'Gagal memuat ringkasan laporan' },
      { status: 500 }
    )
  }
}
