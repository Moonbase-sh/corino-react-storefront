import type { Metadata } from 'next'
import { Suspense } from 'react'
import { AuthPage } from '@/components/AuthPage'
import { DownloadRedirect } from './DownloadRedirect'

export const metadata: Metadata = { title: 'Download' }

/** The tenant's `DownloadProduct` URL, with `?product_id=…`. */
export default function DownloadPage() {
  return (
    <AuthPage eyebrow="DOWNLOAD" title="Download product" hint="Sign in to access your downloads and license keys.">
      <Suspense fallback={<p className="empty">Loading…</p>}>
        <DownloadRedirect />
      </Suspense>
    </AuthPage>
  )
}
