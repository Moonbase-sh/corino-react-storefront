'use client'

import { formatMoney, useCart } from '@moonbase.sh/react'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { useUi } from '@/lib/ui'
import { CartLine } from './CartLine'
import { CloseIcon } from './icons'
import { useEscape } from './useEscape'

export function CartDrawer() {
  const { state, hideCart } = useUi()
  const { items, total, checkout } = useCart()
  const pathname = usePathname()
  const [checkingOut, setCheckingOut] = useState(false)
  const open = state.cartOpen

  useEscape(open, hideCart)

  // The checkout's promise settles when its overlay closes, which can be minutes later, so the
  // button's pending state lives in component state rather than in a transition.
  async function initCheckout() {
    setCheckingOut(true)
    try {
      await checkout({ redirect: false, returnUrl: pathname })
    }
    catch (err) {
      console.error('Could not checkout', err)
    }
    finally {
      setCheckingOut(false)
    }
  }

  return (
    <>
      <div className={open ? 'drawer-mask open' : 'drawer-mask'} onClick={hideCart} />
      <aside className={open ? 'drawer open' : 'drawer'} aria-label="Basket">
        <header>
          <h2>Basket</h2>
          <button className="close-btn" type="button" aria-label="Close" onClick={hideCart}>
            <CloseIcon />
          </button>
        </header>

        <div className="items">
          {items.length === 0 && <p className="empty">Your cart is empty.</p>}
          {items.map(item => <CartLine key={item.id} item={item} />)}
        </div>

        {items.length > 0 && (
          <div className="footer-row">
            <div className="total">
              <span className="total-label">Total</span>
              <span className="total-amount">{formatMoney(total)}</span>
            </div>
            <button type="button" className="checkout-btn" disabled={checkingOut} onClick={initCheckout}>
              {checkingOut ? 'Loading…' : 'Checkout'}
            </button>
          </div>
        )}
      </aside>
    </>
  )
}
