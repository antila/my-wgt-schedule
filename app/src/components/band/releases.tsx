'use client'

import { loadArtistReleases } from '@/lib/settings'
import type { BandInfo } from '@/types/band'
import type { DiscogsData } from '@/types/discogs'

interface Props {
  band: BandInfo
  discogs?: DiscogsData
}

export const Releases = ({ band, discogs }: Props) => {
  const loadArtistReleasesValue = loadArtistReleases()

  if (discogs?.releases && loadArtistReleasesValue) {
    return (
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
    )
  }

  return <></>
}
