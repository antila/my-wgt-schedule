'use client'

import {
  ScheduleStatus,
  getBandState,
  getScheduleData,
  setBandAsInterested,
  setBandAsNo,
  setBandAsScheduled,
} from '@/lib/scheduleData'
import { activeButton } from '@/lib/theme'
import type { BandInfo } from '@/types/band'
import { Minus, Plus, Sprout, Star } from 'lucide-react'
import { useState } from 'react'
import { ButtonLink } from '../buttonLink'

export const Scheduler = ({ band }: { band: BandInfo }) => {
  const bandState = getBandState(band.id)

  const [state, setState] = useState(bandState)

  return (
    <>
      <ButtonLink
        noBg={state === ScheduleStatus.SCHEDULED}
        className={` w-full text-lg ${state === ScheduleStatus.SCHEDULED ? activeButton : ''}`}
        onClick={(event) => {
          event.preventDefault()
          const newState = setBandAsScheduled(band.id)
          setState(newState ?? -1)
        }}
      >
        {state === ScheduleStatus.SCHEDULED ? (
          <>
            <Minus className='inline pb-1' /> Remove from my Schedule
          </>
        ) : (
          <>
            <Plus className='inline pb-1' /> Add to my Schedule
          </>
        )}
      </ButtonLink>
      <ButtonLink
        noBg={state === ScheduleStatus.INTERESTED}
        className={` w-full text-lg ${state === ScheduleStatus.INTERESTED ? activeButton : ''}`}
        onClick={(event) => {
          event.preventDefault()
          const newState = setBandAsInterested(band.id)
          setState(newState ?? -1)
        }}
      >
        <Star className='inline pb-1' /> Interested
      </ButtonLink>
      <ButtonLink
        noBg={state === ScheduleStatus.NO}
        className={` w-full text-lg ${state === ScheduleStatus.NO ? activeButton : ''}`}
        onClick={(event) => {
          event.preventDefault()
          const newState = setBandAsNo(band.id)
          setState(newState ?? -1)
        }}
      >
        <Sprout className='inline pb-1' /> Not for me
      </ButtonLink>
    </>
  )
}
