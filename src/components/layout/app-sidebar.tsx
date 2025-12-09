'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/auth-context'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import {
  LayoutDashboard,
  Mail,
  Send,
  BarChart3,
  LogOut,
  FileText,
} from 'lucide-react'

const menuItems = [
  {
    title: 'Dashboard',
    url: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Surat Masuk',
    url: '/surat-masuk',
    icon: Mail,
  },
  {
    title: 'Surat Keluar',
    url: '/surat-keluar',
    icon: Send,
  },
  {
    title: 'Laporan',
    url: '/laporan',
    icon: BarChart3,
  },
]

export function AppSidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  return (
    <Sidebar
      className='border-none'
      style={{
        background:
          'linear-gradient(135deg, oklch(0.22 0.06 155) 0%, oklch(0.18 0.08 155) 100%)',
      }}
    >
      {/* Logo Section */}
      <SidebarHeader className='border-b border-white/10 px-6 py-5'>
        <div className='flex items-center gap-3'>
          <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur'>
            <FileText className='h-5 w-5 text-white' />
          </div>
          <div className='flex flex-col'>
            <span className='text-lg font-bold text-white tracking-tight'>
              {process.env.NEXT_PUBLIC_APP_NAME || 'E-Arsip'}
            </span>
            <span className='text-xs text-white/60'>Document Management</span>
          </div>
        </div>
      </SidebarHeader>

      {/* Divider */}
      <div className='mx-6 my-4'>
        <div className='h-px bg-gradient-to-r from-transparent via-white/20 to-transparent' />
      </div>

      <SidebarContent className='px-4'>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className='space-y-1'>
              {menuItems.map((item) => {
                const isActive =
                  pathname === item.url || pathname.startsWith(item.url + '/')
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className={`
                        h-12 rounded-xl px-4 transition-all duration-200
                        ${
                          isActive
                            ? 'bg-white text-sidebar shadow-lg shadow-black/20'
                            : 'text-white/70 hover:bg-white/10 hover:text-white'
                        }
                      `}
                    >
                      <Link href={item.url} className='flex items-center gap-3'>
                        <item.icon
                          className={`h-5 w-5 ${
                            isActive ? 'text-primary' : ''
                          }`}
                        />
                        <span className='font-medium'>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className='border-t border-white/10 p-4'>
        {/* User Info Card */}
        <div className='rounded-xl bg-white/10 backdrop-blur p-4'>
          <div className='flex items-center gap-3'>
            <div className='flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white font-semibold text-sm'>
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className='flex-1 min-w-0'>
              <p className='text-sm font-medium text-white truncate'>
                {user?.name || 'Guest'}
              </p>
              <p className='text-xs text-white/60 truncate'>
                {user?.email || '—'}
              </p>
            </div>
          </div>
          <button
            onClick={logout}
            className='mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-sm font-medium text-white/80 transition-colors hover:bg-white/20 hover:text-white'
          >
            <LogOut className='h-4 w-4' />
            Keluar
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
