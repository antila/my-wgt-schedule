import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const generateBandSlug = (bandName: string): string => {
  return bandName.replace(/[\W_]+/g, '')
}

export const generateVenueSlug = (venueName: string): string => {
  return venueName.replace(/[\W_]+/g, '')
}
