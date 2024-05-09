'use client'

export enum ScheduleStatus {
  UNDEFINED = -1,
  NO = 3,
  SCHEDULED = 1,
  INTERESTED = 2,
}

export interface ScheduleData {
  [id: number]: ScheduleStatus
}

export const getScheduleData = (): ScheduleData => {
  const schedule = localStorage.getItem('schedule')
  if (!schedule) {
    return {}
  }

  return JSON.parse(schedule)
}

export const setScheduleData = (schedule: ScheduleData) => {
  localStorage.setItem('schedule', JSON.stringify(schedule))
  console.log('schedule', schedule)
}

export const setBandAsScheduled = (bandId: number) => {
  return setState(bandId, ScheduleStatus.SCHEDULED)
}
export const setBandAsNo = (bandId: number) => {
  return setState(bandId, ScheduleStatus.NO)
}
export const setBandAsInterested = (bandId: number) => {
  return setState(bandId, ScheduleStatus.INTERESTED)
}

const setState = (id: number, s: number) => {
  const schedule = getScheduleData()

  if (Object.hasOwn(schedule, id)) {
    if (schedule[id] === s) {
      delete schedule[id]
    } else {
      schedule[id] = s
    }
  } else {
    schedule[id] = s
  }
  setScheduleData(schedule)

  return getBandState(id)
}

export const getBandState = (bandId: number): ScheduleStatus => {
  const schedule = getScheduleData()
  if (Object.hasOwn(schedule, bandId)) {
    return schedule[bandId]
  }

  return -1
}
