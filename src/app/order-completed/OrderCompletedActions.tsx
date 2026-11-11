'use client'

import { useAuth } from '@moonbase.sh/react'
import Link from 'next/link'

export function OrderCompletedActions() {
  const { user } = useAuth()

  return (
    <div className="auth-actions">
      {user
        ? <Link href="/account/products" className="submit">Go to my products</Link>
        : <Link href="/login" className="submit">Sign in</Link>}
      <Link href="/" className="submit secondary">Back to home</Link>
    </div>
  )
}
