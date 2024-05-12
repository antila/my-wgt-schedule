'use client'

import { useDiscogsQuery } from '@/hooks/dataHook'
import { mutedText } from '@/lib/theme'
import { ListFilter } from 'lucide-react'
import { Fragment } from 'react'

import type { DropdownMenuCheckboxItemProps } from '@radix-ui/react-dropdown-menu'
import * as React from 'react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

type Checked = DropdownMenuCheckboxItemProps['checked']

interface FilterProps {
  data: string[]
  title: 'Genres' | 'Styles'
  selectedGenres: string[]
  selectedStyles: string[]
  callback: (item: string, state: boolean) => void
}

export const Filter = ({ data, title, selectedGenres, selectedStyles, callback }: FilterProps) => {
  const { isPending, data: discogsData } = useDiscogsQuery()
  if (isPending || !discogsData) {
    return <></>
  }

  const withCount = data?.map((item) => {
    const countItem = {
      text: item,
      count: 0,
    }

    if (title === 'Genres') {
      const found = discogsData.filter((discogData) => {
        return discogData.genres.includes(item)
      })
      countItem.count = found.length
    } else {
      const found = discogsData.filter((discogData) => {
        if (selectedGenres.length > 0) {
          const found = selectedGenres.some((g) => discogData.genres.includes(g))
          return discogData.styles.includes(item) && found
        }
        return discogData.styles.includes(item)
      })
      countItem.count = found.length
    }
    return countItem
  })

  withCount.sort((a, b) => {
    return b.count - a.count
  })

  return (
    <div className='mr-2 inline-block'>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant='outline'>
            <ListFilter className='h-4' /> Filter {title}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className='w-64 overflow-auto max-h-[80vh] ml-2 drop-shadow-[0_5px_15px_rgba(79,70,229,0.25)]'>
          <DropdownMenuLabel>{title}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {withCount?.map((item) => {
            if (title === 'Genres' && item.count < 2) {
              return <Fragment key={item.text} />
            }

            if (item.count === 0) {
              return <Fragment key={item.text} />
            }

            let pressed = false
            if (title === 'Genres') {
              pressed = selectedGenres.includes(item.text)
            } else {
              pressed = selectedStyles.includes(item.text)
            }

            return (
              <DropdownMenuCheckboxItem
                checked={pressed}
                className='mr-2'
                key={item.text}
                onCheckedChange={(event) => {
                  callback(item.text, event)
                }}
              >
                {item.text} <span className={`ml-1 ${mutedText}`}>({item.count})</span>
              </DropdownMenuCheckboxItem>
            )
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )

  // return (
  //   <Accordion type='single' collapsible className='mb-4'>
  //     <AccordionItem value='item-1'>
  //       <AccordionTrigger>Filter by {title}</AccordionTrigger>
  //       <AccordionContent></AccordionContent>
  //     </AccordionItem>
  //   </Accordion>
  // )
}
