'use client'

import { useAuth } from '@moonbase.sh/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'
import { useUi } from '@/lib/ui'

const tabs = [
  { path: '/account', title: 'Account', exact: true },
  { path: '/account/products', title: 'Products', exact: false },
  { path: '/account/purchases', title: 'Purchases', exact: true },
  { path: '/account/redeem', title: 'Redeem', exact: true },
]

/** The account header, tabs, and the gate that asks signed-out visitors to sign in. */
export function AccountShell({ children }: { children: ReactNode }) {
  const { user, loaded } = useAuth()
  const { showLogin } = useUi()
  const pathname = usePathname()

  function isActive(tab: typeof tabs[number]) {
    if (tab.exact)
      return pathname === tab.path
    return pathname === tab.path || pathname.startsWith(`${tab.path}/`)
  }

  return (
    <main className="account-page">
      <div className="account-head">
        <div className="section-num">[ ACCOUNT ]</div>
        <h1>{user?.name || 'Your account'}</h1>
        {user && <p className="account-email">{user.email}</p>}
      </div>

      {!loaded
        ? <div className="account-loading">Loading…</div>
        : !user
            ? (
                <div className="account-signed-out">
                  <p>You need to be signed in to view your account.</p>
                  <button type="button" className="submit" onClick={showLogin}>Sign in</button>
                </div>
              )
            : (
                <div className="account-tabs-wrap">
                  <nav className="account-tabs" role="tablist">
                    {tabs.map(tab => (
                      <Link
                        key={tab.path}
                        href={tab.path}
                        role="tab"
                        className={isActive(tab) ? 'active' : undefined}
                        aria-selected={isActive(tab)}
                      >
                        {tab.title}
                      </Link>
                    ))}
                  </nav>
                  <div className="account-panel">
                    {children}
                  </div>
                </div>
              )}
    </main>
  )
}
