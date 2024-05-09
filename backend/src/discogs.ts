import fs from 'node:fs'
import path from 'node:path'
import { type BandInfo, type Data, cacheFolder, dataPath, delay, discogsDataPath } from './updateData'

const BASE_URL = 'https://api.discogs.com'
const TOKEN = process.env.DISCOGS_ACCESS_TOKEN
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY

const getSearchUrl = (search: string) => {
  return `${BASE_URL}/database/search?token=${TOKEN}&type=artist&q=${search}`
}
const getArtistUrl = (artistId: number) => {
  return `${BASE_URL}/artists/${artistId}?token=${TOKEN}`
}
const getReleasesUrl = (artistId: number) => {
  return `${BASE_URL}/artists/${artistId}/releases?token=${TOKEN}`
}

const options = {
  headers: {
    'user-agent': 'FestivalPlanner/0.1 ( anders@antila.se )',
    accept: 'application/json',
  },
}

let data: Data

const getBandFolder = (band: BandInfo) => {
  return `${band.id}-${encodeURIComponent(band.name.replaceAll(' ', ''))}`
}

const downloadFile = async (filename: string, url: string, band: BandInfo) => {
  const i = data.bands.indexOf(band)

  if (!fs.existsSync(filename)) {
    console.log(`Downloading ${filename.split('/').pop()} ${i}/${data.bands.length}: ${band.name}`)

    const result = await fetch(url, options)
    const response = await result.json()
    await delay()

    if (response.message || result.status !== 200) {
      console.log('message', response)
      process.exit(1)
    }

    await fs.writeFileSync(filename, JSON.stringify(response, null, 2))
  }
}

