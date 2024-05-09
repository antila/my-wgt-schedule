import { redirect } from 'next/navigation'

const Schedule = () => {
  const day = 'friday'
  redirect(`/day/${day}`)
}

export default Schedule
