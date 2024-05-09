'use client'

import { ButtonLink } from '@/components/buttonLink'
import { Spinner } from '@/components/spinner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getData } from '@/hooks/dataHook'
import { getDateFromDay } from '@/lib/dates'
import { type ScheduleData, ScheduleStatus, getScheduleData } from '@/lib/scheduleData'
import { activeButton, primaryColor } from '@/lib/theme'
import { generateBandSlug } from '@/lib/utils'
import type { BandInfo } from '@/types/band'
import type { Data } from '@/types/data'
import { Fragment, useEffect, useState } from 'react'

const MySchedule = () => {
  const initialData: Data = { bands: [], genres: [], styles: [] }
  const [data, setData] = useState(initialData)

  const initialSchedule: ScheduleData = {}
  const [schedule, setSchedule] = useState(initialSchedule)

  useEffect(() => {
    const load = async () => {
      const data = await getData()
      setData(data)
      const schedule = getScheduleData()
      setSchedule(schedule)
    }
    load()
  }, [])

  if (!data || !data.bands) {
    return <div>No data</div>
  }

  const myBands = data.bands.filter((band: BandInfo) => schedule[band.id] === ScheduleStatus.SCHEDULED)

  const allVenues: string[] = myBands.map((band: BandInfo) => band.venue)
  const venues = allVenues
    .filter((value, index, array) => {
      return array.indexOf(value) === index
    })
    .sort((a, b) => a.localeCompare(b))

  return (
    <div>
      <Tabs defaultValue='added' className='w-full'>
        <TabsList className='w-full'>
          <TabsTrigger className='w-1/3' value='added'>
            Added
          </TabsTrigger>
          <TabsTrigger className='w-1/3' value='interested'>
            Interested
          </TabsTrigger>
          <TabsTrigger className='w-1/3' value='nope'>
            Not for me
          </TabsTrigger>
        </TabsList>
        <TabsContent value='added'>Make changes to your account here.</TabsContent>
        <TabsContent value='password'>Change your password here.</TabsContent>
      </Tabs>

      {['Friday', 'Saturday', 'Sunday', 'Monday'].map((day) => {
        return (
          <Fragment key={day}>
            <h1 className='text-2xl mb-1'>{day}</h1>

            {myBands
              .sort((a, b) => {
                if (b.time.startsWith('0')) {
                  return -1
                }
                return a.time.localeCompare(b.time)
              })
              .map((band) => {
                if (band.date === getDateFromDay(day)) {
                  return (
                    <ButtonLink
                      key={`band-${band.id}`}
                      href={`/band/${generateBandSlug(band.name)}`}
                      className='w-full'
                    >
                      <span className='w-11 inline-block text-right'>{band.time}</span>
                      <span className='pl-4 mb-1 inline-block'>{band.name}</span>
                      <span className='float-right inline-block'>{band.venue}</span>
                    </ButtonLink>
                  )
                }
              })}
          </Fragment>
        )
      })}
    </div>
  )
}

export default MySchedule
