import { NextResponse } from 'next/server'
import { proxyRequest } from '@/app/api/_utils/proxy'

export async function GET(request: Request) {
  try {
    return await proxyRequest(request, '/user')
  } catch (error) {
    console.error('User proxy error:', error)
    return NextResponse.json({ message: 'Gagal mengambil data pengguna' }, { status: 500 })
  }
}
