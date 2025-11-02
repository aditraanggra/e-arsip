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
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import {
  LayoutDashboard,
  Mail,
  Send,
  BarChart3,
  Upload,
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
    url: '/reports',
    icon: BarChart3,
  },
  {
    title: 'Impor Data',
    url: '/imports',
    icon: Upload,
  },
]

export function AppSidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  return (
    <Sidebar className='border-r border-emerald-100/70 bg-white/85 backdrop-blur'>
      <SidebarHeader className='border-b border-sidebar-border'>
        <div className='flex items-center gap-2 px-4 py-2'>
          <FileText className='h-6 w-6 text-emerald-600' />
          <span className='font-semibold text-emerald-700'>
            {process.env.NEXT_PUBLIC_APP_NAME || 'E-Arsip'}
          </span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu Utama</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    className='bg-gray-100 text-gray-700 hover:!bg-gray-200 hover:!text-gray-900 data-[active=true]:!bg-emerald-100 data-[active=true]:!text-emerald-800 data-[active=true]:hover:!bg-emerald-100 data-[active=true]:hover:!text-emerald-800'
                    isActive={
                      pathname === item.url ||
                      pathname.startsWith(item.url + '/')
                    }
                  >
                    <Link href={item.url}>
                      <item.icon className='h-4 w-4' />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className='border-t border-sidebar-border'>
        <div className='p-4 space-y-2'>
          <div className='text-sm text-muted-foreground'>
            Masuk sebagai: <span className='font-medium'>{user?.name}</span>
          </div>
          <Button
            variant='outline'
            size='sm'
            onClick={logout}
            className='w-full justify-start border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800'
          >
            <LogOut className='h-4 w-4 mr-2' />
            Keluar
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
