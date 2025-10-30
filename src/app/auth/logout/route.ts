import { NextResponse } from 'next/server'

export async function POST() {
  const res = NextResponse.json({
    message: 'Logout berhasil',
  })

  // Clear auth cookie
  res.cookies.set('auth-token', '', {
    path: '/',
    httpOnly: false,
    sameSite: 'lax',
    maxAge: 0,
  })

  return res
}