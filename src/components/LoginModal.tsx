'use client'

import { useAuth } from '@moonbase.sh/react'
import Link from 'next/link'
import { type FormEvent, useState } from 'react'
import { errorMessage } from '@/lib/format'
import { useUi } from '@/lib/ui'
import { useEscape } from './useEscape'

export function LoginModal() {
  const { state, hideLogin } = useUi()
  const { signIn } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loggingIn, setLoggingIn] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEscape(state.loginOpen, hideLogin)

  async function tryLogin(event: FormEvent) {
    event.preventDefault()
    setLoggingIn(true)
    setError(null)
    try {
      await signIn(email, password)
      hideLogin()
      setEmail('')
      setPassword('')
    }
    catch (err) {
      setError(errorMessage(err))
    }
    finally {
      setLoggingIn(false)
    }
  }

  if (!state.loginOpen)
    return null

  return (
    <div className="modal-mask" onClick={hideLogin}>
      <form className="modal" onClick={e => e.stopPropagation()} onSubmit={tryLogin}>
        <h2>Sign in</h2>

        <label htmlFor="login-email">Email</label>
        <input
          id="login-email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          type="email"
          required
          autoComplete="email"
          autoFocus
        />

        <label htmlFor="login-password">Password</label>
        <input
          id="login-password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          type="password"
          required
          autoComplete="current-password"
        />

        {error && <p className="error">{error}</p>}

        <button type="submit" className="submit" disabled={loggingIn}>
          {loggingIn ? 'Signing in…' : 'Sign in'}
        </button>

        <div className="secondary-row">
          <Link href="/forgot-password" onClick={hideLogin}>Forgot password?</Link>
          <button type="button" onClick={hideLogin}>Cancel</button>
        </div>
      </form>
    </div>
  )
}
