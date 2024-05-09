// 'use client'

// import { useQuery } from '@tanstack/react-query'
import { BandInfo } from '@/types/band'
import type { Data } from '@/types/data'
import type { DiscogsData } from '@/types/discogs'
import { useQuery } from '@tanstack/react-query'

const options = { cache: 'no-store' }

export const getData = async (): Promise<Data> => {
  const data = await fetch(`https://wgt.zauber.tech/data.json?rand=${Math.random() * 10000}`)
  return await data.json()
}
export const getClientData = async (): Promise<Data> => {
  const data = await fetch('/data.json')
  return await data.json()
}

export const getDiscogsData = async (): Promise<DiscogsData[]> => {
  const data = await fetch(`https://wgt.zauber.tech/data-discogs.json?rand=${Math.random() * 10000}`)
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
