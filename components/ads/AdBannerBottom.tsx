interface AdBannerBottomProps {
  slot?: string
}

export function AdBannerBottom({ slot = 'bottom-banner' }: AdBannerBottomProps) {
  return (
    <div
      className="w-full h-16 bg-gray-50 border-t border-gray-100 flex items-center justify-center text-xs text-gray-300"
      data-ad-slot={slot}
      data-ad-position="bottom"
    >
      {/* AdSense Banner Inferior */}
    </div>
  )
}
