interface AdBannerSidebarProps {
  slot?: string
}

// ── ADSENSE SIDEBAR ──
// Card de anúncio exibido a cada 3 ocorrências na sidebar.
// Para integrar o Google AdSense: substituir o conteúdo do <div data-ad-content>
// pelo script <ins class="adsbygoogle"> fornecido pelo Google.
export function AdBannerSidebar({ slot = 'sidebar-banner' }: AdBannerSidebarProps) {
  return (
    <div
      className="p-3 rounded-lg border border-dashed border-gray-200 bg-gray-50"
      data-ad-slot={slot}
      data-ad-position="sidebar"
    >
      {/* Linha superior: ícone placeholder + badge "Anúncio" */}
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded bg-gray-200" />
          <div className="h-3 w-20 rounded bg-gray-200" />
        </div>
        <div className="h-4 w-12 rounded-full bg-gray-200" />
      </div>

      {/* Título placeholder */}
      <div className="space-y-1.5 mb-1.5">
        <div className="h-3.5 w-full rounded bg-gray-200" />
        <div className="h-3.5 w-4/5 rounded bg-gray-200" />
      </div>

      {/* Endereço placeholder */}
      <div className="h-3 w-3/4 rounded bg-gray-200 mb-2" />

      {/* Barra de tempo placeholder */}
      <div className="h-2.5 w-full rounded bg-gray-200" />

      {/* Rodapé */}
      <div className="mt-2.5 flex items-center justify-center">
        <span className="text-[10px] font-medium text-gray-300 uppercase tracking-widest">
          Anúncio — Google AdSense
        </span>
      </div>

      {/* ── Conteúdo AdSense ── substituir este div pelo <ins> do Google */}
      <div data-ad-content className="hidden" />
    </div>
  )
}
