'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { loginSchema, type LoginData } from '@/lib/schemas'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Eye, EyeOff, Mail, Lock, FileText } from 'lucide-react'

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()
  const { login, isAuthenticated } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginData) => {
    try {
      await login(data)
      toast.success('Login berhasil!')
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'Login gagal. Silakan coba lagi.'
      toast.error(message || 'Login gagal. Silakan coba lagi.')
    }
  }

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/dashboard')
    }
  }, [isAuthenticated, router])

  return (
    <div className='min-h-screen flex'>
      {/* Left Side - Branding */}
      <div className='hidden lg:flex lg:w-1/2 xl:w-[55%] horizon-gradient relative overflow-hidden'>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-50" />

        <div className='relative z-10 flex flex-col justify-center px-12 xl:px-20'>
          <div className='flex items-center gap-4 mb-8'>
            <div className='flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 backdrop-blur'>
              <FileText className='h-7 w-7 text-white' />
            </div>
            <div>
              <h1 className='text-3xl font-bold text-white'>
                {process.env.NEXT_PUBLIC_APP_NAME || 'E-Arsip'}
              </h1>
              <p className='text-white/60 text-sm'>
                Document Management System
              </p>
            </div>
          </div>

          <h2 className='text-4xl xl:text-5xl font-bold text-white leading-tight mb-6'>
            Kelola Arsip Surat
            <br />
            <span className='text-white/80'>dengan Mudah & Efisien</span>
          </h2>

          <p className='text-white/70 text-lg max-w-md mb-10'>
            Sistem elektronik arsip surat yang membantu Anda mengelola dokumen
            masuk dan keluar secara digital.
          </p>

          <div className='flex gap-6'>
            <div className='flex items-center gap-3'>
              <div className='h-12 w-12 rounded-xl bg-white/10 flex items-center justify-center'>
                <Mail className='h-5 w-5 text-white' />
              </div>
              <div>
                <p className='text-2xl font-bold text-white'>1000+</p>
                <p className='text-white/60 text-sm'>Surat Terkelola</p>
              </div>
            </div>
            <div className='flex items-center gap-3'>
              <div className='h-12 w-12 rounded-xl bg-white/10 flex items-center justify-center'>
                <FileText className='h-5 w-5 text-white' />
              </div>
              <div>
                <p className='text-2xl font-bold text-white'>100%</p>
                <p className='text-white/60 text-sm'>Digital</p>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative circles */}
        <div className='absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-white/5' />
        <div className='absolute -top-20 -right-20 h-64 w-64 rounded-full bg-white/5' />
      </div>

      {/* Right Side - Login Form */}
      <div className='flex-1 flex items-center justify-center p-6 sm:p-12 bg-background'>
        <div className='w-full max-w-md'>
          {/* Mobile Logo */}
          <div className='flex items-center gap-3 mb-8 lg:hidden'>
            <div className='flex h-12 w-12 items-center justify-center rounded-xl bg-primary'>
              <FileText className='h-6 w-6 text-primary-foreground' />
            </div>
            <div>
              <h1 className='text-xl font-bold text-foreground'>
                {process.env.NEXT_PUBLIC_APP_NAME || 'E-Arsip'}
              </h1>
              <p className='text-muted-foreground text-xs'>
                Document Management
              </p>
            </div>
          </div>

          <div className='mb-8'>
            <h2 className='text-2xl font-bold text-foreground mb-2'>
              Selamat Datang! 👋
            </h2>
            <p className='text-muted-foreground'>
              Masuk ke akun Anda untuk melanjutkan
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className='space-y-5'>
            <div className='space-y-2'>
              <Label htmlFor='email' className='text-sm font-medium'>
                Email
              </Label>
              <div className='relative'>
                <Mail className='absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground' />
                <Input
                  id='email'
                  type='email'
                  placeholder='admin@example.com'
                  className='h-12 rounded-xl border-border bg-secondary/30 pl-12 pr-4 text-sm placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary'
                  {...register('email')}
                />
              </div>
              {errors.email && (
                <p className='text-sm text-destructive'>
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className='space-y-2'>
              <Label htmlFor='password' className='text-sm font-medium'>
                Password
              </Label>
              <div className='relative'>
                <Lock className='absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground' />
                <Input
                  id='password'
                  type={showPassword ? 'text' : 'password'}
                  placeholder='••••••••'
                  className='h-12 rounded-xl border-border bg-secondary/30 pl-12 pr-12 text-sm placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary'
                  {...register('password')}
                />
                <button
                  type='button'
                  onClick={() => setShowPassword(!showPassword)}
                  className='absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors'
                >
                  {showPassword ? (
                    <EyeOff className='h-5 w-5' />
                  ) : (
                    <Eye className='h-5 w-5' />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className='text-sm text-destructive'>
                  {errors.password.message}
                </p>
              )}
            </div>

            <Button
              type='submit'
              className='w-full h-12'
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Memproses...' : 'Masuk'}
            </Button>
          </form>

          {process.env.NEXT_PUBLIC_USE_MOCKS === 'true' && (
            <div className='mt-8 p-4 bg-accent rounded-xl border border-primary/20'>
              <p className='text-sm font-medium text-accent-foreground'>
                🧪 Mode Demo
              </p>
              <p className='text-xs text-muted-foreground mt-1'>
                Email: admin@example.com
                <br />
                Password: password123
              </p>
            </div>
          )}

          <p className='mt-8 text-center text-xs text-muted-foreground'>
            © {new Date().getFullYear()} E-Arsip — Baznas Kabupaten Cianjur
          </p>
        </div>
      </div>
    </div>
  )
}
