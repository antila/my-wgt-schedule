interface Image {
  '#text': string
  size: string
}

export interface BandInfo {
  name: string
  time: string
  date: string
  venue: string
  address: string
  country: string
  lastfm?: {
    artist: {
      name: string
      mbid: string
      url: string
      image: Image[]

      streamable: string
      ontour: string
      stats: string
      similar: string
      tags: string
      bio: {
        links: string
        published: string
        summary: string
        content: string
      }
    }
  }
}
