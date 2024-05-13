import fs from 'node:fs'
import path from 'node:path'
import * as cheerio from 'cheerio'
import Downloader from 'nodejs-file-downloader'
import { enrichData } from './discogs'

const dataFolder = path.join(__dirname, '..', 'data')
export const cacheFolder = path.join(dataFolder, 'cache')
export const historyFolder = path.join(dataFolder, 'history')
export const wgtFolder = path.join(cacheFolder, 'wgt')
export const discogsFolder = path.join(cacheFolder, 'discogs')
export const dataPath = path.join(dataFolder, 'data.json')
export const dataLastPath = path.join(dataFolder, 'data-last.json')
export const lastDataPath = path.join(dataFolder, 'last-data.json')
export const discogsDataPath = path.join(dataFolder, 'data-discogs.json')

const rateLimit = 1000
export const delay = async () => {
  await new Promise((resolve, reject) => {
    setTimeout((_: any) => resolve(true), rateLimit)
  })
}

export const generateBandSlug = (bandName: string): string => {
  return bandName.replace(/[\W_]+/g, '')
}

export const downloadFile = async (url: string, directory: string, fileName: string) => {
  const downloader = new Downloader({
    url,
    directory,
    fileName,
    maxAttempts: 3,
  })
  try {
    await downloader.download()
    await delay()
  } catch (error) {
    if (error instanceof Error) {
      console.log('Download failed', error.message)
    } else {
      console.log('Download failed', error)
    }
  }
}

export const downloadData = async () => {
  console.log('downloadData')

  if (!fs.existsSync(dataFolder)) {
    console.log(`Create folder ${dataFolder}`)
    fs.mkdirSync(dataFolder)
  }

  if (!fs.existsSync(cacheFolder)) {
    console.log(`Create folder ${cacheFolder}`)
    fs.mkdirSync(cacheFolder)
  }

  if (!fs.existsSync(wgtFolder)) {
    console.log(`Create WGT folder ${wgtFolder}`)
    fs.mkdirSync(wgtFolder)
  }

  if (!fs.existsSync(historyFolder)) {
    console.log(`Create history folder ${historyFolder}`)
    fs.mkdirSync(historyFolder)
  }

  if (!fs.existsSync(discogsFolder)) {
    console.log(`Create Discogs folder ${discogsFolder}`)
    fs.mkdirSync(discogsFolder)
  }

  const bandsHtmlFilePath = path.join(wgtFolder, 'bands.html')
  const bandsUrl = 'https://www.wave-gotik-treffen.de/english/bands.php'
  if (fs.existsSync(bandsHtmlFilePath)) {
    fs.rmSync(bandsHtmlFilePath)
  }

  const wgtFiles = fs.readdirSync(wgtFolder)
  for (const wgtFile of wgtFiles) {
    fs.rmSync(path.join(wgtFolder, wgtFile))
  }

  console.log('Downloading Bands HTML')
  await downloadFile(bandsUrl, wgtFolder, 'bands.html')

  const content = await fs.readFileSync(bandsHtmlFilePath).toString()
  const $ = cheerio.load(content)
  const bandLinks = $('#maincontent a')

  let i = 0

  for (const bandLink of bandLinks) {
    const href = bandLink.attribs.href

    if (!href.includes('id=')) {
      continue
    }

    const bandUrl = new URL(`https://www.wave-gotik-treffen.de/english/${href}`)
    const bandId = bandUrl.searchParams.get('id')
    const bandIdFileName = `band-${bandId}.html`
    const bandHtmlFilePath = path.join(wgtFolder, bandIdFileName)
    if (fs.existsSync(bandHtmlFilePath)) {
      fs.rmSync(bandHtmlFilePath)
    }

    console.log(`Downloading ${++i}/${bandLinks.length}: ID ${bandId}`)
    await downloadFile(bandUrl.toString(), wgtFolder, bandIdFileName)

    const content = await fs.readFileSync(bandHtmlFilePath).toString()
    const $ = cheerio.load(content)
    const bandData = $('#maincontent')
    const fullName = bandData.find('h2').text().trim()
    const name = fullName.substring(0, fullName.indexOf('(')).trim()

    const bandFileName = `band-${generateBandSlug(name)}.html`
    if (fs.existsSync(bandFileName)) {
      fs.rmSync(bandFileName)
    }
    fs.renameSync(bandHtmlFilePath, path.join(wgtFolder, bandFileName))
  }
}

export interface DataHistory {
  date: string
  message: string
  band: string
}
export interface Data {
  bands: BandInfo[]
  genres: string[]
  styles: string[]
  history: DataHistory[]
}

