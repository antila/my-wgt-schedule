'use client'

import Link from 'next/link'

const Page = () => {
  return (
    <div className='container'>
      <h1 className='text-2xl mb-2'>About</h1>
      <p>
        I've always used the wonderful{' '}
        <Link href='https://wgt-guide.de/' className='underline'>
          WGT-Guide
        </Link>{' '}
        app, but it seems like it wont' be updated this year. Thus I needed something else, and most of the other apps
        are good at planning but bad at discovering bands. I really wanted things like genres and styles, like on
        Discogs, so I threw this together in a few days.
      </p>
      <p>
        I don't know if it'll break while I'm in Leipzig, or if there are any show-stopper bugs in it. But I think it's
        good enough for me to use, and I hope you can get something out of it too.
      </p>
      <p>See you at WGT!</p>
      <p>/Anders</p>
      <h2 className='text-2xl mb-2 mt-4'>Features</h2>
      <ul className='list-disc'>
        <li>Updates every hour with data from the WGT website.</li>
        <li>
          Uses{' '}
          <Link href='https://www.discogs.com' className='underline'>
            Discogs
          </Link>{' '}
          to load band info like genre, popular videos, releases and such.
        </li>
        <li>
          100% privacy focused. No data is ever sent to our servers. All data is only stored on your device. If you wish
          to transfer your settings, like to your phone, you can do so through the{' '}
          <Link href='/settings/' className='underline'>
            Settings page
          </Link>
          .
        </li>
      </ul>
      <h2 className='text-xl mt-4'>
        Made with love in Sweden, by{' '}
        <Link href='https://www.instagram.com/a.antila/' className='underline'>
          antila
        </Link>
        .
      </h2>
    </div>
  )
}

export default Page

export const dynamic = 'force-static'
