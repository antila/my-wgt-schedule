'use client'

import { ButtonLink } from '@/components/buttonLink'
import { Switch } from '@/components/ui/switch'
import { getScheduleData, setScheduleData } from '@/lib/scheduleData'
import {
  loadArtistImages,
  loadArtistReleases,
  loadArtistVideos,
  setLoadArtistImages,
  setLoadArtistReleases,
  setLoadArtistVideos,
} from '@/lib/settings'
import { Label } from '@radix-ui/react-label'
import { useState } from 'react'

const Page = () => {
  const exportData = async () => {
    const schedule = await getScheduleData()
    const data = JSON.stringify(schedule, null, 2)

    function download(content: string, fileName: string, contentType: string) {
      const a = document.createElement('a')
      const file = new Blob([content], { type: contentType })
      a.href = URL.createObjectURL(file)
      a.download = fileName
      a.click()
    }

    const date = new Date().toISOString().split('.')[0].replace('T', '_').replace(' ', '_')
    const filename = `my-wgt-schedule-${date}.json`
    download(data, filename, 'application/json')
  }

  const onchange = (event: any) => {
    try {
      const files = event.target.files
      if (!files.length) {
        return
      }
      const file = files[0]
      const reader = new FileReader()
      reader.onload = (event) => {
        if (event.target?.result) {
          try {
            const newData = JSON.parse(event.target.result.toString())
            console.log('newData', newData)
            if (newData) {
              setScheduleData(newData)
            }
          } catch (error) {
            console.log('Failed to import', error)
          }
        }
      }
      reader.readAsText(file)
    } catch (err) {
      console.error(err)
    }
  }

  const [loadArtistVideosValue, setLoadArtistVideosValue] = useState(loadArtistVideos())
  const [loadArtistImagesValue, setLoadArtistImagesValue] = useState(loadArtistImages())
  const [loadArtistReleasesValue, setLoadArtistReleasesValue] = useState(loadArtistReleases())

  return (
    <div className='container'>
      <h1 className='text-3xl mb-2'>Settings</h1>

      <div className='flex items-center space-x-2 mb-2'>
        <Label htmlFor='airplane-mode'>Load Artist Videos</Label>
        <Switch
          id='airplane-mode'
          checked={loadArtistVideosValue}
          onCheckedChange={(event) => {
            setLoadArtistVideos(event)
            setLoadArtistVideosValue(event)
          }}
        />
      </div>

      <div className='flex items-center space-x-2 mb-2'>
        <Label htmlFor='airplane-mode'>Load Artist Images</Label>
        <Switch
          id='airplane-mode'
          checked={loadArtistImagesValue}
          onCheckedChange={(event) => {
            setLoadArtistImages(event)
            setLoadArtistImagesValue(event)
          }}
        />
      </div>

      <div className='flex items-center space-x-2 mb-2'>
        <Label htmlFor='airplane-mode'>Load Artist Videos</Label>
        <Switch
          id='airplane-mode'
          checked={loadArtistReleasesValue}
          onCheckedChange={(event) => {
            setLoadArtistReleases(event)
            setLoadArtistReleasesValue(event)
          }}
        />
      </div>

      <h2 className='text-2xl mb-2'>Data Import / Export</h2>
      <p>
        This allows you to move your settings to another computer. No data is ever stored on our servers. Copy the
        exported file to your other device, like your phone, and then import it.
      </p>
      <p>
        <ButtonLink onClick={exportData}>Save your data</ButtonLink>
      </p>

      <p>Load an exported data file. Note, this replaces all your settings on this device!</p>
      <p>
        <input type='file' accept='application/json' onChange={onchange} />
      </p>
    </div>
  )
}

export default Page
