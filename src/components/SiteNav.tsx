'use client'

import { useAuth, useCart } from '@moonbase.sh/react'
import Link from 'next/link'
import { useUi } from '@/lib/ui'
import { CartIcon, UserIcon } from './icons'

export function SiteNav() {
  const { user, loaded } = useAuth()
  const { items } = useCart()
  const { showCart, showLogin } = useUi()

  const cartCount = items.reduce((sum, item) => sum + (item.quantity ?? 1), 0)

  return (
    <nav className="top">
      <div className="nav-inner">
        <Link href="/" className="logo">
          <span className="logo-mark" />
          CORINO
        </Link>
        <div className="nav-links">
          <Link href="/#plugins" className="active">Plugins</Link>
          <Link href="/#bundle">Bundle</Link>
        </div>
        <div className="nav-right">
          {loaded && !user && (
            <button type="button" className="login-btn" onClick={showLogin}>
              <UserIcon />
              Log in
            </button>
          )}
          {user && (
            <Link href="/account" className="login-btn">
              <UserIcon />
              <span>{user.name || 'My account'}</span>
            </Link>
          )}
          <button type="button" className="icon-btn" aria-label="Cart" onClick={showCart}>
            <CartIcon />
            {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
          </button>
        </div>
      </div>
    </nav>
  )
}
