// 'use client'

import { getData } from '@/hooks/dataHook'

const Venues = async () => {
  const data = await getData()

  if (!data) {
    return <div>No data</div>
  }

  const allVenues: string[] = data.bands.map((band) => band.venue)
  const venues = allVenues
    .filter((value, index, array) => {
      return array.indexOf(value) === index
    })
    .sort((a, b) => a.localeCompare(b))

  return (
    <div>
      {venues.map((venue) => {
        return (
          <div key={`venue-${venue}`} className='mb-6'>
            <h1 className='text-2xl mb-1'>{venue}</h1>
          </div>
        )
      })}
    </div>
  )
}

export default Venues
