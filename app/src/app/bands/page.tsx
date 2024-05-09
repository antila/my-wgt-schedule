'use client'

import { ButtonLink } from '@/components/buttonLink'
import { Filter } from '@/components/filter'
import { Spinner } from '@/components/spinner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { getClientData, getDiscogsData, useDataQuery, useDiscogsQuery } from '@/hooks/dataHook'
import { ScheduleStatus, getBandState } from '@/lib/scheduleData'
import { activeButton, interestedButton, mutedText, notInterestedButton } from '@/lib/theme'
import { generateBandSlug } from '@/lib/utils'
import { X } from 'lucide-react'
import { useState } from 'react'

// import { useDataQuery } from '@/hooks/dataHook'

const Bands = () => {
  const { isPending: isPending1, data } = useDataQuery()
  const { isPending: isPending2, data: discogsData } = useDiscogsQuery()
  // const data = await getClientData()
  // const discogsData = await getDiscogsData()

  const initialGenres: string[] = []
  const initialStyles: string[] = []
  const [selectedGenres, setSelectedGenres] = useState(initialGenres)
  const [selectedStyles, setSelectedStyles] = useState(initialStyles)

  if (isPending1 || isPending2) {
    return <Spinner />
  }

  if (!data || !discogsData) {
    return <div>No data</div>
  }
  // console.log('home', isPending, error, data)
  console.log('data', Object.keys(data))

  const selectedBands = data.bands?.filter((band) => {
    if (selectedGenres.length === 0 && selectedStyles.length === 0) {
      return true
    }

    const bandDiscogs = discogsData.find((item) => item.bandId === band.id)
    let found = false

    if (bandDiscogs) {
      const foundGenres = selectedGenres.some((g) => bandDiscogs.genres.includes(g))
      const foundStyles = selectedStyles.some((g) => bandDiscogs.styles.includes(g))

      if (selectedGenres.length === 0) {
        found = foundStyles
      } else if (selectedStyles.length === 0) {
        found = foundGenres
      } else {
        found = foundGenres && foundStyles
      }

      // for (const genre of bandDiscogs.genres) {
      //   if (selectedGenres.includes(genre)) {
      //     found = true
      //   }
      // }
      // for (const style of bandDiscogs.styles) {
      //   if (selectedStyles.includes(style)) {
      //     found = true
      //   }
      // }
    }

    return found
  })

  return (
    <div>
      <Filter
        data={data.genres}
        title='Genres'
        selectedGenres={selectedGenres}
        selectedStyles={selectedStyles}
        callback={(item, state) => {
          const newGenres: string[] = [...selectedGenres]
          if (state) {
            newGenres.push(item)
          } else {
            const index = newGenres.indexOf(item)
            if (index > -1) {
              newGenres.splice(index, 1)
            }
          }
          setSelectedGenres(newGenres)
        }}
      />
      <Filter
        data={data.styles}
        title='Styles'
        selectedGenres={selectedGenres}
        selectedStyles={selectedStyles}
        callback={(item, state) => {
          const newStyles: string[] = [...selectedStyles]
          if (state) {
            newStyles.push(item)
          } else {
            const index = newStyles.indexOf(item)
            if (index > -1) {
              newStyles.splice(index, 1)
            }
          }
          setSelectedStyles(newStyles)
        }}
      />

      <Button
        variant={'outline'}
        className='pt-1'
        onClick={() => {
          setSelectedGenres([])
          setSelectedStyles([])
        }}
      >
        <X className='h-5' />
      </Button>

      <h2 className={`py-2 ${mutedText}`}>
        {selectedBands.length} selected, {data.bands.length} total
      </h2>

      {selectedBands.map((band) => {
        const bandState = getBandState(band.id)
        let style = ''
        if (bandState === ScheduleStatus.SCHEDULED) {
          style = activeButton
        }
        if (bandState === ScheduleStatus.NO) {
          style = notInterestedButton
        }
        if (bandState === ScheduleStatus.INTERESTED) {
          style = interestedButton
        }

        return (
          <div key={`band-link-${band.id}`}>
            <ButtonLink noBg className={`${style} w-full`} href={`/band/${generateBandSlug(band.name)}`}>
              {band.name} <span className={`${mutedText}`}>{band.country}</span>
              {bandState === ScheduleStatus.SCHEDULED ? (
                <Badge className='float-right' variant='secondary'>
                  My Schedule
                </Badge>
              ) : (
                <></>
              )}
              {bandState === ScheduleStatus.NO ? (
                <Badge className='float-right' variant='secondary'>
                  Not for me
                </Badge>
              ) : (
                <></>
              )}
              {bandState === ScheduleStatus.INTERESTED ? (
                <Badge className='float-right' variant='secondary'>
                  Interested
                </Badge>
              ) : (
                <></>
              )}
            </ButtonLink>
          </div>
        )
      })}
    </div>
  )
}

export default Bands
