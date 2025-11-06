import { NextResponse } from 'next/server'
import { proxyRequest } from '@/app/api/_utils/proxy'

export async function GET(request: Request) {
  try {
    return await proxyRequest(request, '/categories')
  } catch (error) {
    console.error('Categories proxy error:', error)
    return NextResponse.json({ message: 'Gagal mengambil kategori' }, { status: 500 })
  }
}
