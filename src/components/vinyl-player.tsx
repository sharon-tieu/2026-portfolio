import { useEffect, useRef, useState } from 'react'
import { IconHover3D } from '@/components/ui/icon-3d-hover'

/* The vinyl record in About. Clicking it slides in Spotify's compact player (album art, song, play/pause)
   at the bottom left and plays 10 seconds of "Sweet Nothing" by Calvin Harris, then closes. Its ✕, clicking
   the record again, or leaving About stops it early. Visitors not signed in to Spotify hear Spotify's
   preview clip; signed-in visitors hear the song from 0:30. */
const TRACK = 'spotify:track:24LS4lQShWyixJ0ZrJXfJ5'
const START_MS = 30000, CLIP_MS = 10000

/* eslint-disable @typescript-eslint/no-explicit-any */
declare global { interface Window { onSpotifyIframeApiReady?: (api: any) => void } }
let spotifyApi: Promise<any> | null = null
function loadSpotify(): Promise<any> {
  if (!spotifyApi) spotifyApi = new Promise(resolve => {
    window.onSpotifyIframeApiReady = api => resolve(api)
    const s = document.createElement('script')
    s.src = 'https://open.spotify.com/embed/iframe-api/v1'
    s.async = true
    document.head.appendChild(s)
  })
  return spotifyApi
}

export function VinylPlayer() {
  const [open, setOpen] = useState(false)
  const slot = useRef<HTMLDivElement>(null)
  const ctl = useRef<any>(null)

  const stop = () => {
    try { ctl.current?.pause(); ctl.current?.destroy() } catch { /* already gone */ }
    ctl.current = null
    setOpen(false)
  }

  const play = async () => {
    document.getElementById('aboutBubble')?.classList.remove('show')
    if (open) { stop(); return }                       // clicking the record again stops it
    setOpen(true)
    const api = await loadSpotify()
    if (!slot.current) return
    const host = document.createElement('div')
    slot.current.replaceChildren(host)
    api.createController(host, { uri: TRACK, width: '100%', height: 80 }, (c: any) => {
      ctl.current = c
      let startedAt: number | null = null, sought = false
      c.addListener('ready', () => c.play())
      c.addListener('playback_update', (e: any) => {
        const { position, duration, isPaused, isBuffering } = e.data
        if (isPaused || isBuffering) return
        // full song (signed in): jump to 0:30 once; previews are only 30s long, so they play from the start
        if (!sought && duration > START_MS * 2) { sought = true; c.seek(START_MS / 1000); return }
        const from = startedAt ?? (startedAt = position)
        if (position - from >= CLIP_MS) stop()
      })
    })
  }

  // stop the song when leaving the About page
  useEffect(() => {
    const onHash = () => { if (location.hash !== '#about') stop() }
    addEventListener('hashchange', onHash)
    return () => removeEventListener('hashchange', onHash)
  })

  return (
    <>
      <div className="journal-btn" data-bubble="play sweet nothing by calvin harris" role="button" tabIndex={0}
        aria-label={open ? 'Stop Sweet Nothing by Calvin Harris' : 'Play 10 seconds of Sweet Nothing by Calvin Harris'}
        onPointerEnter={() => { loadSpotify() }}           // get Spotify ready before the click
        onClick={play} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); play() } }}>
        <IconHover3D icon="playlist" iconOnly width={102} height={102} />
      </div>

      {open && (
        <div className="now-playing" role="region" aria-label="Now playing: Sweet Nothing by Calvin Harris">
          <div className="np-player" ref={slot} />
          <button type="button" className="np-x" aria-label="Stop and close" onClick={stop}>✕</button>
        </div>
      )}
    </>
  )
}
