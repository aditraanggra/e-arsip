import { NextResponse } from 'next/server'

type Credentials = {
  email: string
  password: string
}

const AUTH_COOKIE_NAME = 'auth-token'

const baseApiUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.API_BASE_URL ||
  ''

const loginEndpoint =
  process.env.NEXT_PUBLIC_AUTH_LOGIN_ENDPOINT ||
  process.env.AUTH_LOGIN_ENDPOINT ||
  '/login'

function hasJsonContent(contentType: string | null) {
  return !!contentType && contentType.toLowerCase().includes('application/json')
}

async function parseCredentials(request: Request): Promise<Credentials> {
  const contentType = request.headers.get('content-type')

  if (hasJsonContent(contentType)) {
    const body = await request.json().catch(() => null)
    const email = typeof body?.email === 'string' ? body.email : ''
    const password = typeof body?.password === 'string' ? body.password : ''
    return { email, password }
  }

  try {
    const formData = await request.formData()
    const email = formData.get('email')
    const password = formData.get('password')
    return {
      email: typeof email === 'string' ? email : '',
      password: typeof password === 'string' ? password : '',
    }
  } catch {
    return { email: '', password: '' }
  }
}

function assertCredentials({ email, password }: Credentials) {
  if (!email || !password) {
    throw new Error('Email dan password wajib diisi')
  }
}

function resolveLoginUrl() {
  const trimmedEndpoint = loginEndpoint.trim()

  if (/^https?:\/\//i.test(trimmedEndpoint)) {
    return trimmedEndpoint
  }

  if (!baseApiUrl) {
    throw new Error('Konfigurasi NEXT_PUBLIC_API_BASE_URL belum diset')
  }

  const base = baseApiUrl.endsWith('/')
    ? baseApiUrl.slice(0, -1)
    : baseApiUrl
  const path = trimmedEndpoint.startsWith('/')
    ? trimmedEndpoint
    : `/${trimmedEndpoint}`

  return `${base}${path}`
}

function pickToken(payload: unknown): string | null {
  if (!payload || typeof payload !== 'object') return null

  const data =
    'data' in payload && typeof (payload as Record<string, unknown>).data === 'object'
      ? (payload as { data: Record<string, unknown> }).data
      : (payload as Record<string, unknown>)

  const candidate =
    (data?.token as string | undefined) ??
    (data?.access_token as string | undefined) ??
    (payload as Record<string, unknown>).token ??
    (payload as Record<string, unknown>).access_token

  if (typeof candidate !== 'string' || candidate.length === 0) {
    return null
  }

  return candidate
}

export async function POST(request: Request) {
  const forwardedProto = request.headers.get('x-forwarded-proto')
  try {
    const credentials = await parseCredentials(request)
    assertCredentials(credentials)

    const loginUrl = resolveLoginUrl()
    const backendResponse = await fetch(loginUrl, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    })

    const rawText = await backendResponse.text()
    let parsed: unknown = null

    if (rawText) {
      try {
        parsed = JSON.parse(rawText)
      } catch {
        parsed = rawText
      }
    }

    if (!backendResponse.ok) {
      const status = backendResponse.status || 500
      const message =
        typeof parsed === 'object' &&
        parsed !== null &&
        'message' in parsed &&
        typeof (parsed as { message?: unknown }).message === 'string'
          ? (parsed as { message: string }).message
          : 'Login gagal'

      const response = NextResponse.json(
        {
          message,
          data: parsed,
        },
        { status }
      )

      response.cookies.set(AUTH_COOKIE_NAME, '', {
        path: '/',
        sameSite: 'lax',
        httpOnly: false,
        maxAge: 0,
        secure: forwardedProto === 'https',
      })

      return response
    }

    const response = NextResponse.json(
      parsed ?? { message: 'Login berhasil' },
      { status: backendResponse.status }
    )

    const token = pickToken(parsed)
    if (token) {
      response.cookies.set(AUTH_COOKIE_NAME, 'active', {
        path: '/',
        httpOnly: false,
        sameSite: 'lax',
        secure: forwardedProto === 'https',
        maxAge: 60 * 60 * 24,
      })
    }

    return response
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Login gagal'
    const response = NextResponse.json(
      {
        message,
      },
      { status: 400 }
    )

    const forwardedProto = request.headers.get('x-forwarded-proto')
    response.cookies.set(AUTH_COOKIE_NAME, '', {
      path: '/',
      sameSite: 'lax',
      httpOnly: false,
      maxAge: 0,
      secure: forwardedProto === 'https',
    })

    return response
  }
}
