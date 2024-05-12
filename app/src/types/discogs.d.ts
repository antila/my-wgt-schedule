interface Release {
  title: string
  year: number
  thumb: string
}

export interface DiscogsData {
  bandName: string
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
