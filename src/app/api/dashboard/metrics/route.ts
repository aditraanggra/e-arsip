import { NextResponse } from 'next/server'
import { proxyRequest } from '@/app/api/_utils/proxy'

export async function GET(request: Request) {
  try {
    return await proxyRequest(request, '/dashboard/metrics')
  } catch (error) {
    console.error('Dashboard metrics proxy error:', error)
    return NextResponse.json(
      { message: 'Gagal memuat data dashboard' },
      { status: 500 }
    )
  }
}
