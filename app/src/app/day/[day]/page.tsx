// 'use client'

import { ButtonLink } from '@/components/buttonLink'
import { Spinner } from '@/components/spinner'
import { getData } from '@/hooks/dataHook'
import { getDateFromDay } from '@/lib/dates'
import { activeButton, primaryColor } from '@/lib/theme'
import { generateBandSlug } from '@/lib/utils'

const Day = async ({ params }: { params: { day: string } }) => {
  const { day } = params

  // const { isPending, data: bands } = useDataQuery()
  const data = await getData()

  // console.log('day', day)

  // if (isPending) {
  //   return <Spinner />
  // }

  if (!data) {
    return <div>No data</div>
  }

  const todaysDate = getDateFromDay(day)
  const todaysBands = data.bands.filter((band) => band.date === todaysDate)
  const allVenues: string[] = todaysBands.map((band) => band.venue)
  const venues = allVenues
    .filter((value, index, array) => {
      return array.indexOf(value) === index
    })
    .sort((a, b) => a.localeCompare(b))

  return (
    <div>
      <ButtonLink
        noBg={day === 'friday'}
        className={` mr-[6px] ${day === 'friday' ? activeButton : ''}`}
        href={'/day/friday'}
      >
        Friday
      </ButtonLink>
      <ButtonLink
        noBg={day === 'saturday'}
        className={` mr-[6px] ${day === 'saturday' ? activeButton : ''}`}
        href={'/day/saturday'}
      >
        Saturday
      </ButtonLink>
      <ButtonLink
        noBg={day === 'sunday'}
        className={` mr-[6px] ${day === 'sunday' ? activeButton : ''}`}
        href={'/day/sunday'}
      >
        Sunday
      </ButtonLink>
      <ButtonLink
        noBg={day === 'monday'}
        className={` mr-0 ${day === 'monday' ? activeButton : ''}`}
        href={'/day/monday'}
      >
        Monday
      </ButtonLink>

      {venues.map((venue) => {
        return (
          <div key={`venue-${venue}`} className='mb-6'>
            <h1 className='text-2xl mb-1'>{venue}</h1>
            {todaysBands
              .sort((a, b) => {
                if (b.time.startsWith('0')) {
                  return -1
                }
                return a.time.localeCompare(b.time)
              })
              .map((band) => {
                if (band.venue === venue) {
                  return (
                    <ButtonLink
                      key={`band-${band.id}`}
                      href={`/band/${generateBandSlug(band.name)}`}
                      className='w-full'
                    >
                      <span className='w-11 inline-block text-right'>{band.time}</span>
                      <span className='pl-4 mb-1 inline-block'>{band.name}</span>
                    </ButtonLink>
                  )
                }
              })}
          </div>
        )
      })}
    </div>
  )
}

export const generateStaticParams = async () => {
  return [{ day: 'friday' }, { day: 'saturday' }, { day: 'sunday' }, { day: 'monday' }]
}

export default Day
