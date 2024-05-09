'use client'

import React, { useState, useEffect, useRef } from 'react'

const LazyYoutube = ({ src }: { src: string }) => {
  const [load, setLoad] = useState(false)
  const videoRef = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setLoad(true)
        observer.disconnect()
      }
    })

    if (videoRef.current) {
      observer.observe(videoRef.current)
    }

    return () => {
      if (videoRef.current) {
        observer.unobserve(videoRef.current)
      }
    }
  }, [])

  return (
    <div ref={videoRef} className='h-full'>
      {load ? (
        <iframe
          width='100%'
          height='100%'
          src={src}
          title='YouTube video player'
          frameBorder='0'
          allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
          referrerPolicy='strict-origin-when-cross-origin'
          allowFullScreen
        />
        // <iframe
        //   width='100%'
        //   height='315'
        //   src={src}
        //   title='YouTube video player'
        //   frameBorder='0'
        //   allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
        //   allowFullScreen
        // />
      ) : (
        <div>Loading YouTube video...</div>
      )}
    </div>
  )
}

export default LazyYoutube
