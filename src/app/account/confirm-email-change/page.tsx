import type { Metadata } from 'next'
import { Suspense } from 'react'
import { AuthPage } from '@/components/AuthPage'
import { ConfirmEmailChange } from './ConfirmEmailChange'

export const metadata: Metadata = { title: 'Confirm email change' }

/**
 * The tenant's `ConfirmEmailChange` URL, with `?email=…&code=…`. It sits outside the `(tabs)`
 * route group, so it renders on its own, without the account header, tabs and sign-in gate.
 */
export default function ConfirmEmailChangePage() {
  return (
    <AuthPage eyebrow="CONFIRM EMAIL CHANGE" title="Email change">
      <Suspense fallback={<p className="empty">Confirming your new email…</p>}>
        <ConfirmEmailChange />
      </Suspense>
    </AuthPage>
  )
}
