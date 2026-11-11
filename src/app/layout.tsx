import type { Metadata } from 'next'
import { Inter, JetBrains_Mono, Space_Grotesk } from 'next/font/google'
import type { ReactNode } from 'react'
import { CartDrawer } from '@/components/CartDrawer'
import { CookieBanner } from '@/components/CookieBanner'
import { DemoBanner } from '@/components/DemoBanner'
import { LoginModal } from '@/components/LoginModal'
import { ProductDownloadModal } from '@/components/ProductDownloadModal'
import { Providers } from '@/components/Providers'
import { SiteFooter } from '@/components/SiteFooter'
import { SiteNav } from '@/components/SiteNav'
import { StorefrontEffects } from '@/components/StorefrontEffects'
import { getCatalog } from '@/lib/catalog'
import './globals.css'

const display = Space_Grotesk({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-display' })
const mono = JetBrains_Mono({ subsets: ['latin'], weight: ['400', '500', '600'], variable: '--font-mono' })
const body = Inter({ subsets: ['latin'], weight: ['400', '500', '600'], variable: '--font-body' })

export const metadata: Metadata = {
  title: {
    default: 'Corino · Sound, sculpted.',
    template: '%s · Corino',
  },
  robots: { index: false, follow: false },
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  const catalog = await getCatalog()

  return (
    <html lang="en" className={`${display.variable} ${mono.variable} ${body.variable}`}>
      <body>
        <Providers initialCatalog={catalog}>
          <DemoBanner />
          <SiteNav />
          {children}
          <SiteFooter />
          <CartDrawer />
          <LoginModal />
          <ProductDownloadModal />
          <CookieBanner />
          <StorefrontEffects />
        </Providers>
      </body>
    </html>
  )
}
