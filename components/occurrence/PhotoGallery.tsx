'use client'

import { useState, useEffect, useRef } from 'react'
import { ChevronLeft, ChevronRight, X, Play } from 'lucide-react'
import { createPortal } from 'react-dom'
import type { Photo } from '@/types'

interface PhotoGalleryProps {
  photos: Photo[]
}

function useSwipe(onSwipeLeft: () => void, onSwipeRight: () => void) {
  const touchStartX = useRef<number | null>(null)

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return
    const diff = touchStartX.current - e.changedTouches[0].clientX
    if (Math.abs(diff) > 40) {
      diff > 0 ? onSwipeLeft() : onSwipeRight()
    }
    touchStartX.current = null
  }

  return { onTouchStart, onTouchEnd }
}

function Lightbox({ photos, initialIndex, onClose }: {
  photos: Photo[]
  initialIndex: number
  onClose: () => void
}) {
  const [current, setCurrent] = useState(initialIndex)
  const prev = () => setCurrent((c) => (c - 1 + photos.length) % photos.length)
  const next = () => setCurrent((c) => (c + 1) % photos.length)
  const swipe = useSwipe(next, prev)
  const photo = photos[current]

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prev()
      else if (e.key === 'ArrowRight') next()
      else if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center"
      onClick={onClose}
      {...swipe}
    >
      <button className="absolute top-4 right-4 text-white p-2 z-10" onClick={onClose}>
        <X className="w-6 h-6" />
      </button>

      {photo.type === 'video' ? (
        <video
          src={photo.url}
          controls
          autoPlay
          className="max-w-full max-h-full"
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <img
          src={photo.url}
          alt=""
          className="max-w-full max-h-full object-contain select-none"
          onClick={(e) => e.stopPropagation()}
          draggable={false}
        />
      )}

      {photos.length > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); prev() }}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white rounded-full p-3 z-10"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); next() }}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white rounded-full p-3 z-10"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
            {photos.map((_, i) => (
              <button
                key={i}
                onClick={(e) => { e.stopPropagation(); setCurrent(i) }}
                className={`w-1.5 h-1.5 rounded-full transition-all ${i === current ? 'bg-white w-3' : 'bg-white/50'}`}
              />
            ))}
          </div>
        </>
      )}
    </div>,
    document.body
  )
}

export function PhotoGallery({ photos }: PhotoGalleryProps) {
  const [current, setCurrent] = useState(0)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const prev = () => setCurrent((c) => (c - 1 + photos.length) % photos.length)
  const next = () => setCurrent((c) => (c + 1) % photos.length)
  const swipe = useSwipe(next, prev)

  if (photos.length === 0) {
    return (
      <div className="h-40 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-sm">
        Sem fotos
      </div>
    )
  }

  const photo = photos[current]

  return (
    <>
      <div className="relative" {...swipe}>
        {photo.type === 'video' ? (
          <div
            className="w-full h-52 bg-gray-900 rounded-lg cursor-pointer flex items-center justify-center relative"
            onClick={() => setLightboxIndex(current)}
          >
            <video src={photo.url} className="w-full h-full object-cover rounded-lg opacity-70" muted preload="metadata" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-black/60 flex items-center justify-center">
                <Play className="w-6 h-6 text-white fill-white ml-0.5" />
              </div>
            </div>
          </div>
        ) : (
          <img
            src={photo.url}
            alt="Foto da ocorrência"
            className="w-full h-52 object-cover rounded-lg cursor-pointer bg-gray-200 select-none"
            onClick={() => setLightboxIndex(current)}
            draggable={false}
            onError={(e) => {
              const el = e.currentTarget
              el.style.display = 'none'
              const placeholder = document.createElement('div')
              placeholder.className = 'w-full h-52 rounded-lg bg-gray-200'
              el.parentElement?.appendChild(placeholder)
            }}
          />
        )}

        {photos.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-1.5"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={next}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-1.5"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
              {photos.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${i === current ? 'bg-white w-3' : 'bg-white/60'}`}
                />
              ))}
            </div>
          </>
        )}

        <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-0.5 rounded-full">
          {current + 1}/{photos.length}
        </div>
      </div>

      {lightboxIndex !== null && (
        <Lightbox
          photos={photos}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </>
  )
}
