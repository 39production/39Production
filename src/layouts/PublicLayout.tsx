import { Outlet } from 'react-router-dom'
import { Navbar } from '@/components/common/Navbar'
import { Footer } from '@/components/common/Footer'
import { WhatsAppButton } from '@/components/common/WhatsAppButton'

export function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-bg-base">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <WhatsAppButton variant="float" />
    </div>
  )
}
