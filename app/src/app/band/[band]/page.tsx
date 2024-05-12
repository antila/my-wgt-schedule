import { BandImage } from '@/components/band/image'
import { Releases } from '@/components/band/releases'
import { Scheduler } from '@/components/band/scheduler'
import { BandVideos } from '@/components/band/videos'
import { ButtonLink } from '@/components/buttonLink'
import LazyYoutube from '@/components/lazyYoutube'
import { getData, getDiscogsData } from '@/hooks/dataHook'
import { getDayFromDate } from '@/lib/dates'
import { loadArtistImages, loadArtistReleases, loadArtistVideos } from '@/lib/settings'
import { generateBandSlug } from '@/lib/utils'
import { ChevronLeft, ChevronRight, Navigation2 } from 'lucide-react'
import Link from 'next/link'

interface BandProps {
  params: { band: string }
}

const Band = async ({ params }: BandProps) => {
  const bandSlug = params.band

  const data = await getData()
  const discogsData = await getDiscogsData()

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

  const discogs = discogsData.find((item) => item.bandName === band.name)

  const mapQuery = encodeURIComponent(`${band?.address}, Leipzig, Germany`)

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
      <BandImage band={band} discogs={discogs} />

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

      <ButtonLink
        href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`}
        className='w-full py-2'
        target='_blank'
      >
        <Navigation2 className='inline-block' /> Navigate to {band?.address}
      </ButtonLink>

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

      <BandVideos discogs={discogs} />

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

      <Releases band={band} discogs={discogs} />
    </div>
  )
}

export async function generateStaticParams() {
  const data = await getData()

  const params = data.bands.map((band: any) => {
    return {
      band: generateBandSlug(band.name),
    }
  })

  return params
}

export default Band