export const enrichData = async () => {
  data = JSON.parse(fs.readFileSync(dataPath).toString())
  console.log('bands', data)

  // Download search info
  for (const band of data.bands) {
    if (!fs.existsSync(path.join(cacheFolder, getBandFolder(band)))) {
      fs.mkdirSync(path.join(cacheFolder, getBandFolder(band)))
    }

    const bandSearchDataFileName = path.join(cacheFolder, getBandFolder(band), 'search.json')
    const url = getSearchUrl(encodeURIComponent(band.name))
    await downloadFile(bandSearchDataFileName, url, band)
  }

  // Add discogs id to band
  for (const band of data.bands) {
    const bandSearchDataFileName = path.join(cacheFolder, getBandFolder(band), 'search.json')
    if (fs.existsSync(bandSearchDataFileName)) {
      const data = JSON.parse(fs.readFileSync(bandSearchDataFileName).toString())
      const matches: any = data.results.filter((artist: any) => artist.title === band.name)
      if (matches.length === 1) {
        band.discogsId = matches[0].id
      } else {
        console.log('NOT FOUND', band.id, band.name)
      }
    }
  }

  // Download artist info
  for (const band of data.bands) {
    if (band.discogsId) {
      const bandDataFileName = path.join(cacheFolder, getBandFolder(band), 'artist.json')
      const url = getArtistUrl(band.discogsId)
      await downloadFile(bandDataFileName, url, band)
    }
  }

  // Download release info
  for (const band of data.bands) {
    if (band.discogsId) {
      const bandReleasesFileName = path.join(cacheFolder, getBandFolder(band), 'releases.json')
      const url = getReleasesUrl(band.discogsId)
      await downloadFile(bandReleasesFileName, url, band)
    }
  }

  // Download all releases
  for (const band of data.bands) {
    if (band.discogsId) {
      const bandReleasesFileName = path.join(cacheFolder, getBandFolder(band), 'releases.json')

      if (fs.existsSync(bandReleasesFileName)) {
        const releases = JSON.parse(fs.readFileSync(bandReleasesFileName).toString())
        const mainReleases = releases.releases.filter((release: any) => release.role === 'Main')

        for (const release of mainReleases.sort((a: any, b: any) => b.year - a.year)) {
          const url = `${release.resource_url}?token=${TOKEN}`
          const releaseFileName = path.join(cacheFolder, getBandFolder(band), `release-${release.id}.json`)
          await downloadFile(releaseFileName, url, band)
        }
      }
    }
  }

  const discogsData: any = []

  // Generate discogs-data
  for (const band of data.bands) {
    const files = fs.readdirSync(path.join(cacheFolder, getBandFolder(band)))
    const releases = files.filter((filename) => filename.includes('release-'))
    for (const releaseFile of releases) {
      const releasePath = path.join(cacheFolder, getBandFolder(band), releaseFile)
      const release = JSON.parse(fs.readFileSync(releasePath).toString())
      if (release.videos && release.videos.length > 0) {
        for (const video of release.videos) {
          if (!Object.hasOwn(video, 'viewCount')) {
            console.log('Need to get views for', band.name, video.title)
            const videoId = video.uri.split('v=')[1]
            const result = await fetch(
              `https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${videoId}&key=${YOUTUBE_API_KEY}`,
            )
            const response = await result.json()
            const responseItem = response.items.find((item: any) => item.id === videoId)
            if (responseItem) {
              const viewCount = responseItem.statistics.viewCount
              video.viewCount = Number.parseInt(viewCount, 10)
            } else {
              video.viewCount = 0
            }
          }
        }
        fs.writeFileSync(releasePath, JSON.stringify(release, null, 2))
      }
    }
  }

  // Generate discogs-data
  for (const band of data.bands) {
    if (band.discogsId) {
      const bandDataFileName = path.join(cacheFolder, getBandFolder(band), 'artist.json')
      const bandReleasesFileName = path.join(cacheFolder, getBandFolder(band), 'releases.json')
      let data: any
      if (fs.existsSync(bandDataFileName)) {
        const artist = JSON.parse(fs.readFileSync(bandDataFileName).toString())
        let image
        let imageWidth
        let imageHeight
        if (artist.images) {
          const primaryImage = artist.images.find((image: any) => image.type === 'primary')
          if (primaryImage) {
            image = primaryImage.uri
            imageWidth = primaryImage.width
            imageHeight = primaryImage.height
          }
        }
        const profile = artist.profile
        const urls = artist.urls

        data = {
          bandId: band.id,
          image,
          imageWidth,
          imageHeight,
          profile,
          urls,
          genres: [],
          styles: [],
          videos: [],
        }
      }
      if (fs.existsSync(bandReleasesFileName)) {
        const releases = JSON.parse(fs.readFileSync(bandReleasesFileName).toString())
        const mainReleases = releases.releases.filter((release: any) => release.role === 'Main')

        data.releases = mainReleases.map((release: any) => {
          const { title, year, thumb } = release
          return {
            title,
            year,
            thumb,
          }
        })
      }

      const files = fs.readdirSync(path.join(cacheFolder, getBandFolder(band)))
      const releases = files.filter((filename) => filename.includes('release-'))
      for (const releaseFile of releases) {
        const release = JSON.parse(fs.readFileSync(path.join(cacheFolder, getBandFolder(band), releaseFile)).toString())
        data.genres = data.genres.concat(release.genres)
        data.styles = data.styles.concat(release.styles)

        if (release.videos) {
          for (const video of release.videos.sort((a: any, b: any) => b.viewCount - a.viewCount)) {
            data.videos.push(video.uri)
          }
          console.log('data.videos before', data.videos)
          data.videos = data.videos.slice(0, 3)
          console.log('data.videos after', data.videos)
        }
      }

      data.genres = data.genres.filter(
        (value: string, index: number, array: string[]) => array.indexOf(value) === index,
      )
      data.styles = data.styles.filter(
        (value: string, index: number, array: string[]) => array.indexOf(value) === index,
      )

      discogsData.push(data)
    }
  }

  fs.writeFileSync(discogsDataPath, JSON.stringify(discogsData, null, 2))
}
