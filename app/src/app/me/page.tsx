'use client'

import { ButtonLink } from '@/components/buttonLink'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getData } from '@/hooks/dataHook'
import { type WgtDay, getDateFromDay } from '@/lib/dates'
import { type ScheduleData, ScheduleStatus, getScheduleData } from '@/lib/scheduleData'
import { generateBandSlug } from '@/lib/utils'
import type { BandInfo } from '@/types/band'
import type { Data } from '@/types/data'
import Link from 'next/link'
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
      {myBands.length === 0 ? (
        <Card className={'mb-2'}>
          <CardHeader className='p-3 pb-1'>
            <CardTitle>No bands added</CardTitle>
          </CardHeader>
          <CardContent className='p-3 pt-0'>
            Go to the <Link href={'/bands'}>Bands</Link> page and start adding bands!
          </CardContent>
        </Card>
      ) : (
        <></>
      )}

      {days.map((day) => {
        return (
          <Fragment key={day}>
            <h1 className='text-2xl mb-1'>{day}</h1>

            {myBands
              .sort((a, b) => {
                if (b.time.startsWith('0') || a.time.startsWith('0')) {
                  return b.time.localeCompare(a.time)
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

  const bandsAdded = data.bands.filter((band: BandInfo) => schedule[band.name] === ScheduleStatus.SCHEDULED).length
  const bandsInterested = data.bands.filter((band: BandInfo) => schedule[band.name] === ScheduleStatus.SCHEDULED).length
  const bandsUndefined = data.bands.length - bandsAdded - bandsInterested

  return (
    <Tabs defaultValue='added' className='w-full'>
      <TabsList className='w-full'>
        <TabsTrigger className='w-1/3' value='added'>
          Added ({bandsAdded})
        </TabsTrigger>
        <TabsTrigger className='w-1/3' value='interested'>
          Interested ({bandsInterested})
        </TabsTrigger>
        <TabsTrigger className='w-1/3' value='uncategorized'>
          Not categorized ({bandsUndefined})
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

export const dynamic = 'force-static'
