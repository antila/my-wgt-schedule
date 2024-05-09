export type WgtDay = 'Thursday' | 'Friday' | 'Saturday' | 'Sunday' | 'Monday'

export const getDateFromDay = (day: WgtDay) => {
  switch (day.toLocaleLowerCase()) {
    case 'thursday':
      return '2024-05-16'
    case 'friday':
      return '2024-05-17'
    case 'saturday':
      return '2024-05-18'
    case 'sunday':
      return '2024-05-19'
    case 'monday':
      return '2024-05-20'
  }
}

export const getDayFromDate = (day: string): WgtDay => {
  switch (day) {
    case '2024-05-16':
      return 'Thursday'
    case '2024-05-17':
      return 'Friday'
    case '2024-05-18':
      return 'Saturday'
    case '2024-05-19':
      return 'Sunday'
    case '2024-05-20':
      return 'Monday'
  }

  throw new Error(`Invalid day: ${day}`)
}
