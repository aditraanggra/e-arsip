import { NextResponse } from 'next/server'
import { mockUser } from '@/mocks/data'

export async function GET(request: Request) {
  const authHeader = (request.headers as any).get?.('authorization') || ''
  const bearer = typeof authHeader === 'string' ? authHeader : ''
  const isAuthed = bearer.startsWith('Bearer ')

  if (!isAuthed) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }
  return NextResponse.json({ data: mockUser })
}