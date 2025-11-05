import { NextResponse } from 'next/server'
import { headers } from 'next/headers'

export async function POST() {
  const res = NextResponse.json({
    message: 'Logout berhasil',
  })

  // Clear auth cookie
  const headersList = headers()
  const forwardedProto = headersList.get('x-forwarded-proto')
  res.cookies.set('auth-token', '', {
    path: '/',
    httpOnly: false,
    sameSite: 'lax',
    maxAge: 0,
    expires: new Date(0),
    secure: forwardedProto === 'https',
  })

  return res
}
