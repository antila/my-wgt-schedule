// 'use client'

import { ButtonLink } from '@/components/buttonLink'
import { getData } from '@/hooks/dataHook'
import { generateVenueSlug } from '@/lib/utils'
import { Navigation2 } from 'lucide-react'

interface VenueList {
  name: string
  address: string
}

const Venues = async () => {
  const data = await getData()

  if (!data) {
    return <div>No data</div>
  }

  const allVenues: VenueList[] = []
  for (const band of data.bands) {
    if (!allVenues.find((v) => v.name === band.venue)) {
      allVenues.push({ name: band.venue, address: band.address })
    }
  }

  const venues = allVenues.sort((a, b) => a.name.localeCompare(b.name))

  return (
    <div>
      {venues.map((venue) => {
        return (
          <div key={`venue-${venue}`}>
            <ButtonLink href={`/venue/${generateVenueSlug(venue.name)}`} className='w-full'>
              {venue.name}
            </ButtonLink>
          </div>
        )
      })}
    </div>
  )
}

export default Venues
