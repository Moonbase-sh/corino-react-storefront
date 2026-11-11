'use client'

import { useAuth } from '@moonbase.sh/react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import { useUi } from '@/lib/ui'

/** Sends a signed-in customer to the product's page in their account, where the downloads are. */
export function DownloadRedirect() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user, loaded } = useAuth()
  const { showLogin } = useUi()

  const productId = searchParams.get('product_id') ?? ''

  useEffect(() => {
    if (loaded && user && productId)
      router.replace(`/account/products/${encodeURIComponent(productId)}`)
  }, [loaded, user, productId, router])

  if (!loaded)
    return <p className="empty">Loading…</p>

  if (!productId)
    return <p className="error">This link is missing a product reference.</p>

  if (user)
    return <p className="empty">{`Loading downloads for ${productId}…`}</p>

  return (
    <div className="auth-result">
      <p className="hint">
        You need to be signed in to download
        {' '}
        <strong>{productId}</strong>
        .
      </p>
      <button type="button" className="submit" onClick={showLogin}>Sign in</button>
      <p className="hint">Don&apos;t have an account? Purchase the product to get one.</p>
      <Link href="/" className="auth-link">Browse plugins</Link>
    </div>
  )
}
