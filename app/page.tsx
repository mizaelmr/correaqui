import { Header } from '@/components/layout/Header'
import { Sidebar } from '@/components/layout/Sidebar'
import { MapView } from '@/components/map/MapView'
import { FloatingButton } from '@/components/layout/FloatingButton'
import { OccurrenceModal } from '@/components/occurrence/OccurrenceModal'
import { NewOccurrenceModal } from '@/components/occurrence/NewOccurrenceModal'

export default function HomePage() {
  return (
    <div className="h-full flex flex-col">
      <Header />
      <div className="flex flex-1 overflow-hidden pt-14">
        <Sidebar />
        <main className="flex-1 relative">
          <MapView />
          <FloatingButton />
        </main>
      </div>
      <OccurrenceModal />
      <NewOccurrenceModal />
    </div>
  )
}
