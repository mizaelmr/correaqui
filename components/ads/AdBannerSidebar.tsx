interface AdBannerSidebarProps {
  slot?: string
}

export function AdBannerSidebar({ slot = 'sidebar-banner' }: AdBannerSidebarProps) {
  return (
    <div
      className="w-full h-20 bg-gray-50 rounded-lg flex items-center justify-center text-xs text-gray-300 my-1"
      data-ad-slot={slot}
      data-ad-position="sidebar"
    >
      {/* AdSense Banner Lateral */}
    </div>
  )
}
