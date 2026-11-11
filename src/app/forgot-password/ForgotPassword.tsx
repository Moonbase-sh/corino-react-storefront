'use client'

import { useAuth } from '@moonbase.sh/react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { type FormEvent, useState } from 'react'
import { AuthPage } from '@/components/AuthPage'
import { errorMessage } from '@/lib/format'

export function ForgotPassword() {
  const searchParams = useSearchParams()
  const linkEmail = searchParams.get('email') ?? ''
  const linkCode = searchParams.get('code') ?? ''
  const hasResetLink = !!linkEmail && !!linkCode

  return (
    <AuthPage eyebrow="RESET PASSWORD" title={hasResetLink ? 'Set a new password' : 'Reset your password'}>
      {hasResetLink ? <ResetForm email={linkEmail} code={linkCode} /> : <RequestForm />}
    </AuthPage>
  )
}

/** Came from the email link: choose the new password. */
function ResetForm({ email, code }: { email: string, code: string }) {
  const { resetPassword, signIn } = useAuth()
  const router = useRouter()

  const [newPassword, setNewPassword] = useState('')
  const [resetting, setResetting] = useState(false)
  const [resetError, setResetError] = useState<string | null>(null)
  const [resetDone, setResetDone] = useState(false)

  async function submit(event: FormEvent) {
    event.preventDefault()
    setResetting(true)
    setResetError(null)
    try {
      await resetPassword(email, newPassword, code)
      try {
        await signIn(email, newPassword)
        router.replace('/account')
      }
      catch {
        setResetDone(true)
      }
    }
    catch (err) {
      setResetError(errorMessage(err))
    }
    finally {
      setResetting(false)
    }
  }

  if (resetDone) {
    return (
      <div className="auth-result">
        <p className="success">Your password is updated.</p>
        <button type="button" className="submit" onClick={() => router.push('/login')}>Sign in</button>
      </div>
    )
  }

  return (
    <form className="account-form" onSubmit={submit}>
      <p className="hint">
        Setting a new password for
        {' '}
        <strong>{email}</strong>
        .
      </p>

      <label htmlFor="new-password">New password</label>
      <input
        id="new-password"
        value={newPassword}
        onChange={e => setNewPassword(e.target.value)}
        type="password"
        autoComplete="new-password"
        required
      />

      <button type="submit" className="submit" disabled={resetting}>
        {resetting ? 'Saving…' : 'Save password'}
      </button>

      {resetError && <p className="error">{resetError}</p>}
    </form>
  )
}

/** Wants a reset email. */
function RequestForm() {
  const { forgotPassword } = useAuth()

  const [email, setEmail] = useState('')
  const [requesting, setRequesting] = useState(false)
  const [requestError, setRequestError] = useState<string | null>(null)
  const [requestSent, setRequestSent] = useState(false)

  async function submit(event: FormEvent) {
    event.preventDefault()
    setRequesting(true)
    setRequestError(null)
    try {
      await forgotPassword(email)
      setRequestSent(true)
    }
    catch (err) {
      setRequestError(errorMessage(err))
    }
    finally {
      setRequesting(false)
    }
  }

  if (requestSent) {
    return (
      <div className="auth-result">
        <p className="success">Check your inbox.</p>
        <p className="hint">
          If an account exists for
          {' '}
          <strong>{email}</strong>
          , you&apos;ll receive a reset link shortly.
        </p>
        <Link href="/login" className="auth-link">Back to sign-in</Link>
      </div>
    )
  }

  return (
    <form className="account-form" onSubmit={submit}>
      <p className="hint">Enter your email and we&apos;ll send you a link to reset your password.</p>

      <label htmlFor="request-email">Email</label>
      <input id="request-email" value={email} onChange={e => setEmail(e.target.value)} type="email" autoComplete="email" required />

      <button type="submit" className="submit" disabled={requesting}>
        {requesting ? 'Sending…' : 'Send reset link'}
      </button>

      {requestError && <p className="error">{requestError}</p>}

      <Link href="/login" className="auth-link">Back to sign-in</Link>
    </form>
  )
}
