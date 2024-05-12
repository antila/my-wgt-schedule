import fs from 'node:fs'
import path from 'node:path'
import { type BandInfo, type Data, dataPath, delay, discogsDataPath, discogsFolder } from './updateData'

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
  return `${encodeURIComponent(band.name.replaceAll(' ', ''))}`
}

const getBandName = (bandName: string): string => {
  switch (bandName) {
    case 'Anneke Van Giersbergen':
      return 'Anneke van Giersbergen'
    case 'Blackbook':
      return 'BLACKBOOK'
    case 'Brothel':
      return 'brothel.'
    case 'Dancing Plague':
      return 'The Dancing Plague of 1518'
    case 'Daniela Bedeski & David Cabi':
      return 'Daniela Bedeski'
    case 'Placebo Effekt':
      return 'Placebo Effect'
    case 'Heppner':
      return 'Peter Heppner'
    case 'Klutae':
      return 'Klutæ'
    case 'Vive La Fete':
      return 'Vive La Fête!'
    case 'Years Of Denial':
      return 'Years of Denial'
    case 'Derniere Volonte':
      return 'Dernière Volonté'
    case 'Elbland Philharmonie Sachsen':
      return 'Elbland-Philharmonie Sachsen'
    case 'Esplendor Geometrico':
      return 'Esplendor Geométrico'
    case 'Extize':
      return 'Ext!ze'
    case 'Knight$':
      return 'KNIGHT$'
    case 'Luigi Rubino & Riccardo Prencipe':
      return 'Luigi Rubino'
    case 'Maschinenkrieger KR 52':
      return 'Maschinenkrieger KR52'
    case 'MorphiuM':
      return 'Morphium'
    case 'Petra Hermanova':
      return 'Petra Hermanová'
    case 'Position Parallele':
      return 'Position Parallèle'
    case 'Rose Of Avalanche':
      return 'The Rose Of Avalanche'
    case 'The Cemetary Girlz':
      return 'The Cemetary GirlZ'
    case 'This Morn Omina':
      return "This Morn' Omina"
    case 'Tourdeforce':
      return 'TourdeForce'

    case 'The Feelgod McClouds':
    case 'Opernensemble der Landesbühnen Sachsen':
    case 'Noelia Sarris Gothic Piano':
    case 'Nils Keppel':
    case 'Model Collapse':
    case 'Eihwar':
    case 'David Leubner':
    case 'Clout Blued':
    case 'Circuit Preacher':
    case 'Artwork/Belladonna':
      return bandName

    default:
      return bandName
  }
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

  // Download search info
  for (const band of data.bands) {
    if (!fs.existsSync(path.join(discogsFolder, getBandFolder(band)))) {
      fs.mkdirSync(path.join(discogsFolder, getBandFolder(band)))
    }

    const bandSearchDataFileName = path.join(discogsFolder, getBandFolder(band), 'search.json')
    const bandName = getBandName(band.name)
    const url = getSearchUrl(encodeURIComponent(bandName))
    await downloadFile(bandSearchDataFileName, url, band)
  }

  // Add discogs id to band
  for (const band of data.bands) {
    const bandSearchDataFileName = path.join(discogsFolder, getBandFolder(band), 'search.json')
    if (fs.existsSync(bandSearchDataFileName)) {
      const data = JSON.parse(fs.readFileSync(bandSearchDataFileName).toString())
      const bandName = getBandName(band.name)
      const matches: any = data.results.filter((artist: any) => artist.title === bandName)
      if (matches.length === 1) {
        band.discogsId = matches[0].id
      } else {
        console.log('NOT FOUND', band.name)
      }
    }
  }

  // Download artist info
  for (const band of data.bands) {
    if (band.discogsId) {
      const bandDataFileName = path.join(discogsFolder, getBandFolder(band), 'artist.json')
      const url = getArtistUrl(band.discogsId)
      await downloadFile(bandDataFileName, url, band)
    }
  }

  // Download release info
  for (const band of data.bands) {
    if (band.discogsId) {
      const bandReleasesFileName = path.join(discogsFolder, getBandFolder(band), 'releases.json')
      const url = getReleasesUrl(band.discogsId)
      await downloadFile(bandReleasesFileName, url, band)
    }
  }

  // Download all releases
  for (const band of data.bands) {
    if (band.discogsId) {
      const bandReleasesFileName = path.join(discogsFolder, getBandFolder(band), 'releases.json')

      if (fs.existsSync(bandReleasesFileName)) {
        const releases = JSON.parse(fs.readFileSync(bandReleasesFileName).toString())
        const mainReleases = releases.releases.filter((release: any) => release.role === 'Main')

        for (const release of mainReleases.sort((a: any, b: any) => b.year - a.year)) {
          const url = `${release.resource_url}?token=${TOKEN}`
          const releaseFileName = path.join(discogsFolder, getBandFolder(band), `release-${release.id}.json`)
          await downloadFile(releaseFileName, url, band)
        }
      }
    }
  }

  const discogsData: any = []

  // Generate discogs-data
  for (const band of data.bands) {
    const files = fs.readdirSync(path.join(discogsFolder, getBandFolder(band)))
    const releases = files.filter((filename) => filename.includes('release-'))
    for (const releaseFile of releases) {
      const releasePath = path.join(discogsFolder, getBandFolder(band), releaseFile)
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
      const bandDataFileName = path.join(discogsFolder, getBandFolder(band), 'artist.json')
      const bandReleasesFileName = path.join(discogsFolder, getBandFolder(band), 'releases.json')
      let discogData: any
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

        discogData = {
          bandName: band.name,
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

        discogData.releases = mainReleases.map((release: any) => {
          const { title, year, thumb } = release
          return {
            title,
            year,
            thumb,
          }
        })
      }

      const files = fs.readdirSync(path.join(discogsFolder, getBandFolder(band)))
      const releases = files.filter((filename) => filename.includes('release-'))
      for (const releaseFile of releases) {
        const release = JSON.parse(
          fs.readFileSync(path.join(discogsFolder, getBandFolder(band), releaseFile)).toString(),
        )
        discogData.genres = discogData.genres.concat(release.genres)
        discogData.styles = discogData.styles.concat(release.styles)
        data.genres = data.genres.concat(discogData.genres)
        data.styles = data.styles.concat(discogData.styles)

        if (release.videos) {
          for (const video of release.videos.sort((a: any, b: any) => b.viewCount - a.viewCount)) {
            discogData.videos.push(video.uri)
          }

          discogData.videos = discogData.videos.slice(0, 3)
        }
      }

      discogData.genres = discogData.genres
        .filter((value: string, index: number, array: string[]) => array.indexOf(value) === index)
        .filter(Boolean)
      discogData.styles = discogData.styles
        .filter((value: string, index: number, array: string[]) => array.indexOf(value) === index)
        .filter(Boolean)

      data.genres = data.genres
        .filter((value: string, index: number, array: string[]) => array.indexOf(value) === index)
        .filter(Boolean)
      data.styles = data.styles
        .filter((value: string, index: number, array: string[]) => array.indexOf(value) === index)
        .filter(Boolean)

      discogsData.push(discogData)
    }
  }

  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2))
  fs.writeFileSync(discogsDataPath, JSON.stringify(discogsData, null, 2))
}
