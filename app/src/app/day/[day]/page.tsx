import { ButtonLink } from '@/components/buttonLink'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getData } from '@/hooks/dataHook'
import { type WgtDay, getDateFromDay } from '@/lib/dates'
import { activeButton, primaryColor } from '@/lib/theme'
import { generateBandSlug } from '@/lib/utils'
import type { Data } from '@/types/data'

const BandListDay = ({ day, data }: { day: WgtDay; data: Data }) => {
  const todaysDate = getDateFromDay(day)
  const todaysBands = data.bands.filter((band) => band.date === todaysDate)
  const allVenues: string[] = todaysBands.map((band) => band.venue)
  const venues = allVenues
    .filter((value, index, array) => {
      return array.indexOf(value) === index
    })
    .sort((a, b) => a.localeCompare(b))

  return (
    <div>
      {venues.map((venue) => {
        return (
          <div key={`venue-${venue}`} className='mb-6'>
            <h1 className='text-2xl mb-1'>{venue}</h1>
            {todaysBands
              .sort((a, b) => {
                if (b.time.startsWith('0')) {
                  return -1
                }
                return a.time.localeCompare(b.time)
              })
              .map((band) => {
                if (band.venue === venue) {
                  return (
                    <ButtonLink
                      key={`band-${band.name}`}
                      href={`/band/${generateBandSlug(band.name)}`}
                      className='w-full'
                    >
                      <span className='w-11 inline-block text-right'>{band.time}</span>
                      <span className='pl-4 mb-1 inline-block'>{band.name}</span>
                    </ButtonLink>
                  )
                }
              })}
          </div>
        )
      })}
    </div>
  )
}

const Day = async ({ params }: { params: { day: WgtDay } }) => {
  const { day } = params

  const data = await getData()

  if (!data) {
    return <div>No data</div>
  }

  return (
    <Tabs defaultValue={day} className='w-full'>
      <TabsList className='w-full'>
        <TabsTrigger className='w-1/4' value='friday'>
          Friday
        </TabsTrigger>
        <TabsTrigger className='w-1/4' value='saturday'>
          Saturday
        </TabsTrigger>
        <TabsTrigger className='w-1/4' value='sunday'>
          Sunday
        </TabsTrigger>
        <TabsTrigger className='w-1/4' value='monday'>
          Monday
        </TabsTrigger>
      </TabsList>
      <TabsContent value='friday'>
        <BandListDay day={'Friday'} data={data} />
      </TabsContent>
      <TabsContent value='saturday'>
        <BandListDay day={'Saturday'} data={data} />
      </TabsContent>
      <TabsContent value='sunday'>
        <BandListDay day={'Sunday'} data={data} />
      </TabsContent>
      <TabsContent value='monday'>
        <BandListDay day={'Monday'} data={data} />
      </TabsContent>
    </Tabs>
  )
}

export const generateStaticParams = async () => {
  return [{ day: 'friday' }, { day: 'saturday' }, { day: 'sunday' }, { day: 'monday' }]
}

export default Day
