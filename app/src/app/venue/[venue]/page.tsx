// 'use client'

import { ButtonLink } from '@/components/buttonLink'
import { getData, getVenues } from '@/hooks/dataHook'
import { getDateFromDay } from '@/lib/dates'
import { generateBandSlug, generateVenueSlug } from '@/lib/utils'
import type { VenueList } from '@/types/venue'
import { Navigation2 } from 'lucide-react'
import { Fragment } from 'react'

interface VenueProps {
  params: { venue: string }
}

const Venues = async ({ params }: VenueProps) => {
  const venueSlug = params.venue

  const venues = await getVenues()
  const data = await getData()

  const venue = venues.find((venue) => generateVenueSlug(venue.name) === venueSlug)

  if (!venue) {
    return <div>No such venue</div>
  }

  const mapQuery = encodeURIComponent(`${venue.address}, Leipzig, Germany`)

  const days: WgtDay[] = ['Friday', 'Saturday', 'Sunday', 'Monday']

  return (
    <div className='mb-6'>
      <h1 className='text-2xl mb-1'>{venue.name}</h1>
      <ButtonLink
        href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`}
        className='w-full py-2'
        target='_blank'
      >
        <Navigation2 className='inline-block' /> Navigate to {venue.address}
      </ButtonLink>

      {days.map((day) => {
        return (
          <Fragment key={day}>
            <h1 className='text-2xl mb-1'>{day}</h1>

            {data.bands
              .filter((band) => band.venue === venue.name)
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
    </div>
  )
}

export async function generateStaticParams() {
  const venues = await getVenues()

  const params = venues.map((venue) => {
    return {
      venue: generateVenueSlug(venue.name),
    }
  })

  return params
}

export default Venues
