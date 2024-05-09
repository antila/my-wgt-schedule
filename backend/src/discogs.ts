import fs from 'node:fs'
import path from 'node:path'
import { type BandInfo, type Data, cacheFolder, dataPath, delay, discogsDataPath } from './updateData'

const BASE_URL = 'https://api.discogs.com'
const TOKEN = process.env.DISCOGS_ACCESS_TOKEN

const getSearchUrl = (search: string) => {
  return `${BASE_URL}/database/search?token=${TOKEN}&type=artist&q=${search}`
}
const getArtistUrl = (artistId: number) => {
  return `${BASE_URL}/artists/${artistId}?token=${TOKEN}`
}
const getReleasesUrl = (artistId: number) => {
  return `${BASE_URL}/artists/${artistId}/releases?token=${TOKEN}`
}
const getReleaseUrl = (releaseId: number) => {
  return `${BASE_URL}/releases/${releaseId}?token=${TOKEN}`
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

  for (const band of data.bands) {
    if (!fs.existsSync(path.join(cacheFolder, getBandFolder(band)))) {
      fs.mkdirSync(path.join(cacheFolder, getBandFolder(band)))
    }

    const bandSearchDataFileName = path.join(cacheFolder, getBandFolder(band), 'search.json')
    const url = getSearchUrl(encodeURIComponent(band.name))
    await downloadFile(bandSearchDataFileName, url, band)
  }

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

  for (const band of data.bands) {
    if (band.discogsId) {
      const bandDataFileName = path.join(cacheFolder, getBandFolder(band), 'artist.json')
      const url = getArtistUrl(band.discogsId)
      await downloadFile(bandDataFileName, url, band)
    }
  }

  for (const band of data.bands) {
    if (band.discogsId) {
      const bandReleasesFileName = path.join(cacheFolder, getBandFolder(band), 'releases.json')
      const url = getReleasesUrl(band.discogsId)
      await downloadFile(bandReleasesFileName, url, band)
    }
  }

  for (const band of data.bands) {
    if (band.discogsId) {
      const bandReleasesFileName = path.join(cacheFolder, getBandFolder(band), 'releases.json')

      if (fs.existsSync(bandReleasesFileName)) {
        const releases = JSON.parse(fs.readFileSync(bandReleasesFileName).toString())
        const mainReleases = releases.releases.filter((release: any) => release.role === 'Main')

        let i = 0
        for (const release of mainReleases.sort((a: any, b: any) => b.year - a.year)) {
          if (i > 4) {
            continue
          }

          const url = `${release.resource_url}?token=${TOKEN}`
          const releaseFileName = path.join(cacheFolder, getBandFolder(band), `release-${release.id}.json`)
          await downloadFile(releaseFileName, url, band)
          i++
        }
      }
    }
  }

  const discogsData: any = []

  for (const band of data.bands) {
    if (band.discogsId) {
      const bandDataFileName = path.join(cacheFolder, getBandFolder(band), 'artist.json')
      const bandReleasesFileName = path.join(cacheFolder, getBandFolder(band), 'releases.json')
      let data: any
      if (fs.existsSync(bandDataFileName)) {
        const artist = JSON.parse(fs.readFileSync(bandDataFileName).toString())
        let image
        if (artist.images) {
          const primaryImage = artist.images.find((image: any) => image.type === 'primary')
          if (primaryImage) {
            image = primaryImage.uri
          }
        }
        const profile = artist.profile
        const urls = artist.urls

        data = {
          bandId: band.id,
          image,
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
          for (const video of release.videos) {
            data.videos.push(video.uri)
          }
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