export interface BandInfo {
  name: string
  country: string
  time: string
  date: string
  venue: string
  address: string
  discogsId?: number
}

export const processData = async () => {
  console.log('processData')

  const files = fs.readdirSync(wgtFolder)
  const bandFiles = files.filter((file) => file.includes('band-') && file.endsWith('.html'))

  const data: Data = {
    bands: [],
    genres: [],
    styles: [],
    history: [],
  }

  for (const bandFile of bandFiles) {
    const content = await fs.readFileSync(path.join(wgtFolder, bandFile)).toString()
    const $ = cheerio.load(content)
    const bandData = $('#maincontent')
    const id = Number.parseInt(bandFile.replace('band-', '').replace('.html', ''), 10)
    const fullName = bandData.find('h2').text().trim()
    const name = fullName.substring(0, fullName.indexOf('(')).trim()
    const country = fullName.substring(fullName.indexOf('(')).trim()
    const date = bandData.find('h3').text().replace('*', '').trim()
    const time = bandData
      .find('div:contains(Time)')
      .next('.span_1_of_2')
      .text()
      .trim()
      .replace('h', '')
      .replace('.', ':')
    const venue = bandData.find('div:contains(Venue)').next('.span_1_of_2').text().trim()
    const address = bandData.find('div:contains(Address)').next('.span_1_of_2').text().trim()

    data.bands.push({
      name,
      country,
      date,
      time,
      venue,
      address,
    })
  }

  data.bands = data.bands.sort((a, b) => {
    return a.name.localeCompare(b.name)
  })

  await fs.writeFileSync(dataPath, JSON.stringify(data, null, 2))
}

export const makeHistory = async () => {
  const data: Data = JSON.parse(fs.readFileSync(dataPath).toString())
  const dataLast: Data = JSON.parse(fs.readFileSync(dataLastPath).toString())

  data.history = dataLast.history || []

  let changes = false

  for (const lastBand of dataLast.bands) {
    const bandFileName = `band-${generateBandSlug(lastBand.name)}.html`
    if (fs.existsSync(path.join(wgtFolder, bandFileName))) {
      const content = await fs.readFileSync(path.join(wgtFolder, bandFileName)).toString()
      const $ = cheerio.load(content)
      const bandData = $('#maincontent')

      const fullName = bandData.find('h2 span')
      if (fullName.attr('style') === 'text-decoration:line-through;') {
        console.log('Cancelled?', lastBand.name)
        changes = true
        data.history.push({
          date: new Date().toISOString().split('.')[0].replace('T', ' '),
          message: 'Cancelled',
          band: lastBand.name,
        })
      }
    }

    const band = data.bands.find((b) => b.name === lastBand.name)
    if (band) {
      if (band.date !== lastBand.date) {
        console.log('Updated date', band.name, band.date)
        changes = true
        data.history.push({
          date: new Date().toISOString().split('.')[0].replace('T', ' '),
          message: `New date: ${band.date}`,
          band: lastBand.name,
        })
      }
      if (band.time !== lastBand.time) {
        console.log('Updated time', band.name, band.time)
        changes = true
        data.history.push({
          date: new Date().toISOString().split('.')[0].replace('T', ' '),
          message: `New time: ${band.time}`,
          band: lastBand.name,
        })
      }
      if (band.venue !== lastBand.venue) {
        console.log('Updated venue', band.name, band.venue)
        changes = true
        data.history.push({
          date: new Date().toISOString().split('.')[0].replace('T', ' '),
          message: `New venue: ${band.venue}`,
          band: lastBand.name,
        })
      }
    }
  }

  for (const band of data.bands) {
    const lastBand = dataLast.bands.find((b) => b.name === band.name)
    if (!lastBand) {
      console.log('New band', band.name, band.venue, band.time)
      changes = true
      data.history.push({
        date: new Date().toISOString().split('.')[0].replace('T', ' '),
        message: 'New band!',
        band: band.name,
      })
    }
  }

  data.history = data.history.sort((a, b) => {
    return b.date.localeCompare(a.date)
  })

  if (changes) {
    const date = new Date().toISOString().split('.')[0].replace('T', ' ')
    fs.writeFileSync(path.join(dataFolder, `data-${date}.json`), JSON.stringify(data, null, 2))
    fs.writeFileSync(dataLastPath, JSON.stringify(data, null, 2))
  }

  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2))
}

export const process = async () => {
  await downloadData()
  await processData()
  await enrichData()
  await makeHistory()
}

void process()
