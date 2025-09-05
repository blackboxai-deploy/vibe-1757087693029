import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/sonner'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Flight Search - Buenos Aires to Miami | Find Best Flight Deals',
  description: 'Compare and book flights from Buenos Aires (EZE/AEP) to Miami (MIA). Find the best prices, airlines, and schedules for your trip.',
  keywords: 'flights, Buenos Aires, Miami, flight search, compare flights, airline tickets',
  authors: [{ name: 'Flight Search App' }],
  viewport: 'width=device-width, initial-scale=1, maximum-scale=5',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' }
  ]
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className={`${inter.className} antialiased min-h-screen bg-background`}>
          <div className="flex flex-col min-h-screen">
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">✈</span>
                  </div>
                  <div className="flex flex-col">
                    <h1 className="text-lg font-bold text-foreground">FlightFinder</h1>
                    <p className="text-xs text-muted-foreground hidden sm:block">Buenos Aires → Miami</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="hidden sm:flex items-center text-sm text-muted-foreground">
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                      Búsqueda en Tiempo Real
                    </span>
                  </div>
                </div>
              </div>
            </header>
            
            <main className="flex-1">
              {children}
            </main>
            
            <footer className="border-t bg-muted/30">
              <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div>
                    <h3 className="font-semibold text-foreground mb-3">Rutas Populares</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>Buenos Aires → Miami</li>
                      <li>Buenos Aires → New York</li>
                      <li>Buenos Aires → Madrid</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-3">Aerolíneas</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>Aerolíneas Argentinas</li>
                      <li>American Airlines</li>
                      <li>LATAM Airlines</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-3">Información</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>Políticas de Equipaje</li>
                      <li>Check-in Online</li>
                      <li>Cambios y Cancelaciones</li>
                    </ul>
                  </div>
                </div>
                <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
                  <p>&copy; 2024 FlightFinder. Encuentra los mejores vuelos Buenos Aires - Miami.</p>
                </div>
              </div>
            </footer>
          </div>
          <Toaster richColors position="top-center" />
      </body>
    </html>
  )
}