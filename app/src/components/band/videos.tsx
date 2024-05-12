'use client'

import { loadArtistImages, loadArtistReleases, loadArtistVideos } from '@/lib/settings'
import type { BandInfo } from '@/types/band'
import type { DiscogsData } from '@/types/discogs'
import LazyYoutube from '../lazyYoutube'

interface Props {
  discogs?: DiscogsData
}

export const BandVideos = ({ discogs }: Props) => {
  const loadArtistVideosValue = loadArtistVideos()

  if (discogs?.videos && loadArtistVideosValue) {
    return (
      <>
        <h2 className='text-2xl mt-4 mb-2'>Videos</h2>
        {discogs?.videos.map((video) => {
          return (
            <div key={video} className='aspect-video w-full mb-4 bg-zinc-800'>
              <LazyYoutube src={video.replace('/watch?v=', '/embed/')} />
            </div>
          )
        })}
      </>
    )
  }

  return <></>
}
