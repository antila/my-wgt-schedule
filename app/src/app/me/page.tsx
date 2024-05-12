'use client'

import { ButtonLink } from '@/components/buttonLink'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getData } from '@/hooks/dataHook'
import { type WgtDay, getDateFromDay } from '@/lib/dates'
import { type ScheduleData, ScheduleStatus, getScheduleData } from '@/lib/scheduleData'
import { generateBandSlug } from '@/lib/utils'
import type { BandInfo } from '@/types/band'
import type { Data } from '@/types/data'
import { Fragment, useEffect, useState } from 'react'

const BandList = ({
  bands,
  schedule,
  status,
}: { bands: BandInfo[]; schedule: ScheduleData; status: ScheduleStatus }) => {
  let myBands = bands.filter((band: BandInfo) => schedule[band.name] === status)

  if (status === ScheduleStatus.UNDEFINED) {
    myBands = bands.filter((band: BandInfo) => Object.hasOwn(schedule, band.name) === false)
  }

  const days: WgtDay[] = ['Friday', 'Saturday', 'Sunday', 'Monday']

  return (
    <>
      {days.map((day) => {
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
                      key={`band-${band.name}`}
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
    </>
  )
}

const MySchedule = () => {
  const initialData: Data = { bands: [], genres: [], styles: [], history: [] }
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

  return (
    <Tabs defaultValue='added' className='w-full'>
      <TabsList className='w-full'>
        <TabsTrigger className='w-1/3' value='added'>
          Added
        </TabsTrigger>
        <TabsTrigger className='w-1/3' value='interested'>
          Interested
        </TabsTrigger>
        <TabsTrigger className='w-1/3' value='uncategorized'>
          Not categorized
        </TabsTrigger>
      </TabsList>
      <TabsContent value='added'>
        <BandList bands={data.bands} schedule={schedule} status={ScheduleStatus.SCHEDULED} />
      </TabsContent>
      <TabsContent value='interested'>
        <BandList bands={data.bands} schedule={schedule} status={ScheduleStatus.INTERESTED} />
      </TabsContent>
      <TabsContent value='uncategorized'>
        <BandList bands={data.bands} schedule={schedule} status={ScheduleStatus.UNDEFINED} />
      </TabsContent>
    </Tabs>
  )
}

export default MySchedule
