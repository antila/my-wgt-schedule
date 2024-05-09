import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const generateBandSlug = (bandName: string): string => {
  return bandName.replace(/[\W_]+/g, '')
}
