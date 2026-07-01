'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, X, Play } from 'lucide-react'
import { createPortal } from 'react-dom'
import type { Photo } from '@/types'

interface PhotoGalleryProps {
  photos: Photo[]
}

function MediaThumb({ photo, onClick }: { photo: Photo; onClick: () => void }) {
  if (photo.type === 'video') {
    return (
      <div
        className="w-full h-52 bg-gray-900 rounded-lg cursor-pointer flex items-center justify-center relative"
        onClick={onClick}
      >
        <video src={photo.url} className="w-full h-full object-cover rounded-lg opacity-70" muted preload="metadata" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-black/60 flex items-center justify-center">
            <Play className="w-6 h-6 text-white fill-white ml-0.5" />
          </div>
        </div>
      </div>
    )
  }
  return (
    <img
      src={photo.url}
      alt="Foto da ocorrência"
      className="w-full h-52 object-cover rounded-lg cursor-pointer bg-gray-200"
      onClick={onClick}
      onError={(e) => {
        const el = e.currentTarget
        el.style.display = 'none'
        const placeholder = document.createElement('div')
        placeholder.className = 'w-full h-52 rounded-lg bg-gray-200 flex items-center justify-center cursor-pointer'
        el.parentElement?.appendChild(placeholder)
      }}
    />
  )
}

function Lightbox({ photos, current, onClose, onPrev, onNext }: {
  photos: Photo[]
  current: number
  onClose: () => void
  onPrev: (e: React.MouseEvent) => void
  onNext: (e: React.MouseEvent) => void
}) {
  const photo = photos[current]

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center"
      onClick={onClose}
    >
      <button className="absolute top-4 right-4 text-white p-2" onClick={onClose}>
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
          className="max-w-full max-h-full object-contain"
          onClick={(e) => e.stopPropagation()}
        />
      )}

      {photos.length > 1 && (
        <>
          <button
            onClick={onPrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 text-white rounded-full p-3"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={onNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 text-white rounded-full p-3"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}
    </div>,
    document.body
  )
}

export function PhotoGallery({ photos }: PhotoGalleryProps) {
  const [current, setCurrent] = useState(0)
  const [lightbox, setLightbox] = useState(false)

  if (photos.length === 0) {
    return (
      <div className="h-40 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-sm">
        Sem fotos
      </div>
    )
  }

  const prev = () => setCurrent((c) => (c - 1 + photos.length) % photos.length)
  const next = () => setCurrent((c) => (c + 1) % photos.length)

  return (
    <>
      <div className="relative group">
        <MediaThumb photo={photos[current]} onClick={() => setLightbox(true)} />
        {photos.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={next}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
              {photos.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${
                    i === current ? 'bg-white w-3' : 'bg-white/60'
                  }`}
                />
              ))}
            </div>
          </>
        )}
        <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-0.5 rounded-full">
          {current + 1}/{photos.length}
        </div>
      </div>

      {lightbox && (
        <Lightbox
          photos={photos}
          current={current}
          onClose={() => setLightbox(false)}
          onPrev={(e) => { e.stopPropagation(); prev() }}
          onNext={(e) => { e.stopPropagation(); next() }}
        />
      )}
    </>
  )
}
