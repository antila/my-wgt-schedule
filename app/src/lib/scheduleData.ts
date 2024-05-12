'use client'

export enum ScheduleStatus {
  UNDEFINED = -1,
  NO = 3,
  SCHEDULED = 1,
  INTERESTED = 2,
}

export interface ScheduleData {
  [bandName: string]: ScheduleStatus
}

export const getScheduleData = (): ScheduleData => {
  if (typeof window !== 'undefined') {
    const schedule = localStorage.getItem('schedule')
    if (!schedule) {
      return {}
    }

    return JSON.parse(schedule)
  }
  return {}
}

export const setScheduleData = (schedule: ScheduleData) => {
  localStorage.setItem('schedule', JSON.stringify(schedule))
}

export const setBandAsScheduled = (bandName: string) => {
  return setState(bandName, ScheduleStatus.SCHEDULED)
}
export const setBandAsNo = (bandName: string) => {
  return setState(bandName, ScheduleStatus.NO)
}
export const setBandAsInterested = (bandName: string) => {
  return setState(bandName, ScheduleStatus.INTERESTED)
}

const setState = (bandName: string, s: number) => {
  const schedule = getScheduleData()

  if (Object.hasOwn(schedule, bandName)) {
    if (schedule[bandName] === s) {
      delete schedule[bandName]
    } else {
      schedule[bandName] = s
    }
  } else {
    schedule[bandName] = s
  }
  setScheduleData(schedule)

  return getBandState(bandName)
}

export const getBandState = (bandName: string): ScheduleStatus => {
  const schedule = getScheduleData()
  if (Object.hasOwn(schedule, bandName)) {
    return schedule[bandName]
  }

  return -1
}
