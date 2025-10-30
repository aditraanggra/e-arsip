import { NextResponse } from 'next/server'
import { mockUser } from '@/mocks/data'

export async function POST(request: Request) {
  try {
    let email, password;
    
    // Check content type to determine how to parse the request
    const contentType = request.headers.get('content-type') || '';
    
    if (contentType.includes('application/json')) {
      // Handle JSON data
      const body = await request.json();
      email = body?.email;
      password = body?.password;
    } else {
      // Handle form data (both multipart/form-data and application/x-www-form-urlencoded)
      try {
        const formData = await request.formData();
        email = formData.get('email')?.toString();
        password = formData.get('password')?.toString();
      } catch (formError) {
        console.error('Error parsing form data:', formError);
      }
    }
    
    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { 
          message: 'Invalid input', 
          errors: [
            { expected: "string", code: "invalid_type", path: ["data", "email"], message: "Invalid input: expected string, received undefined" },
            { expected: "string", code: "invalid_type", path: ["data", "password"], message: "Invalid input: expected string, received undefined" }
          ]
        },
        { status: 400 }
      )
    }

    const isValid =
      (email === 'admin@earsip.com' && password === 'password') ||
      (email === 'admin@example.com' && password === 'password123')

    if (!isValid) {
      return NextResponse.json(
        { message: 'Email atau password salah' },
        { status: 401 }
      )
    }

    const res = NextResponse.json({
      data: {
        user: mockUser,
        token: 'mock-jwt-token-12345',
      },
      message: 'Login berhasil',
    })

    // Set cookie for middleware to detect authentication
    res.cookies.set('auth-token', 'mock-jwt-token-12345', {
      path: '/',
      httpOnly: false,
      sameSite: 'lax',
    })

    return res
  } catch (e) {
    console.error('Login error:', e);
    return NextResponse.json(
      { message: 'Bad request' },
      { status: 400 }
    )
  }
}