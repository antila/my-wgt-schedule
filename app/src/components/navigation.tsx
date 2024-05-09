'use client'
import { Separator } from '@/components/ui/separator'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { navBackground } from '@/lib/theme'
import { CalendarDays, Home, MapPinned, Menu, Music, Settings, UserRound } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

interface NavLinkProps {
  href: string
  children: React.ReactNode
}

const NavLink = ({ children, href }: NavLinkProps): JSX.Element => {
  return (
    <Link className='m-2 w-35 h-10 text-sm inline-block content-around items-center text-center basis-1/4' href={href}>
      {children}
    </Link>
  )
}

interface SidebarLinkProps {
  href: string
  children: React.ReactNode
  onClick: () => void
}

const SidebarLink = ({ children, href, onClick }: SidebarLinkProps): JSX.Element => {
  return (
    <Link className='m-2 w-full text-2xl inline-block' href={href} onClick={onClick}>
      {children}
    </Link>
  )
}

export const Navigation = (): JSX.Element => {
  const [open, setOpen] = React.useState(false)

  const onClick = () => {
    setOpen(false)
  }

  return (
    <div className={`mb-2 py-2 flex ${navBackground}`}>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger>
          <Menu className='w-24' />
        </SheetTrigger>
        <SheetContent side={'left'}>
          <SheetHeader>
            <SheetTitle>My WGT Schedule</SheetTitle>
            <SheetDescription>
              <SidebarLink href={'/'} onClick={onClick}>
                Home
              </SidebarLink>
              <Separator />
              <SidebarLink href={'/me'} onClick={onClick}>
                Schedule
              </SidebarLink>
              <Separator />
              <SidebarLink href={'/bands'} onClick={onClick}>
                Bands
              </SidebarLink>
              <Separator />
              <SidebarLink href={'/days'} onClick={onClick}>
                Days
              </SidebarLink>
              <Separator />
              {/* <SidebarLink href={'/venues'} onClick={onClick}>
                Venues
              </SidebarLink>
              <Separator />
              <SidebarLink href={'/resources'} onClick={onClick}>
                Resources
              </SidebarLink>
              <Separator />
              <SidebarLink href={'/settings'} onClick={onClick}>
                Settings
              </SidebarLink>
              <Separator />
              <SidebarLink href={'/about'} onClick={onClick}>
                About
              </SidebarLink> */}
            </SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>

      <NavLink href={'/me'}>
        <UserRound className='m-auto' />
        Schedule
      </NavLink>
      <NavLink href={'/bands'}>
        <Music className='m-auto' />
        Bands
      </NavLink>
      <NavLink href={'/days'}>
        <CalendarDays className='m-auto' />
        Days
      </NavLink>
      {/* <NavLink href={'/venues'}>
        <MapPinned className='m-auto' />
        Venues
      </NavLink> */}

      {/* <NavLink href={'/resources'}>Resources</NavLink> */}
    </div>
  )
}
