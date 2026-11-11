import type { Metadata } from 'next'
import { Suspense } from 'react'
import { AuthPage } from '@/components/AuthPage'
import { ConfirmEmail } from './ConfirmEmail'

export const metadata: Metadata = { title: 'Confirm email' }

/** The tenant's `ConfirmEmail` URL, with `?email=…&code=…`. */
export default function ConfirmEmailPage() {
  return (
    <AuthPage eyebrow="CONFIRM EMAIL" title="Email confirmation">
      <Suspense fallback={<p className="empty">Confirming your email…</p>}>
        <ConfirmEmail />
      </Suspense>
    </AuthPage>
  )
}
