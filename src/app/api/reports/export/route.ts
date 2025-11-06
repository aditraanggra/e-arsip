import { NextResponse } from 'next/server'
import { proxyRequest } from '@/app/api/_utils/proxy'

export async function POST(request: Request) {
  try {
    return await proxyRequest(request, '/reports/export')
  } catch (error) {
    console.error('Reports export proxy error:', error)
    return NextResponse.json(
      { message: 'Gagal mengekspor laporan' },
      { status: 500 }
    )
  }
}
