import { readFileSync } from 'node:fs'
import type { Data } from '@/types/data'
import type { DiscogsData } from '@/types/discogs'
import type { VenueList } from '@/types/venue'
import { useQuery } from '@tanstack/react-query'
import * as dataDiscogs from '../../public/data-discogs.json'
import * as data from '../../public/data.json'

export const getData = async (): Promise<Data> => {
  return JSON.parse(JSON.stringify(data))
  // const data = await fetch('https://wgt.zauber.tech/data.json', { cache: 'no-store' })
  // return await data.json()
}

export const getDiscogsData = async (): Promise<DiscogsData[]> => {
  return JSON.parse(JSON.stringify(dataDiscogs))
  // const data = await fetch('https://wgt.zauber.tech/data-discogs.json', { cache: 'no-store' })
  // return await data.json()
}

export const getVenues = async (): Promise<VenueList[]> => {
  const data = await getData()

  const allVenues: VenueList[] = []
  for (const band of data.bands) {
    if (!allVenues.find((v) => v.name === band.venue)) {
      allVenues.push({ name: band.venue, address: band.address })
    }
  }

  const venues = allVenues.sort((a, b) => a.name.localeCompare(b.name))

  return venues
}

export const useDataQuery = () => {
  return useQuery({
    queryKey: ['bandData'],
    queryFn: async (): Promise<Data> => {
      return await getData()
    },
  })
}

export const useDiscogsQuery = () => {
  return useQuery({
    queryKey: ['discogsData'],
    queryFn: async (): Promise<DiscogsData[]> => {
      return await getDiscogsData()
    },
  })
}
