'use client'

import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Input } from '@/components/ui/input'
import { Menu, LogOut, Search, Bell } from 'lucide-react'
import { useMobile } from '@/hooks/use-mobile'

export function AppHeader() {
  const { user, logout } = useAuth()
  const isMobile = useMobile()

  return (
    <header
      className='sticky top-0 z-30 mx-4 mt-4 flex h-16 items-center gap-4 rounded-2xl bg-white/80 px-4 sm:px-6 backdrop-blur-xl'
      style={{ boxShadow: 'var(--shadow-horizon-sm)' }}
    >
      {isMobile && (
        <SidebarTrigger className='shrink-0 text-foreground hover:bg-secondary md:hidden'>
          <span className='sr-only'>Toggle menu</span>
          <Menu className='h-5 w-5' />
        </SidebarTrigger>
      )}

      {/* Spacer to push content to right */}
      <div className='flex-1' />

      {/* Search Bar - positioned before user controls */}
      <div className='relative max-w-md w-64 lg:w-80'>
        <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
        <Input
          type='search'
          placeholder='Cari surat, dokumen...'
          className='h-10 w-full rounded-xl border-none bg-secondary/50 pl-10 pr-4 text-sm placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-primary/30'
        />
      </div>

      <div className='flex items-center gap-2'>
        {/* Notifications */}
        <Button
          variant='ghost'
          size='icon'
          className='relative h-10 w-10 rounded-xl hover:bg-secondary'
        >
          <Bell className='h-5 w-5 text-muted-foreground' />
          {/* TODO: Show indicator when notifications exist */}
          {/* <span className='absolute right-2 top-2 h-2 w-2 rounded-full bg-primary' /> */}
          <span className='sr-only'>Notifications</span>
        </Button>
        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant='ghost'
              className='h-10 gap-3 rounded-xl px-3 hover:bg-secondary'
            >
              <div className='flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold'>
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className='hidden flex-col items-start md:flex'>
                <span className='text-sm font-medium text-foreground'>
                  {user?.name}
                </span>
                <span className='text-xs text-muted-foreground'>
                  {user?.role || 'User'}
                </span>{' '}
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end' className='w-56 rounded-xl p-2'>
            <DropdownMenuLabel className='px-3 py-2'>
              <div className='flex flex-col space-y-1'>
                <p className='text-sm font-medium leading-none'>{user?.name}</p>
                <p className='text-xs leading-none text-muted-foreground'>
                  {user?.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => logout()}
              className='rounded-lg px-3 py-2 text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer'
            >
              <LogOut className='mr-2 h-4 w-4' />
              <span>Keluar</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
