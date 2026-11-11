import type { Metadata } from 'next'
import { Suspense } from 'react'
import { AuthPage } from '@/components/AuthPage'
import { ConfirmAccount } from './ConfirmAccount'

export const metadata: Metadata = { title: 'Confirm account' }

/** The tenant's `ConfirmAccount` URL, with `?email=…&code=…`. */
export default function SignUpPage() {
  return (
    <AuthPage eyebrow="CONFIRM ACCOUNT" title="Welcome to Corino">
      <Suspense fallback={<p className="empty">Confirming your account…</p>}>
        <ConfirmAccount />
      </Suspense>
    </AuthPage>
  )
}
