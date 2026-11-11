'use client'

import { useAuth } from '@moonbase.sh/react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { errorMessage } from '@/lib/format'

export function ConfirmEmailChange() {
  const searchParams = useSearchParams()
  const { confirmEmailChange } = useAuth()

  const email = searchParams.get('email') ?? ''
  const code = searchParams.get('code') ?? ''

  const [result, setResult] = useState<{ error: string | null } | null>(null)

  // A code works once. The SDK hands a second call with the same code the first one's result, so
  // React running this effect twice in development doesn't spend it twice.
  useEffect(() => {
    if (!email || !code)
      return
    confirmEmailChange(email, code).then(
      () => setResult({ error: null }),
      (err: unknown) => setResult({ error: errorMessage(err) }),
    )
  }, [email, code, confirmEmailChange])

  const error = !email || !code ? 'This confirmation link is missing required information.' : result?.error

  if (error) {
    return (
      <div className="auth-result">
        <p className="error">{error}</p>
        <Link href="/account" className="auth-link">Back to account</Link>
      </div>
    )
  }

  if (!result)
    return <p className="empty">Confirming your new email…</p>

  return (
    <div className="auth-result">
      <p className="success">
        Your email is updated to
        {' '}
        <strong>{email}</strong>
        .
      </p>
      <Link href="/account" className="submit">Go to my account</Link>
    </div>
  )
}
