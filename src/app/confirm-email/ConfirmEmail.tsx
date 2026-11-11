'use client'

import { useAuth } from '@moonbase.sh/react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { errorMessage } from '@/lib/format'

export function ConfirmEmail() {
  const searchParams = useSearchParams()
  const { confirmEmail } = useAuth()

  const email = searchParams.get('email') ?? ''
  const code = searchParams.get('code') ?? ''

  const [result, setResult] = useState<{ error: string | null } | null>(null)

  // A code works once. The SDK hands a second call with the same code the first one's result, so
  // React running this effect twice in development doesn't spend it twice.
  useEffect(() => {
    if (!email || !code)
      return
    confirmEmail(email, code).then(
      () => setResult({ error: null }),
      (err: unknown) => setResult({ error: errorMessage(err) }),
    )
  }, [email, code, confirmEmail])

  const error = !email || !code ? 'This confirmation link is missing required information.' : result?.error

  if (error) {
    return (
      <div className="auth-result">
        <p className="error">{error}</p>
        <Link href="/login" className="auth-link">Go to sign-in</Link>
      </div>
    )
  }

  if (!result)
    return <p className="empty">Confirming your email…</p>

  return (
    <div className="auth-result">
      <p className="success">Your email address is confirmed.</p>
      <Link href="/account" className="submit">Go to my account</Link>
    </div>
  )
}
