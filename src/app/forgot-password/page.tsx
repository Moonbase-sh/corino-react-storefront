import type { Metadata } from 'next'
import { Suspense } from 'react'
import { AuthPage } from '@/components/AuthPage'
import { ForgotPassword } from './ForgotPassword'

export const metadata: Metadata = { title: 'Reset password' }

/**
 * The tenant's `ResetPassword` URL. With `?email=…&code=…` from the reset email it asks for a new
 * password; without, it asks for the email to send that link to.
 */
export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<AuthPage eyebrow="RESET PASSWORD" title="Reset your password"><p className="empty">Loading…</p></AuthPage>}>
      <ForgotPassword />
    </Suspense>
  )
}
