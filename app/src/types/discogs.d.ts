interface Release {
  title: string
  year: number
  thumb: string
}

export interface DiscogsData {
  bandId: number
  image: string
  profile: string
  urls: string[]
  releases: Release[]
  genres: string[]
  styles: string[]
  videos: string[]
}
