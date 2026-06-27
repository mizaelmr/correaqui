interface AdBannerTopProps {
  slot?: string
}

export function AdBannerTop({ slot = 'top-banner' }: AdBannerTopProps) {
  // Placeholder para Google AdSense - substituir pelo script real quando disponível
  return (
    <div
      className="w-full h-14 bg-gray-50 border-b border-gray-100 flex items-center justify-center text-xs text-gray-300"
      data-ad-slot={slot}
      data-ad-position="top"
    >
      {/* AdSense Banner Superior */}
    </div>
  )
}
