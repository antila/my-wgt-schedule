// 'use client'

import { Scheduler } from '@/components/band/scheduler'
import { ButtonLink } from '@/components/buttonLink'
import LazyYoutube from '@/components/lazyYoutube'
import { Spinner } from '@/components/spinner'
import { getData, getDiscogsData } from '@/hooks/dataHook'
import { getDayFromDate } from '@/lib/dates'
import { getScheduleData } from '@/lib/scheduleData'
import { generateBandSlug } from '@/lib/utils'
import type { BandInfo } from '@/types/band'
import type { DiscogsData } from '@/types/discogs'
import { ChevronLeft, ChevronRight, Plus, Sprout, Star } from 'lucide-react'
import Link from 'next/link'

// export async function getServerSideProps() {
//   const initialData = await getData()
//   const initialDiscogsData = await getDiscogsData()
//   return { props: { initialData, initialDiscogsData } }
// }

interface BandProps {
  params: { band: string }
  // props: {
  //   initialData: BandInfo[]
  //   initialDiscogsData: DiscogsData[]
  // }
}

const Band = async ({ params }: BandProps) => {
  const bandSlug = params.band

  // const { isPending, data } = useDataQuery()
  // const { isPending: discogsIsPending, data: discogsData } = useDiscogsQuery()
  const data = await getData()
  const discogsData = await getDiscogsData()

  // if (isPending || discogsIsPending) {
  //   return <Spinner />
  // }

  // if (!data || !discogsData) {
  //   return <div>No data</div>
  // }

  if (!data.bands) {
    throw new Error('no bands')
  }

  const band = data.bands.find((band) => generateBandSlug(band.name) === bandSlug)

  if (!band) {
    return <div>No such band</div>
  }

  const index = data.bands.indexOf(band)
  const prevBand = data.bands.at(index - 1)
  const nextBand = data.bands.at(index + 1)

  const discogs = discogsData.find((item) => item.bandId === band.id)

  return (
    <div className=''>
      {prevBand ? (
        <p className='float-left text-zinc-600 mb-4 text-sm'>
          <Link href={`/band/${generateBandSlug(prevBand.name)}`}>
            <ChevronLeft className='inline' /> {prevBand.name}
          </Link>
        </p>
      ) : (
        <></>
      )}
      {nextBand ? (
        <p className='float-right text-zinc-600 mb-4 text-sm'>
          <Link href={`/band/${generateBandSlug(nextBand.name)}`}>
            {nextBand.name} <ChevronRight className='inline' />
          </Link>
        </p>
      ) : (
        <></>
      )}

      <h1 className='text-4xl mb-2 clear-both'>{band?.name}</h1>
      {discogs?.image ? (
        <img src={discogs?.image} height={discogs.imageHeight} width={discogs.imageWidth} alt={band.name} />
      ) : (
        <></>
      )}

      <div className='bg-zinc-950 p-3 rounded-lg border-zinc-800 border mt-2 mb-4'>
        <p className='text-xl'>{band?.venue}</p>
        <p>
          {band?.date ? (
            <>
              {getDayFromDate(band?.date)} - {band?.time} <span className='text-zinc-600'>({band?.date})</span>
            </>
          ) : (
            <></>
          )}
        </p>
      </div>

      <Scheduler band={band} />

      {discogs?.genres ? (
        <>
          <h2 className='text-2xl mt-4 mb-2'>Genres</h2>
          <p>{discogs?.genres.join(', ')}</p>
        </>
      ) : (
        <></>
      )}

      {discogs?.styles ? (
        <>
          <h2 className='text-2xl mt-4 mb-2'>Styles</h2>
          <p>{discogs?.styles.join(', ')}</p>
        </>
      ) : (
        <></>
      )}

      {discogs?.profile ? (
        <>
          <h2 className='text-2xl mt-4 mb-2'>About</h2>
          <p className='whitespace-pre-wrap mb-2'>{discogs?.profile}</p>
        </>
      ) : (
        <></>
      )}

      {discogs?.videos ? (
        <>
          <h2 className='text-2xl mt-4 mb-2'>Videos</h2>
          {discogs?.videos.map((video) => {
            return (
              <div key={video} className='aspect-video w-full mb-4 bg-zinc-800'>
                <LazyYoutube src={video.replace('/watch?v=', '/embed/')} />
                {/* <iframe
                  width='100%'
                  height='100%'
                  src={video.replace('/watch?v=', '/embed/')}
                  title='YouTube video player'
                  frameBorder='0'
                  allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
                  referrerPolicy='strict-origin-when-cross-origin'
                  allowFullScreen
                /> */}
              </div>
            )
          })}
        </>
      ) : (
        <></>
      )}

      {discogs?.urls ? (
        <>
          <h2 className='text-2xl mt-4 mb-2'>Links</h2>
          {discogs?.urls.map((url) => {
            return (
              <p key={url} className='mb-1'>
                <Link href={url}>{url}</Link>
              </p>
            )
          })}
        </>
      ) : (
        <></>
      )}

      {discogs?.releases ? (
        <>
          <h2 className='text-2xl mt-4 mb-2'>Releases</h2>
          <div className='flex flex-wrap'>
            {discogs?.releases
              .sort((a, b) => b.year - a.year)
              .map((release) => {
                return (
                  <div
                    key={release.title.replaceAll(' ', '')}
                    className='w-36 h-50 bg-zinc-900 mr-4 mb-4 rounded-xl content-around items-center text-center p-4 text-sm'
                  >
                    <img src={release?.thumb} alt={band.name} className='m-auto' />
                    {release.title} ({release.year})
                  </div>
                )
              })}
          </div>
        </>
      ) : (
        <></>
      )}
    </div>
  )
}

export async function generateStaticParams() {
  const response = await fetch('https://wgt.zauber.tech/data.json')
  const bands = await response.json()

  const params = bands.map((band: any) => {
    return {
      band: generateBandSlug(band.name),
    }
  })

  return params
}

export default Band
