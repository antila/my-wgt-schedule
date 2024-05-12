'use client'

import { loadArtistImages, loadArtistReleases } from '@/lib/settings'
import type { BandInfo } from '@/types/band'
import type { DiscogsData } from '@/types/discogs'

interface Props {
  band: BandInfo
  discogs?: DiscogsData
}

export const BandImage = ({ band, discogs }: Props) => {
  const loadArtistImagesValue = loadArtistImages()

  if (discogs?.image && loadArtistImagesValue) {
    return <img src={discogs?.image} height={discogs.imageHeight} width={discogs.imageWidth} alt={band.name} />
  }

  return <></>
}
