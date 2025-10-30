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
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-4 py-2">
          <FileText className="h-6 w-6" />
          <span className="font-semibold">
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
                    isActive={pathname === item.url || pathname.startsWith(item.url + '/')}
                  >
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <div className="p-4 space-y-2">
          <div className="text-sm text-muted-foreground">
            Masuk sebagai: <span className="font-medium">{user?.name}</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={logout}
            className="w-full justify-start"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Keluar
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}