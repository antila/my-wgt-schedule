'use client'
import { Separator } from '@/components/ui/separator'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { navBackground } from '@/lib/theme'
import { CalendarDays, Home, MapPinned, Menu, Music, Settings, UserRound } from 'lucide-react'
import Link from 'next/link'

interface NavLinkProps {
  href: string
  children: React.ReactNode
}

const NavLink = ({ children, href }: NavLinkProps): JSX.Element => {
  return (
    <Link className='m-2 w-35 h-15 inline-block content-around items-center text-center basis-1/5' href={href}>
      {children}
    </Link>
  )
}

const SidebarLink = ({ children, href }: NavLinkProps): JSX.Element => {
  return (
    <Link className='m-2 w-full text-2xl inline-block' href={href}>
      {children}
    </Link>
  )
}

export const Navigation = (): JSX.Element => {
  return (
    <div className={`mb-2 py-2 flex ${navBackground}`}>
      <Sheet>
        <SheetTrigger>
          <Menu className='w-24' />
        </SheetTrigger>
        <SheetContent side={'left'}>
          <SheetHeader>
            <SheetTitle>My WGT Schedule</SheetTitle>
            <SheetDescription>
              <SidebarLink href={'/'}>Home</SidebarLink>
              <Separator />
              <SidebarLink href={'/me'}>My Schedule</SidebarLink>
              <Separator />
              <SidebarLink href={'/bands'}>Bands</SidebarLink>
              <Separator />
              <SidebarLink href={'/days'}>Days</SidebarLink>
              <Separator />
              <SidebarLink href={'/venues'}>Venues</SidebarLink>
              <Separator />
              <SidebarLink href={'/resources'}>Resources</SidebarLink>
              <Separator />
              <SidebarLink href={'/settings'}>Settings</SidebarLink>
              <Separator />
              <SidebarLink href={'/about'}>About</SidebarLink>
            </SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>

      <NavLink href={'/me'}>
        <UserRound className='m-auto' />
        My Schedule
      </NavLink>
      <NavLink href={'/bands'}>
        <Music className='m-auto' />
        Bands
      </NavLink>
      <NavLink href={'/days'}>
        <CalendarDays className='m-auto' />
        Days
      </NavLink>
      <NavLink href={'/venues'}>
        <MapPinned className='m-auto' />
        Venues
      </NavLink>

      {/* <NavLink href={'/resources'}>Resources</NavLink> */}
    </div>
  )
}
