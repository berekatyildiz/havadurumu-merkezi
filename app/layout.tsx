import type { Metadata } from 'next'
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import './globals.css'
// (Varsa mevcut font importların kalsın)

export const metadata: Metadata = {
  title: 'Hava Durumu Merkezi',
  description: 'Gelişmiş meteorolojik veriler ve atmosferik arayüz.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body className="min-h-full flex flex-col antialiased" suppressHydrationWarning>
        <Navbar />
        <main className="flex-grow flex flex-col relative w-full">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
}