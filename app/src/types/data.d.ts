import type { BandInfo } from './band'

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
