interface Release {
  title: string
  year: number
  thumb: string
}

export interface DiscogsData {
  bandId: number
  image: string
  imageHeight: number
  imageWidth: number
  profile: string
  urls: string[]
  releases: Release[]
  genres: string[]
  styles: string[]
  videos: string[]
}
