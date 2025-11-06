import { http, HttpResponse, delay } from 'msw'
import { mockUser } from '../data'

const MOCK_LATENCY = 300

// These handlers use relative paths to catch direct requests
export const relativeAuthHandlers = [
  // Auth endpoints - Relative path handlers
  http.post('/login', async ({ request }) => {
    await delay(MOCK_LATENCY)
    
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>
    const email = typeof body['email'] === 'string' ? (body['email'] as string) : ''
    const password = typeof body['password'] === 'string' ? (body['password'] as string) : ''

    if (
      (email === 'admin@earsip.com' && password === 'password') ||
      (email === 'admin@example.com' && password === 'password123')
    ) {
      return HttpResponse.json({
        data: {
          user: mockUser,
          token: 'mock-jwt-token-12345',
        },
        message: 'Login berhasil',
      })
    }
    
    return HttpResponse.json(
      { message: 'Email atau password salah' },
      { status: 401 }
    )
  }),

  http.post('/api/auth/login', async ({ request }) => {
    await delay(MOCK_LATENCY)
    
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>
    const email = typeof body['email'] === 'string' ? (body['email'] as string) : ''
    const password = typeof body['password'] === 'string' ? (body['password'] as string) : ''

    if (
      (email === 'admin@earsip.com' && password === 'password') ||
      (email === 'admin@example.com' && password === 'password123')
    ) {
      return HttpResponse.json({
        data: {
          user: mockUser,
          token: 'mock-jwt-token-12345',
        },
        message: 'Login berhasil',
      })
    }
    
    return HttpResponse.json(
      { message: 'Email atau password salah' },
      { status: 401 }
    )
  }),

  http.post('/logout', async () => {
    await delay(MOCK_LATENCY)
    return HttpResponse.json({
      message: 'Logout berhasil',
    })
  }),

  http.post('/api/auth/logout', async () => {
    await delay(MOCK_LATENCY)
    return HttpResponse.json({
      message: 'Logout berhasil',
    })
  }),

  http.get('/user', async ({ request }) => {
    await delay(MOCK_LATENCY)
    
    const authHeader = request.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    return HttpResponse.json({
      data: mockUser,
    })
  }),

  http.get('/api/user', async ({ request }) => {
    await delay(MOCK_LATENCY)
    
    const authHeader = request.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    return HttpResponse.json({
      data: mockUser,
    })
  }),
]
