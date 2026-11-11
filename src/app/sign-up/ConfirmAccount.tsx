'use client'

import { useAuth } from '@moonbase.sh/react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { type FormEvent, useEffect, useState } from 'react'
import { errorMessage } from '@/lib/format'

type Status =
  | { step: 'confirming' }
  | { step: 'set-password', email: string, resetPasswordToken: string }
  | { step: 'error', error: string }

export function ConfirmAccount() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { confirmAccount, resetPassword, signIn } = useAuth()

  const email = searchParams.get('email') ?? ''
  const code = searchParams.get('code') ?? ''

  const [status, setStatus] = useState<Status>({ step: 'confirming' })

  // A code works once. The SDK hands a second call with the same code the first one's result, so
  // React running this effect twice in development doesn't spend it twice.
  useEffect(() => {
    if (!email || !code)
      return
    confirmAccount(email, code).then(
      (result) => {
        switch (result.status) {
          case 'PasswordSetupRequired':
            setStatus({ step: 'set-password', email: result.email, resetPasswordToken: result.resetPasswordToken! })
            return
          case 'SignedIn':
            router.replace('/account')
        }
      },
      (err: unknown) => setStatus({ step: 'error', error: errorMessage(err) }),
    )
  }, [email, code, confirmAccount, router])

  const [newPassword, setNewPassword] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  async function submitPassword(event: FormEvent) {
    event.preventDefault()
    if (status.step !== 'set-password')
      return
    setSaving(true)
    setSaveError(null)
    try {
      await resetPassword(status.email, newPassword, status.resetPasswordToken)
      try {
        await signIn(status.email, newPassword)
        router.replace('/account')
      }
      catch {
        router.replace('/login')
      }
    }
    catch (err) {
      setSaveError(errorMessage(err))
    }
    finally {
      setSaving(false)
    }
  }

  if (!email || !code || status.step === 'error') {
    return (
      <div className="auth-result">
        <p className="error">
          {status.step === 'error' ? status.error : 'This confirmation link is missing required information.'}
        </p>
        <Link href="/login" className="auth-link">Go to sign-in</Link>
      </div>
    )
  }

  if (status.step === 'confirming')
    return <p className="empty">Confirming your account…</p>

  return (
    <form className="account-form" onSubmit={submitPassword}>
      <p className="hint">
        Your account is confirmed. Choose a password for
        {' '}
        <strong>{status.email}</strong>
        {' '}
        to finish setting up.
      </p>

      <label htmlFor="new-password">Password</label>
      <input
        id="new-password"
        value={newPassword}
        onChange={e => setNewPassword(e.target.value)}
        type="password"
        autoComplete="new-password"
        required
      />

      <button type="submit" className="submit" disabled={saving}>
        {saving ? 'Saving…' : 'Save and continue'}
      </button>

      {saveError && <p className="error">{saveError}</p>}
    </form>
  )
}
