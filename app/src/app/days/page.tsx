import { redirect } from 'next/navigation'

const Schedule = () => {
  const utcDay = new Date().getUTCDay()
  let day
  switch (utcDay) {
    case 5:
      day = 'friday'
      break
    case 6:
      day = 'saturday'
      break
    case 7:
      day = 'sunday'
      break
    case 1:
      day = 'monday'
      break
    default:
      day = 'friday'
      break
  }
  redirect(`/day/${day}`)
}

export default Schedule
