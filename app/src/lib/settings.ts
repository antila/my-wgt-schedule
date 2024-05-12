export const loadArtistVideos = (): boolean => {
  if (typeof localStorage === 'undefined') {
    return true
  }
  return JSON.parse(localStorage.getItem('LoadArtistVideos') || 'true')
}

export const setLoadArtistVideos = (val: boolean) => {
  localStorage.setItem('LoadArtistVideos', JSON.stringify(val))
}

export const loadArtistImages = (): boolean => {
  if (typeof localStorage === 'undefined') {
    return true
  }
  return JSON.parse(localStorage.getItem('LoadArtistImages') || 'true')
}

export const setLoadArtistImages = (val: boolean) => {
  localStorage.setItem('LoadArtistImages', JSON.stringify(val))
}

export const loadArtistReleases = (): boolean => {
  if (typeof localStorage === 'undefined') {
    return true
  }
  return JSON.parse(localStorage.getItem('LoadArtistReleases') || 'true')
}

export const setLoadArtistReleases = (val: boolean) => {
  localStorage.setItem('LoadArtistReleases', JSON.stringify(val))
}
