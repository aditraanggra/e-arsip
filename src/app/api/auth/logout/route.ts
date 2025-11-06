import { NextResponse } from 'next/server'
import { proxyRequest } from '@/app/api/_utils/proxy'

const AUTH_COOKIE_NAME = 'auth-token'

export async function POST(request: Request) {
  const forwardedProto = request.headers.get('x-forwarded-proto')

  try {
    const response = await proxyRequest(request, '/logout')
    response.cookies.set(AUTH_COOKIE_NAME, '', {
      path: '/',
      httpOnly: false,
      sameSite: 'lax',
      maxAge: 0,
      expires: new Date(0),
      secure: forwardedProto === 'https',
    })
    return response
  } catch (error) {
    console.error('Logout proxy error:', error)
    const response = NextResponse.json(
      { message: 'Logout gagal' },
      { status: 500 }
    )
    response.cookies.set(AUTH_COOKIE_NAME, '', {
      path: '/',
      httpOnly: false,
      sameSite: 'lax',
      maxAge: 0,
      expires: new Date(0),
      secure: forwardedProto === 'https',
    })
    return response
  }
}
