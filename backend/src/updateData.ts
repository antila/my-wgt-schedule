import fs from 'node:fs'
import path from 'node:path'
import * as cheerio from 'cheerio'
import Downloader from 'nodejs-file-downloader'
import { enrichData } from './discogs'

const forceUpdate = false

const dataFolder = path.join(__dirname, '..', 'data')
const appPublicFolder = path.join(__dirname, '..', '..', 'app', 'public')
export const cacheFolder = path.join(dataFolder, 'cache')
export const wgtFolder = path.join(cacheFolder, 'wgt')
export const dataPath = path.join(dataFolder, 'data.json')
export const lastDataPath = path.join(dataFolder, 'last-data.json')
export const discogsDataPath = path.join(dataFolder, 'data-discogs.json')

const rateLimit = 1000
export const delay = async () => {
  await new Promise((resolve, reject) => {
    setTimeout((_: any) => resolve(true), rateLimit)
  })
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
    console.log(`Create folder ${wgtFolder}`)
    fs.mkdirSync(wgtFolder)
  }

  const bandsHtmlFilePath = path.join(cacheFolder, 'wgt', 'bands.html')
  const bandsUrl = 'https://www.wave-gotik-treffen.de/english/bands.php'
  if (!fs.existsSync(bandsHtmlFilePath) || forceUpdate) {
    await downloadFile(bandsUrl, path.join(cacheFolder, 'wgt'), 'bands.html')
  }

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
    const bandFileName = `band-${bandId}.html`
    const bandHtmlFilePath = path.join(cacheFolder, 'wgt', bandFileName)

    if (!fs.existsSync(bandHtmlFilePath)) {
      console.log(`Downloading ${++i}/${bandLinks.length}: ID ${bandId}`)
      await downloadFile(bandUrl.toString(), cacheFolder, bandFileName)
    } else if (fs.existsSync(bandHtmlFilePath) && forceUpdate) {
      fs.rmSync(bandHtmlFilePath)
      console.log(`Downloading ${++i}/${bandLinks.length}: ID ${bandId}`)
      await downloadFile(bandUrl.toString(), cacheFolder, bandFileName)
    }
  }
}

export interface Data {
  bands: BandInfo[]
  genres: string[]
  styles: string[]
}

export interface BandInfo {
  id: number
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
  }

  for (const bandFile of bandFiles) {
    const content = await fs.readFileSync(path.join(wgtFolder, bandFile)).toString()
    const $ = cheerio.load(content)
    const bandData = $('#maincontent')
    const id = Number.parseInt(bandFile.replace('band-', '').replace('.html', ''), 10)
    const fullName = bandData.find('h2').text().trim()
    const name = fullName.substring(0, fullName.indexOf('(')).trim()
    const country = fullName.substring(fullName.indexOf('(')).trim()
    const date = bandData.find('h3').text().trim()
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
      id,
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

export const copyData = async () => {
  const data = JSON.parse(fs.readFileSync(dataPath).toString())
  fs.writeFileSync(path.join(appPublicFolder, 'data.json'), JSON.stringify(data, null, 2))
  const discogsData = JSON.parse(fs.readFileSync(discogsDataPath).toString())
  fs.writeFileSync(path.join(appPublicFolder, 'data-discogs.json'), JSON.stringify(discogsData, null, 2))
}

export const process = async () => {
  await downloadData()
  await processData()
  await enrichData()
  await copyData()
}

void process()
