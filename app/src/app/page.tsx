// 'use client'

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { getData } from '@/hooks/dataHook'
import { generateBandSlug } from '@/lib/utils'
import Link from 'next/link'

const Home = async () => {
  const data = await getData()

  if (!data || !data.history) {
    return <div>No data</div>
  }

  data.history = data.history.sort((a, b) => {
    return b.date.localeCompare(a.date)
  })

  return (
    <div>
      <h1 className='text-3xl mb-2'>Updates</h1>
      {data.history.map((item) => {
        let style = 'bg-blue-950 border-blue-800'
        if (item.message === 'Cancelled') {
          style = 'bg-red-950 border-red-800'
        }
        if (item.message === 'New band!') {
          style = 'bg-green-950 border-green-800'
        }
        return (
          <Link key={item.date} href={`/band/${generateBandSlug(item.band)}`}>
            <Card className={`mb-2 ${style}`}>
              <CardHeader className='p-3 pb-1'>
                <CardTitle>{item.band}</CardTitle>
                <CardDescription>{item.date}</CardDescription>
              </CardHeader>
              <CardContent className='p-3 pt-0'>{item.message}</CardContent>
            </Card>
          </Link>
        )
      })}
    </div>
  )
}

export default Home

export const dynamic = 'force-static'
