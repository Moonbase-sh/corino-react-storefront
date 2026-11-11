'use client'

import { useAuth } from '@moonbase.sh/react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { type FormEvent, useEffect, useState } from 'react'
import { errorMessage } from '@/lib/format'

export function LoginForm() {
  const { user, loaded, signIn } = useAuth()
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loggingIn, setLoggingIn] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Someone already signed in when they land here goes straight to their account
  useEffect(() => {
    if (loaded && user)
      router.replace('/account')
  }, [loaded, user, router])

  async function submit(event: FormEvent) {
    event.preventDefault()
    setLoggingIn(true)
    setError(null)
    try {
      await signIn(email, password)
      router.replace('/account')
    }
    catch (err) {
      setError(errorMessage(err))
    }
    finally {
      setLoggingIn(false)
    }
  }

  return (
    <form className="account-form" onSubmit={submit}>
      <label htmlFor="login-email">Email</label>
      <input id="login-email" value={email} onChange={e => setEmail(e.target.value)} type="email" autoComplete="email" required />

      <label htmlFor="login-password">Password</label>
      <input
        id="login-password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        type="password"
        autoComplete="current-password"
        required
      />

      <button type="submit" className="submit" disabled={loggingIn}>
        {loggingIn ? 'Signing in…' : 'Sign in'}
      </button>

      {error && <p className="error">{error}</p>}

      <Link href="/forgot-password" className="auth-link">Forgot your password?</Link>
    </form>
  )
}
