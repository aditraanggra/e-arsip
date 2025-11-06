import { NextResponse } from 'next/server'

const upstreamBaseRaw =
  process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? ''
const upstreamBase = upstreamBaseRaw.replace(/\/$/, '')

export function ensureUpstreamBase() {
  if (!upstreamBase) {
    throw new Error(
      'API base URL is not configured. Set API_BASE_URL or NEXT_PUBLIC_API_BASE_URL.'
    )
  }
  return upstreamBase
}

const passThroughHeaders = ['x-client-version', 'x-request-id']

function buildUpstreamHeaders(request: Request, override?: HeadersInit) {
  const headers = new Headers()
  headers.set('Accept', 'application/json')

  passThroughHeaders.forEach((key) => {
    const value = request.headers.get(key)
    if (value) headers.set(key, value)
  })

  const auth = request.headers.get('authorization')
  if (auth) {
    headers.set('Authorization', auth)
  }

  const contentType = request.headers.get('content-type')
  if (contentType && !headers.has('Content-Type')) {
    headers.set('Content-Type', contentType)
  }

  if (override) {
    new Headers(override).forEach((value, key) => headers.set(key, value))
  }

  return headers
}

async function readBody(request: Request) {
  const method = request.method.toUpperCase()
  if (method === 'GET' || method === 'HEAD') {
    return undefined
  }

  const contentType = request.headers.get('content-type') || ''

  if (contentType.includes('application/json')) {
    const body = await request.json().catch(() => null)
    return body !== null ? JSON.stringify(body) : undefined
  }

  if (
    contentType.includes('application/x-www-form-urlencoded') ||
    contentType.includes('multipart/form-data')
  ) {
    return request.formData()
  }

  return request.body
}

async function forward(
  request: Request,
  path: string,
  init?: RequestInit & { rawBody?: BodyInit | null }
) {
  const url = new URL(request.url)
  const targetUrl = `${ensureUpstreamBase()}${path}${url.search}`

  const headers = buildUpstreamHeaders(request, init?.headers)
  const body =
    init?.rawBody !== undefined ? init.rawBody : await readBody(request)

  return fetch(targetUrl, {
    method: init?.method ?? request.method,
    headers,
    body,
    cache: 'no-store',
  })
}

export async function proxyRequest(
  request: Request,
  path: string,
  init?: RequestInit & { rawBody?: BodyInit | null }
) {
  const upstreamResponse = await forward(request, path, init)
  const responseHeaders = new Headers()

  upstreamResponse.headers.forEach((value, key) => {
    if (key.toLowerCase() === 'transfer-encoding') {
      return
    }
    responseHeaders.set(key, value)
  })

  const arrayBuffer = await upstreamResponse.arrayBuffer()

  return new NextResponse(arrayBuffer, {
    status: upstreamResponse.status,
    headers: responseHeaders,
  })
}
