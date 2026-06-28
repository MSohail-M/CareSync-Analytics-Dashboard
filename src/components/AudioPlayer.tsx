'use client'
import { useRef, useState, useEffect, useCallback } from 'react'

function fmt(s: number) {
  if (!isFinite(s)) return '0:00'
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${m}:${sec.toString().padStart(2, '0')}`
}

/* ── Full player — used on the call detail page ────────────── */
export function AudioPlayer({ url }: { url: string }) {
  const audioRef  = useRef<HTMLAudioElement>(null)
  const trackRef  = useRef<HTMLDivElement>(null)
  const [playing, setPlaying]       = useState(false)
  const [current, setCurrent]       = useState(0)
  const [duration, setDuration]     = useState(0)
  const [speed, setSpeed]           = useState(1)
  const [dragging, setDragging]     = useState(false)

  const pct = duration > 0 ? (current / duration) * 100 : 0

  useEffect(() => {
    const a = audioRef.current
    if (!a) return
    const onTime  = () => setCurrent(a.currentTime)
    const onMeta  = () => setDuration(a.duration)
    const onEnded = () => setPlaying(false)
    a.addEventListener('timeupdate', onTime)
    a.addEventListener('loadedmetadata', onMeta)
    a.addEventListener('ended', onEnded)
    return () => {
      a.removeEventListener('timeupdate', onTime)
      a.removeEventListener('loadedmetadata', onMeta)
      a.removeEventListener('ended', onEnded)
    }
  }, [])

  const togglePlay = () => {
    const a = audioRef.current
    if (!a) return
    if (playing) { a.pause(); setPlaying(false) }
    else         { a.play();  setPlaying(true)  }
  }

  const skip = (secs: number) => {
    const a = audioRef.current
    if (!a) return
    a.currentTime = Math.max(0, Math.min(a.currentTime + secs, duration))
  }

  const changeSpeed = () => {
    const next = speed === 1 ? 1.5 : speed === 1.5 ? 2 : 1
    setSpeed(next)
    if (audioRef.current) audioRef.current.playbackRate = next
  }

  const seekAt = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const track = trackRef.current
    const a     = audioRef.current
    if (!track || !a || !duration) return
    const rect = track.getBoundingClientRect()
    const ratio = Math.max(0, Math.min((e.clientX - rect.left) / rect.width, 1))
    a.currentTime = ratio * duration
  }, [duration])

  return (
    <div style={{
      background: 'white',
      border: '1px solid rgba(0,0,0,0.09)',
      borderRadius: 16,
      padding: '18px 22px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.07)',
    }}>
      <audio ref={audioRef} src={url} preload="metadata" />

      {/* Controls row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>

        {/* Skip back */}
        <button onClick={() => skip(-10)} title="Back 10s" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280', padding: 4, display: 'flex', alignItems: 'center' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.62"/>
            <text x="7" y="16" fontSize="6" fill="currentColor" stroke="none" fontWeight="700">10</text>
          </svg>
        </button>

        {/* Play / Pause */}
        <button onClick={togglePlay} style={{
          width: 46, height: 46, borderRadius: '50%', border: 'none', cursor: 'pointer',
          background: 'linear-gradient(135deg, #1B4F8C, #2563EB)',
          boxShadow: '0 4px 14px rgba(27,79,140,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          color: 'white',
        }}>
          {playing
            ? <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
            : <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ marginLeft: 2 }}><polygon points="5 3 19 12 5 21 5 3"/></svg>
          }
        </button>

        {/* Skip forward */}
        <button onClick={() => skip(10)} title="Forward 10s" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280', padding: 4, display: 'flex', alignItems: 'center' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-.49-3.62"/>
            <text x="7" y="16" fontSize="6" fill="currentColor" stroke="none" fontWeight="700">10</text>
          </svg>
        </button>

        {/* Time */}
        <div style={{ fontSize: 13, color: '#374151', fontWeight: 600, letterSpacing: '-0.01em', minWidth: 80 }}>
          {fmt(current)} <span style={{ color: '#9CA3AF', fontWeight: 400 }}>/ {fmt(duration)}</span>
        </div>

        {/* Speed — pushed to right */}
        <button onClick={changeSpeed} style={{
          marginLeft: 'auto',
          background: speed !== 1 ? 'rgba(27,79,140,0.09)' : '#F4F3EE',
          border: `1px solid ${speed !== 1 ? 'rgba(27,79,140,0.2)' : 'rgba(0,0,0,0.09)'}`,
          borderRadius: 100, padding: '4px 12px',
          fontSize: 12.5, fontWeight: 700,
          color: speed !== 1 ? '#1B4F8C' : '#6B7280',
          cursor: 'pointer',
        }}>
          {speed}×
        </button>
      </div>

      {/* Progress track */}
      <div
        ref={trackRef}
        onClick={seekAt}
        onMouseDown={() => setDragging(true)}
        onMouseUp={() => setDragging(false)}
        onMouseMove={e => { if (dragging) seekAt(e) }}
        style={{ height: 6, background: '#F3F4F6', borderRadius: 100, cursor: 'pointer', position: 'relative', overflow: 'hidden' }}
      >
        <div style={{
          height: '100%',
          width: `${pct}%`,
          background: 'linear-gradient(90deg, #1B4F8C, #2563EB)',
          borderRadius: 100,
          transition: dragging ? 'none' : 'width 0.1s linear',
        }} />
      </div>
    </div>
  )
}

/* ── Mini player — used inline in the calls table ──────────── */
export function MiniPlayer({ url, isActive, onActivate }: {
  url: string
  isActive: boolean
  onActivate: () => void
}) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying]   = useState(false)
  const [current, setCurrent]   = useState(0)
  const [duration, setDuration] = useState(0)

  const pct = duration > 0 ? (current / duration) * 100 : 0

  useEffect(() => {
    const a = audioRef.current
    if (!a) return
    const onTime  = () => setCurrent(a.currentTime)
    const onMeta  = () => setDuration(a.duration)
    const onEnded = () => setPlaying(false)
    a.addEventListener('timeupdate', onTime)
    a.addEventListener('loadedmetadata', onMeta)
    a.addEventListener('ended', onEnded)
    return () => {
      a.removeEventListener('timeupdate', onTime)
      a.removeEventListener('loadedmetadata', onMeta)
      a.removeEventListener('ended', onEnded)
    }
  }, [])

  // Pause when another row becomes active
  useEffect(() => {
    if (!isActive && playing) {
      audioRef.current?.pause()
      setPlaying(false)
    }
  }, [isActive, playing])

  const toggle = (e: React.MouseEvent) => {
    e.stopPropagation()
    const a = audioRef.current
    if (!a) return
    if (!isActive) onActivate()
    if (playing) { a.pause(); setPlaying(false) }
    else         { a.play();  setPlaying(true)  }
  }

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation()
    const a = audioRef.current
    if (!a || !duration) return
    const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect()
    a.currentTime = ((e.clientX - rect.left) / rect.width) * duration
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <audio ref={audioRef} src={url} preload="metadata" />

      {/* Play / Pause button */}
      <button onClick={toggle} style={{
        width: 30, height: 30, borderRadius: '50%', cursor: 'pointer',
        background: playing ? 'linear-gradient(135deg, #1B4F8C, #2563EB)' : 'rgba(27,79,140,0.08)',
        border: '1px solid rgba(27,79,140,0.2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        color: playing ? 'white' : '#1B4F8C',
        transition: 'all 0.18s',
        boxShadow: playing ? '0 2px 8px rgba(27,79,140,0.3)' : 'none',
      }}>
        {playing
          ? <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
          : <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor" style={{ marginLeft: 1 }}><polygon points="5 3 19 12 5 21 5 3"/></svg>
        }
      </button>

      {/* Progress + time — only show when active */}
      {isActive && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1, minWidth: 0 }}>
          <div
            onClick={seek}
            style={{ flex: 1, height: 4, background: '#E5E7EB', borderRadius: 100, cursor: 'pointer', overflow: 'hidden' }}
          >
            <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg, #1B4F8C, #2563EB)', borderRadius: 100, transition: 'width 0.1s linear' }} />
          </div>
          <span style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 500, whiteSpace: 'nowrap', letterSpacing: '-0.01em' }}>
            {fmt(current)}<span style={{ color: '#D1D5DB' }}>/{fmt(duration)}</span>
          </span>
        </div>
      )}
    </div>
  )
}
