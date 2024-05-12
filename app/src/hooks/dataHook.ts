import type { Data } from '@/types/data'
import type { DiscogsData } from '@/types/discogs'
import { useQuery } from '@tanstack/react-query'

export const getData = async (): Promise<Data> => {
  const data = await fetch('https://wgt.zauber.tech/data.json', { cache: 'no-store' })
  return await data.json()
}
export const getClientData = async (): Promise<Data> => {
  const data = await fetch('/data.json', { cache: 'no-store' })
  return await data.json()
}

export const getDiscogsData = async (): Promise<DiscogsData[]> => {
  const data = await fetch('https://wgt.zauber.tech/data-discogs.json', { cache: 'no-store' })
  return await data.json()
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
